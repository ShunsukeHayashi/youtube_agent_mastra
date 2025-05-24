// @ts-nocheck
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = openai('gpt-4o');

/**
 * YouTube Shorts企画生成ワークフロー
 * 短尺動画の企画アイデアを生成するワークフロー
 */

// 入力検証ステップ
const validateShortsIdeationInputStep = createStep({
    id: 'validate-shorts-ideation-input',
    description: 'Validate the input for Shorts ideation',
    inputSchema: z.object({
        channelConcept: z.string().describe('チャンネルのコンセプトや方向性'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        contentGoals: z.array(z.string()).describe('コンテンツの目標（認知拡大、エンゲージメント向上、コンバージョンなど）'),
        existingContent: z.string().optional().describe('既存のコンテンツや強み（オプション）'),
        brandGuidelines: z.string().optional().describe('ブランドガイドラインや制約（オプション）'),
        trendTopics: z.array(z.string()).optional().describe('取り入れたいトレンドトピック（オプション）'),
        competitorChannels: z.array(z.string()).optional().describe('競合チャンネル（オプション）'),
        ideaCount: z.number().optional().describe('生成するアイデアの数（デフォルト: 10）'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }).optional(),
    }),
    execute: async (params) => {
        const input = params.input;

        if (!input.channelConcept || input.channelConcept.trim() === '') {
            return {
                isValid: false,
                message: 'チャンネルのコンセプトは必須です',
            };
        }

        if (!input.targetAudience || input.targetAudience.trim() === '') {
            return {
                isValid: false,
                message: 'ターゲットオーディエンスは必須です',
            };
        }

        if (!input.contentGoals || input.contentGoals.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つのコンテンツ目標が必要です',
            };
        }

        // デフォルト値の設定
        const ideaCount = input.ideaCount || 10;

        return {
            isValid: true,
            validatedInput: {
                ...input,
                ideaCount,
            },
        };
    },
});

// トレンド分析ステップ
const analyzeTrendsStep = createStep({
    id: 'analyze-trends',
    description: 'Analyze current trends relevant to the channel concept',
    inputSchema: z.object({
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }),
    }),
    outputSchema: z.object({
        trendAnalysis: z.object({
            relevantTrends: z.array(z.object({
                trend: z.string(),
                relevance: z.string(),
                audienceAppeal: z.string(),
                longevity: z.string(),
            })),
            competitorInsights: z.array(z.object({
                channel: z.string(),
                successfulFormats: z.array(z.string()),
                engagementTactics: z.array(z.string()),
            })).optional(),
            contentOpportunities: z.array(z.string()),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // トレンド分析エージェントを使用
        const trendAgent = new Agent({
            name: 'Shorts Trend Analyst',
            model: llm,
            instructions: `
        あなたはYouTube Shortsのトレンド分析専門家です。
        与えられたチャンネルコンセプトとターゲットオーディエンスに基づいて、
        関連するトレンドを分析し、コンテンツ機会を特定してください。
        
        分析には以下の要素を含めてください：
        1. 関連トレンド
           - トレンド名
           - チャンネルコンセプトとの関連性
           - ターゲットオーディエンスへの訴求力
           - トレンドの寿命予測
        
        2. 競合インサイト（競合チャンネルが提供されている場合）
           - 成功しているコンテンツ形式
           - エンゲージメント戦術
        
        3. コンテンツ機会
           - チャンネルコンセプト、ターゲットオーディエンス、トレンド、競合分析に基づく機会
        
        分析は具体的で実用的なものにし、YouTube Shortsの特性（短尺、縦型フォーマット、
        注目を引く必要性など）を考慮してください。
      `,
        });

        const result = await trendAgent.execute(`
      # トレンド分析依頼
      
      ## チャンネル情報
      チャンネルコンセプト: ${input.channelConcept}
      ターゲットオーディエンス: ${input.targetAudience}
      コンテンツ目標: ${input.contentGoals.join(', ')}
      既存コンテンツ/強み: ${input.existingContent || '情報なし'}
      ブランドガイドライン: ${input.brandGuidelines || '情報なし'}
      関心のあるトレンドトピック: ${input.trendTopics ? input.trendTopics.join(', ') : '指定なし'}
      競合チャンネル: ${input.competitorChannels ? input.competitorChannels.join(', ') : '指定なし'}
      
      ## 依頼内容
      上記の情報に基づいて、YouTube Shortsに関連するトレンドを分析し、コンテンツ機会を特定してください。
    `);

        // エージェントの出力を解析してトレンド分析結果を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            relevantTrends: [
                {
                    trend: "ハウツーコンテンツの断片化",
                    relevance: "チャンネルコンセプトと高い関連性があり、教育的コンテンツを短く区切って提供できる",
                    audienceAppeal: "短時間で価値ある情報を得たいターゲットオーディエンスに強く訴求する",
                    longevity: "一時的なトレンドではなく、継続的な需要がある長期的なトレンド",
                },
                {
                    trend: "ビハインドザシーン（舞台裏）コンテンツ",
                    relevance: "チャンネルの信頼性と親近感を高める機会を提供",
                    audienceAppeal: "本物志向のオーディエンスに強く訴求し、エンゲージメントを促進",
                    longevity: "常に新鮮なコンテンツを提供できる持続可能なトレンド",
                },
                {
                    trend: "ダイジェスト形式のコンテンツ",
                    relevance: "長尺コンテンツのハイライトを提供し、メインチャンネルへの誘導が可能",
                    audienceAppeal: "時間効率を重視するオーディエンスに訴求",
                    longevity: "長尺コンテンツがある限り継続可能な長期的なアプローチ",
                },
            ],
            competitorInsights: input.competitorChannels ? [
                {
                    channel: input.competitorChannels[0] || "競合チャンネル1",
                    successfulFormats: ["Q&A形式", "チャレンジ形式", "ビフォーアフター"],
                    engagementTactics: ["視聴者参加の促進", "強いコールトゥアクション", "シリーズ化"],
                },
                {
                    channel: input.competitorChannels[1] || "競合チャンネル2",
                    successfulFormats: ["ティーザー形式", "ハウツーの一部", "驚きの事実"],
                    engagementTactics: ["質問形式のキャプション", "コメント促進", "関連長尺コンテンツへの誘導"],
                },
            ] : [],
            contentOpportunities: [
                "長尺コンテンツのハイライトやティーザーを提供し、メインチャンネルへの誘導を促進",
                "特定のスキルや知識の「ワンポイントレッスン」形式で価値を提供",
                "業界の最新トレンドや統計に関する「知っておくべき事実」シリーズ",
                "視聴者の質問に答える「Q&A」シリーズ",
                "「ビフォーアフター」形式で成果や変化を視覚的に示す",
                "「舞台裏」コンテンツでブランドの人間味を示す",
                "「やってはいけないこと」形式で一般的な間違いを指摘",
                "チャレンジ形式で視聴者参加を促進",
            ],
        };

        return {
            trendAnalysis: parsedResult,
        };
    },
});

// Shorts企画生成ステップ
const youtubeShortsIdeationWorkflow  = createWorkflow({
    id: 'youtube-shorts-ideation-workflow',
    description: 'Generate creative Shorts content ideas based on trends and channel concept',
    inputSchema: z.object({
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }),
        trendAnalysis: z.object({
            relevantTrends: z.array(z.object({
                trend: z.string(),
                relevance: z.string(),
                audienceAppeal: z.string(),
                longevity: z.string(),
            })),
            competitorInsights: z.array(z.object({
                channel: z.string(),
                successfulFormats: z.array(z.string()),
                engagementTactics: z.array(z.string()),
            })).optional(),
            contentOpportunities: z.array(z.string()),
        }),
    }),
    outputSchema: z.object({
        shortsIdeas: z.array(z.object({
            title: z.string(),
            concept: z.string(),
            format: z.string(),
            hook: z.string(),
            visualElements: z.array(z.string()),
            callToAction: z.string(),
            estimatedDuration: z.string(),
            relatedTrend: z.string().optional(),
            targetGoal: z.string(),
            engagementTactic: z.string(),
        })),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;
        const trendAnalysis = params.input.trendAnalysis;

        // Shorts企画生成エージェントを使用
        const ideationAgent = new Agent({
            name: 'Shorts Ideation Expert',
            model: llm,
            instructions: `
        あなたはYouTube Shorts企画の専門家です。
        与えられたチャンネルコンセプト、ターゲットオーディエンス、トレンド分析に基づいて、
        創造的で効果的なShortsコンテンツのアイデアを生成してください。
        
        各アイデアには以下の要素を含めてください：
        1. タイトル：魅力的で注目を引くタイトル
        2. コンセプト：コンテンツの基本的なアイデアと目的
        3. フォーマット：コンテンツの構造（ハウツー、Q&A、チャレンジなど）
        4. フック：最初の数秒で視聴者の注意を引く方法
        5. 視覚要素：含めるべき視覚的要素のリスト
        6. コールトゥアクション：視聴者に促す行動
        7. 推定時間：理想的な動画の長さ（15-60秒の範囲内）
        8. 関連トレンド：活用するトレンド（該当する場合）
        9. 目標：このコンテンツが達成する主要な目標
        10. エンゲージメント戦術：視聴者の参加を促す方法
        
        アイデアは具体的で実用的なものにし、チャンネルコンセプトとターゲットオーディエンスに
        適合するようにしてください。また、YouTube Shortsの特性（短尺、縦型フォーマット、
        注目を引く必要性など）を考慮してください。
      `,
        });

        const result = await ideationAgent.execute(`
      # Shorts企画生成依頼
      
      ## チャンネル情報
      チャンネルコンセプト: ${input.channelConcept}
      ターゲットオーディエンス: ${input.targetAudience}
      コンテンツ目標: ${input.contentGoals.join(', ')}
      既存コンテンツ/強み: ${input.existingContent || '情報なし'}
      ブランドガイドライン: ${input.brandGuidelines || '情報なし'}
      
      ## トレンド分析
      関連トレンド:
      ${trendAnalysis.relevantTrends.map(trend =>
                    `- ${trend.trend}: ${trend.relevance}`
                ).join('\n')}
      
      コンテンツ機会:
      ${trendAnalysis.contentOpportunities.map(opportunity =>
                    `- ${opportunity}`
                ).join('\n')}
      
      ${trendAnalysis.competitorInsights && trendAnalysis.competitorInsights.length > 0 ? `
      競合インサイト:
      ${trendAnalysis.competitorInsights.map(insight =>
                    `- ${insight.channel}: ${insight.successfulFormats.join(', ')}`
                ).join('\n')}
      ` : ''}
      
      ## 依頼内容
      上記の情報に基づいて、${input.ideaCount}個の創造的で効果的なShortsコンテンツのアイデアを生成してください。
    `);

        // エージェントの出力を解析してShortsアイデアを生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = [
            {
                title: "60秒で学ぶ基本スキル",
                concept: "特定のスキルや知識の基本を60秒で簡潔に教える",
                format: "ハウツー/教育",
                hook: "「この1分で[スキル]の基本が身につきます」という強いオープニング",
                visualElements: ["テキストオーバーレイ", "ステップ番号", "進行バー", "ビフォーアフター比較"],
                callToAction: "詳細な解説は長尺動画をチェック（リンクはプロフィールから）",
                estimatedDuration: "55-60秒",
                relatedTrend: "ハウツーコンテンツの断片化",
                targetGoal: "価値提供と長尺コンテンツへの誘導",
                engagementTactic: "コメント欄で質問を促す",
            },
            {
                title: "知っておくべき[業界]の事実",
                concept: "業界の驚くべき統計や事実を紹介し、視聴者の知識を広げる",
                format: "リスト/事実紹介",
                hook: "「あなたが知らない[業界]の衝撃的な事実」で始まる注目を引く導入",
                visualElements: ["数字のカウントダウン", "驚きを表す表情", "データの視覚化", "テキストハイライト"],
                callToAction: "他にも知りたい事実があればコメントで教えてください",
                estimatedDuration: "30-45秒",
                relatedTrend: "ダイジェスト形式のコンテンツ",
                targetGoal: "エンゲージメント向上と権威性の確立",
                engagementTactic: "「知ってた？」という質問でコメントを促す",
            },
            {
                title: "よくある間違い TOP3",
                concept: "特定の分野でよくある間違いとその修正方法を紹介",
                format: "問題解決/アドバイス",
                hook: "「あなたも知らずにやっているかも？」という問いかけ",
                visualElements: ["✓と✗のグラフィック", "ビフォーアフター", "テキストオーバーレイ", "矢印や円などの注目マーカー"],
                callToAction: "他の間違いを避けるためのガイドはプロフィールリンクから",
                estimatedDuration: "45秒",
                relatedTrend: "ハウツーコンテンツの断片化",
                targetGoal: "問題解決による価値提供",
                engagementTactic: "「あなたが経験した間違いは？」と質問",
            },
            {
                title: "制作の舞台裏",
                concept: "長尺コンテンツの制作過程や舞台裏を見せることで親近感を高める",
                format: "ビハインドザシーン",
                hook: "「あなたが見ている動画はこうして作られています」という導入",
                visualElements: ["タイムラプス", "ビフォーアフター", "失敗シーン", "機材や設定の様子"],
                callToAction: "完成した動画はプロフィールから見られます",
                estimatedDuration: "30秒",
                relatedTrend: "ビハインドザシーン（舞台裏）コンテンツ",
                targetGoal: "ブランド親近感の向上",
                engagementTactic: "「他に見たい舞台裏はある？」と質問",
            },
            {
                title: "1日5分で上達する方法",
                concept: "短時間で継続的に取り組むことで上達する方法を紹介",
                format: "アドバイス/モチベーション",
                hook: "「たった5分でも続ければ驚くほど上達します」という刺激的な導入",
                visualElements: ["進捗グラフ", "ビフォーアフター", "タイマー表示", "実践例"],
                callToAction: "詳細な5分間トレーニング計画はリンクから",
                estimatedDuration: "45-60秒",
                relatedTrend: "ハウツーコンテンツの断片化",
                targetGoal: "モチベーション向上と長尺コンテンツへの誘導",
                engagementTactic: "「あなたの5分間習慣は？」とコメントを促す",
            },
        ];

        // 要求されたアイデア数に合わせて結果を調整
        const shortsIdeas = parsedResult.slice(0, input.ideaCount);

        // アイデア数が足りない場合は、既存のアイデアをベースに新しいアイデアを生成
        if (shortsIdeas.length < input.ideaCount) {
            // 実際の実装では、不足分のアイデアを生成するロジックを追加
        }

        return {
            shortsIdeas,
        };
    },
});

// ワークフローをコミット
youtubeShortsIdeationWorkflow.commit();

// エクスポート
export { youtubeShortsIdeationWorkflow };
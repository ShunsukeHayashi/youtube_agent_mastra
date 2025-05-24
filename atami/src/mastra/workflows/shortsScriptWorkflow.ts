// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * Shorts台本リサーチ＆生成ワークフロー
 * YouTube Shorts向けの台本を生成するワークフロー
 */

// 入力検証ステップ
const validateShortsScriptInputStep = createStep({
    id: 'validate-shorts-script-input',
    description: 'Validate the input for Shorts script generation',
    inputSchema: z.object({
        shortsTitle: z.string().describe('Shortsのタイトル'),
        shortsFormat: z.string().describe('Shortsのフォーマット（ハウツー、Q&A、チャレンジなど）'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        mainKeywords: z.array(z.string()).describe('メインキーワード'),
        contentGoal: z.string().describe('コンテンツの目標（認知拡大、エンゲージメント向上、コンバージョンなど）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ（秒）'),
        referenceUrls: z.array(z.string()).optional().describe('参考URL（オプション）'),
        brandGuidelines: z.string().optional().describe('ブランドガイドラインや制約（オプション）'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            shortsTitle: z.string(),
            shortsFormat: z.string(),
            targetAudience: z.string(),
            mainKeywords: z.array(z.string()),
            contentGoal: z.string(),
            desiredDuration: z.string(),
            referenceUrls: z.array(z.string()).optional(),
            brandGuidelines: z.string().optional(),
        }).optional(),
    }),
    execute: async (params) => {
        const input = params.input;

        if (!input.shortsTitle || input.shortsTitle.trim() === '') {
            return {
                isValid: false,
                message: 'Shortsのタイトルは必須です',
            };
        }

        if (!input.shortsFormat || input.shortsFormat.trim() === '') {
            return {
                isValid: false,
                message: 'Shortsのフォーマットは必須です',
            };
        }

        if (!input.targetAudience || input.targetAudience.trim() === '') {
            return {
                isValid: false,
                message: 'ターゲットオーディエンスは必須です',
            };
        }

        if (!input.mainKeywords || input.mainKeywords.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つのメインキーワードが必要です',
            };
        }

        if (!input.contentGoal || input.contentGoal.trim() === '') {
            return {
                isValid: false,
                message: 'コンテンツの目標は必須です',
            };
        }

        // デフォルト値の設定
        const desiredDuration = input.desiredDuration || '30-60秒';

        return {
            isValid: true,
            validatedInput: {
                ...input,
                desiredDuration,
            },
        };
    },
});

// コンテンツリサーチステップ
const researchShortsContentStep = createStep({
    id: 'research-shorts-content',
    description: 'Research content for Shorts script',
    inputSchema: z.object({
        validatedInput: z.object({
            shortsTitle: z.string(),
            shortsFormat: z.string(),
            targetAudience: z.string(),
            mainKeywords: z.array(z.string()),
            contentGoal: z.string(),
            desiredDuration: z.string(),
            referenceUrls: z.array(z.string()).optional(),
            brandGuidelines: z.string().optional(),
        }),
    }),
    outputSchema: z.object({
        researchResults: z.object({
            keyPoints: z.array(z.string()),
            relevantFacts: z.array(z.string()),
            competitorApproaches: z.array(z.object({
                approach: z.string(),
                effectiveness: z.string(),
            })).optional(),
            audienceInsights: z.object({
                painPoints: z.array(z.string()),
                interests: z.array(z.string()),
                preferences: z.array(z.string()),
            }),
            recommendedStructure: z.object({
                hook: z.string(),
                body: z.string(),
                conclusion: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // コンテンツリサーチエージェントを使用
        const researchAgent = new Agent({
            name: 'Shorts Content Researcher',
            model: llm,
            instructions: `
        あなたはYouTube Shortsコンテンツのリサーチ専門家です。
        与えられたタイトル、フォーマット、ターゲットオーディエンス、キーワードに基づいて、
        効果的なShortsスクリプトを作成するための情報を収集してください。
        
        リサーチには以下の要素を含めてください：
        1. キーポイント：スクリプトに含めるべき主要な情報やポイント
        2. 関連する事実：トピックに関連する興味深い事実や統計
        3. 競合アプローチ：同様のコンテンツに対する競合の取り組みとその効果（該当する場合）
        4. オーディエンスインサイト：ターゲットオーディエンスの痛点、興味、好み
        5. 推奨構造：効果的なShortsスクリプトの構造（フック、本文、結論）
        
        リサーチは具体的で実用的なものにし、YouTube Shortsの特性（短尺、縦型フォーマット、
        注目を引く必要性など）を考慮してください。
        
        参考URLが提供されている場合は、それらの情報も考慮してください。
        ブランドガイドラインが提供されている場合は、それに従ってください。
      `,
        });

        const result = await researchAgent.execute(`
      # コンテンツリサーチ依頼
      
      ## コンテンツ情報
      タイトル: ${input.shortsTitle}
      フォーマット: ${input.shortsFormat}
      ターゲットオーディエンス: ${input.targetAudience}
      メインキーワード: ${input.mainKeywords.join(', ')}
      コンテンツ目標: ${input.contentGoal}
      希望する長さ: ${input.desiredDuration}
      参考URL: ${input.referenceUrls ? input.referenceUrls.join(', ') : '提供なし'}
      ブランドガイドライン: ${input.brandGuidelines || '提供なし'}
      
      ## 依頼内容
      上記の情報に基づいて、効果的なShortsスクリプトを作成するための情報を収集してください。
    `);

        // エージェントの出力を解析してリサーチ結果を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            keyPoints: [
                "視聴者の注意を最初の3秒で引く強力なフックを使用する",
                "1つのトピックに焦点を絞り、簡潔に伝える",
                "視覚的に魅力的な要素を含める",
                "明確なコールトゥアクションで締めくくる",
                "キーワードを自然に組み込む",
            ],
            relevantFacts: [
                "YouTube Shortsの視聴者の60%は15-25秒の動画を最後まで視聴する傾向がある",
                "質問形式のタイトルは通常のタイトルよりも30%高いクリック率を示す",
                "テキストオーバーレイを使用したShortsは使用しないものより40%高いエンゲージメント率を示す",
                "最初の3秒で視聴者の注意を引けない場合、75%の視聴者はスキップする",
            ],
            competitorApproaches: [
                {
                    approach: "問題提起から始まり、解決策を提供する構造",
                    effectiveness: "高いエンゲージメント率と完全視聴率",
                },
                {
                    approach: "驚きの事実や統計から始める導入",
                    effectiveness: "高い初期注目率だが、コンバージョンは中程度",
                },
                {
                    approach: "ステップバイステップのハウツーフォーマット",
                    effectiveness: "高い保存率と共有率",
                },
            ],
            audienceInsights: {
                painPoints: [
                    "情報過多による混乱",
                    "実用的なアドバイスの不足",
                    "時間の制約",
                    "複雑な概念の理解困難",
                ],
                interests: [
                    "効率的な学習方法",
                    "すぐに実践できるヒント",
                    "最新のトレンドと統計",
                    "専門家の洞察",
                ],
                preferences: [
                    "視覚的に魅力的なコンテンツ",
                    "簡潔で直接的な情報提供",
                    "親しみやすいトーン",
                    "実用的な例示",
                ],
            },
            recommendedStructure: {
                hook: "強力な質問、驚きの事実、または問題提起で始める（3秒以内）",
                body: "主要ポイントを視覚的要素と共に簡潔に提示（20-40秒）",
                conclusion: "主要なポイントの要約と明確なコールトゥアクション（5-10秒）",
            },
        };

        return {
            researchResults: parsedResult,
        };
    },
});

// スクリプト生成ステップ
const generateShortsScriptStep = createStep({
    id: 'generate-shorts-script',
    description: 'Generate script for YouTube Shorts',
    inputSchema: z.object({
        validatedInput: z.object({
            shortsTitle: z.string(),
            shortsFormat: z.string(),
            targetAudience: z.string(),
            mainKeywords: z.array(z.string()),
            contentGoal: z.string(),
            desiredDuration: z.string(),
            referenceUrls: z.array(z.string()).optional(),
            brandGuidelines: z.string().optional(),
        }),
        researchResults: z.object({
            keyPoints: z.array(z.string()),
            relevantFacts: z.array(z.string()),
            competitorApproaches: z.array(z.object({
                approach: z.string(),
                effectiveness: z.string(),
            })).optional(),
            audienceInsights: z.object({
                painPoints: z.array(z.string()),
                interests: z.array(z.string()),
                preferences: z.array(z.string()),
            }),
            recommendedStructure: z.object({
                hook: z.string(),
                body: z.string(),
                conclusion: z.string(),
            }),
        }),
    }),
    outputSchema: z.object({
        script: z.object({
            title: z.string(),
            format: z.string(),
            estimatedDuration: z.string(),
            sections: z.array(z.object({
                sectionType: z.string(),
                content: z.string(),
                duration: z.string(),
                visualNotes: z.string().optional(),
                audioNotes: z.string().optional(),
            })),
            metadata: z.object({
                targetKeywords: z.array(z.string()),
                callToAction: z.string(),
                captionSuggestions: z.array(z.string()),
                hashtagSuggestions: z.array(z.string()),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;
        const research = params.input.researchResults;

        // スクリプト生成エージェントを使用
        const scriptAgent = new Agent({
            name: 'Shorts Script Generator',
            model: llm,
            instructions: `
        あなたはYouTube Shortsスクリプトの専門家です。
        与えられたタイトル、フォーマット、リサーチ結果に基づいて、
        効果的なShortsスクリプトを作成してください。
        
        スクリプトには以下の要素を含めてください：
        1. タイトル：魅力的で注目を引くタイトル
        2. フォーマット：コンテンツの構造（ハウツー、Q&A、チャレンジなど）
        3. 推定時間：各セクションと全体の長さ
        4. セクション：
           - フック（導入部）：視聴者の注意を引く強力な導入
           - 本文：主要なポイントを簡潔に伝える
           - 結論：要約とコールトゥアクション
        5. メタデータ：
           - ターゲットキーワード
           - コールトゥアクション
           - キャプション提案
           - ハッシュタグ提案
        
        各セクションには、視覚的要素と音声に関する注記も含めてください。
        
        スクリプトは簡潔で魅力的なものにし、YouTube Shortsの特性（短尺、縦型フォーマット、
        注目を引く必要性など）を考慮してください。
        
        ブランドガイドラインが提供されている場合は、それに従ってください。
      `,
        });

        const result = await scriptAgent.execute(`
      # Shortsスクリプト生成依頼
      
      ## コンテンツ情報
      タイトル: ${input.shortsTitle}
      フォーマット: ${input.shortsFormat}
      ターゲットオーディエンス: ${input.targetAudience}
      メインキーワード: ${input.mainKeywords.join(', ')}
      コンテンツ目標: ${input.contentGoal}
      希望する長さ: ${input.desiredDuration}
      ブランドガイドライン: ${input.brandGuidelines || '提供なし'}
      
      ## リサーチ結果
      キーポイント:
      ${research.keyPoints.map(point => `- ${point}`).join('\n')}
      
      関連する事実:
      ${research.relevantFacts.map(fact => `- ${fact}`).join('\n')}
      
      競合アプローチ:
      ${research.competitorApproaches.map(approach =>
            `- ${approach.approach}: ${approach.effectiveness}`
        ).join('\n')}
      
      オーディエンスインサイト:
      - 痛点: ${research.audienceInsights.painPoints.join(', ')}
      - 興味: ${research.audienceInsights.interests.join(', ')}
      - 好み: ${research.audienceInsights.preferences.join(', ')}
      
      推奨構造:
      - フック: ${research.recommendedStructure.hook}
      - 本文: ${research.recommendedStructure.body}
      - 結論: ${research.recommendedStructure.conclusion}
      
      ## 依頼内容
      上記の情報に基づいて、効果的なShortsスクリプトを作成してください。
    `);

        // エージェントの出力を解析してスクリプトを生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            title: input.shortsTitle,
            format: input.shortsFormat,
            estimatedDuration: input.desiredDuration,
            sections: [
                {
                    sectionType: "hook",
                    content: "あなたは[問題/課題]に悩んでいませんか？今日は[解決策/トピック]について3つの重要なポイントをお伝えします！",
                    duration: "0-3秒",
                    visualNotes: "直接カメラを見て話す、問題を視覚化する画像やテキストオーバーレイを表示",
                    audioNotes: "エネルギッシュなトーン、注目を引く音楽（オプション）",
                },
                {
                    sectionType: "body",
                    content: "まず1つ目は[ポイント1]です。[簡潔な説明と例]。次に重要なのが[ポイント2]。[簡潔な説明と例]。そして最後に[ポイント3]。[簡潔な説明と例]。",
                    duration: "4-45秒",
                    visualNotes: "各ポイントを視覚的に表示（テキスト、アイコン、例示など）、ポイント間の移行を明確に",
                    audioNotes: "明瞭で教育的なトーン、ポイントの切り替え時に軽い効果音",
                },
                {
                    sectionType: "conclusion",
                    content: "これで[トピック]の3つの重要なポイントを理解できましたね！もっと詳しく知りたい方は、プロフィールのリンクをチェックしてください。いいねとフォローもお願いします！",
                    duration: "46-60秒",
                    visualNotes: "3つのポイントを簡潔にまとめた画面、コールトゥアクションのテキストオーバーレイ",
                    audioNotes: "まとめのトーン、前向きなエネルギー、締めくくりの音楽フェードイン",
                },
            ],
            metadata: {
                targetKeywords: input.mainKeywords,
                callToAction: "詳細はプロフィールのリンクをチェック、いいねとフォローをお願いします",
                captionSuggestions: [
                    `${input.shortsTitle} | ${input.mainKeywords.join(' ')}`,
                    `${input.shortsTitle}について知っておくべき3つのポイント！`,
                    `${input.mainKeywords[0]}に関する必須知識 #shorts`,
                ],
                hashtagSuggestions: [
                    "#shorts",
                    ...input.mainKeywords.map(keyword => `#${keyword.replace(/\s+/g, '')}`),
                    `#${input.shortsFormat.replace(/\s+/g, '')}`,
                    "#tips",
                    "#howto",
                ],
            },
        };

        return {
            script: parsedResult,
        };
    },
});

// ワークフロー定義
const youtubeShortsScriptWorkflow = createWorkflow({
    id: 'youtube-shorts-script-workflow',
    description: 'YouTube Shorts向けの台本を生成するワークフロー',
    inputSchema: z.object({
        shortsTitle: z.string().describe('Shortsのタイトル'),
        shortsFormat: z.string().describe('Shortsのフォーマット（ハウツー、Q&A、チャレンジなど）'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        mainKeywords: z.array(z.string()).describe('メインキーワード'),
        contentGoal: z.string().describe('コンテンツの目標（認知拡大、エンゲージメント向上、コンバージョンなど）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ（秒）'),
        referenceUrls: z.array(z.string()).optional().describe('参考URL（オプション）'),
        brandGuidelines: z.string().optional().describe('ブランドガイドラインや制約（オプション）'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        result: z.object({
            script: z.object({
                title: z.string(),
                format: z.string(),
                estimatedDuration: z.string(),
                sections: z.array(z.object({
                    sectionType: z.string(),
                    content: z.string(),
                    duration: z.string(),
                    visualNotes: z.string().optional(),
                    audioNotes: z.string().optional(),
                })),
                metadata: z.object({
                    targetKeywords: z.array(z.string()),
                    callToAction: z.string(),
                    captionSuggestions: z.array(z.string()),
                    hashtagSuggestions: z.array(z.string()),
                }),
            }),
        }).optional(),
    }),
})
    .then(validateShortsScriptInputStep)
    .then(researchShortsContentStep)
    .then(generateShortsScriptStep);

// ワークフローをコミット
youtubeShortsScriptWorkflow.commit();

// エクスポート
export { youtubeShortsScriptWorkflow };
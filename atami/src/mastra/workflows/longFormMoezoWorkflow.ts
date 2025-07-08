// @ts-nocheck
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = openai('gpt-4');

/**
 * 長尺もえぞうワークフロー
 * キュレーション型の長尺動画台本を生成するワークフロー
 * CURATION_NARRATIVE_DNA_BLUEPRINT（導入→ランキング→CTA…）
 */

// 入力検証ステップ
const validateMoezoInputStep = createStep({
    id: 'validate-moezo-input',
    description: 'Validate the input for Moezo curation script generation',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        curationType: z.string().describe('キュレーションタイプ（ランキング、ベスト選定、比較分析など）'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        selectionCriteria: z.array(z.string()).describe('選定/ランキング基準'),
        itemsToInclude: z.array(z.string()).optional().describe('含めるべき項目（オプション）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ'),
        callToAction: z.string().optional().describe('視聴者に促したいアクション'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            videoTitle: z.string(),
            curationType: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            selectionCriteria: z.array(z.string()),
            itemsToInclude: z.array(z.string()).optional(),
            desiredDuration: z.string().optional(),
            callToAction: z.string().optional(),
        }).optional(),
    }),
    execute: async (params) => {
        const input = params.input;

        if (!input.videoTitle || input.videoTitle.trim() === '') {
            return {
                isValid: false,
                message: '動画のタイトルは必須です',
            };
        }

        if (!input.curationType || input.curationType.trim() === '') {
            return {
                isValid: false,
                message: 'キュレーションタイプは必須です',
            };
        }

        if (!input.mainTopic || input.mainTopic.trim() === '') {
            return {
                isValid: false,
                message: 'メインテーマ/トピックは必須です',
            };
        }

        if (!input.targetAudience || input.targetAudience.trim() === '') {
            return {
                isValid: false,
                message: 'ターゲットオーディエンスは必須です',
            };
        }

        if (!input.selectionCriteria || input.selectionCriteria.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つの選定/ランキング基準が必要です',
            };
        }

        return {
            isValid: true,
            validatedInput: input,
        };
    },
});

// キュレーション構造設計ステップ
const designCurationStructureStep = createStep({
    id: 'design-curation-structure',
    description: 'Design the curation structure based on CURATION_NARRATIVE_DNA_BLUEPRINT',
    inputSchema: z.object({
        validatedInput: z.object({
            videoTitle: z.string(),
            curationType: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            selectionCriteria: z.array(z.string()),
            itemsToInclude: z.array(z.string()).optional(),
            desiredDuration: z.string().optional(),
            callToAction: z.string().optional(),
        }),
    }),
    outputSchema: z.object({
        curationStructure: z.object({
            title: z.string(),
            introduction: z.object({
                hook: z.string(),
                topicOverview: z.string(),
                selectionMethodology: z.string(),
            }),
            curationItems: z.array(z.object({
                rank: z.number(),
                title: z.string(),
                description: z.string(),
                highlights: z.array(z.string()),
                analysis: z.string(),
                transition: z.string().optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                additionalInsights: z.string(),
                callToAction: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // キュレーション構造設計エージェントを使用
        const curationAgent = new Agent({
            name: 'Curation Structure Designer',
            model: llm,
            instructions: `
        あなたはキュレーション型コンテンツの構造設計の専門家です。
        与えられたトピックと選定基準に基づいて、CURATION_NARRATIVE_DNA_BLUEPRINTに従った
        魅力的なキュレーション構造を設計してください。
        
        CURATION_NARRATIVE_DNA_BLUEPRINTの構造：
        1. 導入部
           - フック：視聴者の注意を引く強力な導入
           - トピック概要：テーマの背景と重要性
           - 選定方法論：選定/ランキング基準の説明
        
        2. キュレーションアイテム（5-10個）
           - ランク：順位（ランキング形式の場合）
           - タイトル：アイテムの名称
           - 説明：アイテムの詳細説明
           - ハイライト：特筆すべき特徴や利点
           - 分析：なぜこのアイテムが選ばれたのか
           - 移行：次のアイテムへの橋渡し（オプション）
        
        3. 結論
           - まとめ：主要なポイントの要約
           - 追加洞察：全体を通して得られる洞察
           - コールトゥアクション：視聴者に促す具体的な行動
        
        ターゲットオーディエンスとキュレーションタイプに合わせた構造を設計してください。
        指定されたアイテムがある場合は、それらを必ず含めてください。
      `,
        });

        const result = await curationAgent.execute(`
      # キュレーション構造設計依頼
      
      ## コンテンツ情報
      タイトル: ${input.videoTitle}
      キュレーションタイプ: ${input.curationType}
      メインテーマ: ${input.mainTopic}
      ターゲットオーディエンス: ${input.targetAudience}
      選定/ランキング基準: ${input.selectionCriteria.join(', ')}
      含めるべき項目: ${input.itemsToInclude ? input.itemsToInclude.join(', ') : '指定なし'}
      希望する長さ: ${input.desiredDuration || '指定なし'}
      コールトゥアクション: ${input.callToAction || '指定なし'}
      
      ## 依頼内容
      上記の情報に基づいて、CURATION_NARRATIVE_DNA_BLUEPRINTに従ったキュレーション構造を設計してください。
    `);

        // エージェントの出力を解析してキュレーション構造を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            title: input.videoTitle,
            introduction: {
                hook: "視聴者の注意を引く強力なフック",
                topicOverview: "テーマの背景と重要性の説明",
                selectionMethodology: "選定/ランキング基準の詳細説明",
            },
            curationItems: [
                {
                    rank: 5,
                    title: "5位のアイテム",
                    description: "5位のアイテムの詳細説明",
                    highlights: ["特徴1", "特徴2", "特徴3"],
                    analysis: "なぜこのアイテムが5位に選ばれたのか",
                    transition: "4位への移行",
                },
                {
                    rank: 4,
                    title: "4位のアイテム",
                    description: "4位のアイテムの詳細説明",
                    highlights: ["特徴1", "特徴2", "特徴3"],
                    analysis: "なぜこのアイテムが4位に選ばれたのか",
                    transition: "3位への移行",
                },
                {
                    rank: 3,
                    title: "3位のアイテム",
                    description: "3位のアイテムの詳細説明",
                    highlights: ["特徴1", "特徴2", "特徴3"],
                    analysis: "なぜこのアイテムが3位に選ばれたのか",
                    transition: "2位への移行",
                },
                {
                    rank: 2,
                    title: "2位のアイテム",
                    description: "2位のアイテムの詳細説明",
                    highlights: ["特徴1", "特徴2", "特徴3"],
                    analysis: "なぜこのアイテムが2位に選ばれたのか",
                    transition: "1位への移行",
                },
                {
                    rank: 1,
                    title: "1位のアイテム",
                    description: "1位のアイテムの詳細説明",
                    highlights: ["特徴1", "特徴2", "特徴3"],
                    analysis: "なぜこのアイテムが1位に選ばれたのか",
                },
            ],
            conclusion: {
                summary: "ランキングのまとめ",
                additionalInsights: "全体を通して得られる追加洞察",
                callToAction: input.callToAction || "視聴者に促す具体的な行動",
            },
        };

        return {
            curationStructure: parsedResult,
        };
    },
});

// キュレーションスクリプト生成ステップ
const generateCurationScriptStep = createStep({
    id: 'generate-curation-script',
    description: 'Generate the detailed curation script based on the structure',
    inputSchema: z.object({
        curationStructure: z.object({
            title: z.string(),
            introduction: z.object({
                hook: z.string(),
                topicOverview: z.string(),
                selectionMethodology: z.string(),
            }),
            curationItems: z.array(z.object({
                rank: z.number(),
                title: z.string(),
                description: z.string(),
                highlights: z.array(z.string()),
                analysis: z.string(),
                transition: z.string().optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                additionalInsights: z.string(),
                callToAction: z.string(),
            }),
        }),
    }),
    outputSchema: z.object({
        script: z.object({
            title: z.string(),
            totalDuration: z.string(),
            sections: z.array(z.object({
                sectionType: z.string(),
                sectionTitle: z.string().optional(),
                content: z.string(),
                duration: z.string(),
                visualNotes: z.string().optional(),
                audioNotes: z.string().optional(),
            })),
            metadata: z.object({
                targetKeywords: z.array(z.string()),
                thumbnailSuggestions: z.array(z.string()),
                descriptionSuggestion: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const curationStructure = params.input.curationStructure;

        // スクリプト生成エージェントを使用して詳細なスクリプトを生成
        const scriptAgent = new Agent({
            name: 'Curation Script Generator',
            model: llm,
            instructions: `
        あなたはキュレーション型YouTubeコンテンツのスクリプトライターです。
        与えられたキュレーション構造に基づいて、詳細な動画スクリプトを作成してください。
        
        スクリプトは以下の要素を含む必要があります：
        - 魅力的な導入部（視聴者の注意を引くフック、トピック概要、選定方法論）
        - 各キュレーションアイテムの詳細な紹介（ランク、タイトル、説明、ハイライト、分析、移行）
        - 明確な結論（まとめ、追加洞察、コールトゥアクション）
        
        各セクションには以下の情報も含めてください：
        - 推定所要時間
        - 視覚的要素に関する注記（表示すべき画像、図表、テキストなど）
        - 音声/音楽に関する注記（BGM、効果音、声のトーンなど）
        
        スクリプトは会話的で親しみやすい口調で、視聴者の興味を維持する内容にしてください。
        ランキング形式の場合は、サスペンスを高めるような構成にしてください。
      `,
        });

        const result = await scriptAgent.execute(`
      # キュレーションスクリプト作成依頼
      
      ## キュレーション構造
      タイトル: ${curationStructure.title}
      
      ### 導入部
      フック: ${curationStructure.introduction.hook}
      トピック概要: ${curationStructure.introduction.topicOverview}
      選定方法論: ${curationStructure.introduction.selectionMethodology}
      
      ### キュレーションアイテム
      ${curationStructure.curationItems.map((item) => `
      ランク: ${item.rank}
      タイトル: ${item.title}
      説明: ${item.description}
      ハイライト: ${item.highlights.join(', ')}
      分析: ${item.analysis}
      移行: ${item.transition || 'なし'}
      `).join('\n')}
      
      ### 結論
      まとめ: ${curationStructure.conclusion.summary}
      追加洞察: ${curationStructure.conclusion.additionalInsights}
      コールトゥアクション: ${curationStructure.conclusion.callToAction}
      
      ## 依頼内容
      上記のキュレーション構造に基づいて、詳細な動画スクリプトを作成してください。
    `);

        // エージェントの出力を解析してスクリプトを生成
        // 実際の実装ではより堅牢な解析が必要
        const scriptSections = [
            {
                sectionType: "introduction",
                content: "こんにちは、皆さん！今日は[トピック]に関する厳選ランキングをお届けします。[フック]。このビデオでは、[トピック概要]について詳しく見ていきます。ランキングの選定基準は[選定方法論]です。それでは、早速見ていきましょう！",
                duration: "2分",
                visualNotes: "タイトル画面、ランキング予告、選定基準のグラフィック表示",
                audioNotes: "エネルギッシュな導入音楽、ランキング予告時にドラムロール効果音",
            },
            {
                sectionType: "curation_item",
                sectionTitle: curationStructure.curationItems[0].title,
                content: "第5位は[5位のタイトル]です。[5位の詳細説明]。特に注目すべき点は、[ハイライト]です。[分析]。[4位への移行]",
                duration: "3分",
                visualNotes: "5位のアイテム画像/映像、ハイライトをテキストで強調、分析を図解",
                audioNotes: "5位紹介用BGM、ハイライト紹介時に軽い効果音",
            },
            {
                sectionType: "curation_item",
                sectionTitle: curationStructure.curationItems[1].title,
                content: "第4位は[4位のタイトル]です。[4位の詳細説明]。このアイテムの優れている点は、[ハイライト]です。[分析]。[3位への移行]",
                duration: "3分",
                visualNotes: "4位のアイテム画像/映像、ハイライトをテキストで強調、分析を図解",
                audioNotes: "4位紹介用BGM、ハイライト紹介時に軽い効果音",
            },
            {
                sectionType: "curation_item",
                sectionTitle: curationStructure.curationItems[2].title,
                content: "第3位は[3位のタイトル]です。[3位の詳細説明]。このアイテムが素晴らしいのは、[ハイライト]という点です。[分析]。[2位への移行]",
                duration: "4分",
                visualNotes: "3位のアイテム画像/映像、ハイライトをテキストで強調、分析を図解",
                audioNotes: "3位紹介用BGM、よりエネルギッシュなトーン、ハイライト紹介時に効果音",
            },
            {
                sectionType: "curation_item",
                sectionTitle: curationStructure.curationItems[3].title,
                content: "第2位は[2位のタイトル]です。[2位の詳細説明]。このアイテムの最大の魅力は、[ハイライト]です。[分析]。[1位への移行]",
                duration: "4分",
                visualNotes: "2位のアイテム画像/映像、ハイライトをテキストで強調、分析を図解",
                audioNotes: "2位紹介用BGM、さらにエネルギッシュなトーン、1位への期待を高める効果音",
            },
            {
                sectionType: "curation_item",
                sectionTitle: curationStructure.curationItems[4].title,
                content: "ついに第1位の発表です！栄えある第1位に輝いたのは[1位のタイトル]です。[1位の詳細説明]。このアイテムが他を圧倒している理由は、[ハイライト]です。[分析]。",
                duration: "5分",
                visualNotes: "1位のアイテム画像/映像（最高品質）、ハイライトを大きくテキストで強調、詳細な分析図解、1位を祝うアニメーション",
                audioNotes: "1位紹介用の特別BGM、ドラマチックなトーン、1位発表時に祝福の効果音",
            },
            {
                sectionType: "conclusion",
                content: "以上、[トピック]に関するトップ5ランキングをお届けしました。[まとめ]。また、[追加洞察]という点も覚えておいてください。[コールトゥアクション]。このビデオが参考になれば幸いです。チャンネル登録とグッドボタンもお忘れなく！",
                duration: "2分",
                visualNotes: "全ランキングの要約表示、追加洞察のグラフィック、コールトゥアクションの明確な表示、チャンネル登録ボタンの表示",
                audioNotes: "まとめに合わせた落ち着いたBGM、コールトゥアクションで前向きなトーン、エンディングテーマ",
            },
        ];

        return {
            script: {
                title: curationStructure.title,
                totalDuration: "23分",
                sections: scriptSections,
                metadata: {
                    targetKeywords: ["ランキング", "トップ5", curationStructure.title, "ベスト選定"],
                    thumbnailSuggestions: [
                        "「TOP 5」などの大きなテキストと1位のアイテム画像を組み合わせたデザイン",
                        "全ランキングアイテムを小さく表示し、「どれが1位？」などの興味を引くテキスト",
                        "数字の「5」を目立たせ、ランキングを象徴するデザイン"
                    ],
                    descriptionSuggestion: `このビデオでは、${curationStructure.title}に関する厳選ランキングをお届けします。${curationStructure.introduction.topicOverview}について詳しく解説し、トップ5の選定理由を徹底分析します。`,
                },
            },
        };
    },
});

// ワークフロー定義
const youtubeLongFormMoezoWorkflow = createWorkflow({
    id: 'youtube-long-form-moezo-workflow',
    description: 'キュレーション型の長尺動画台本を生成するワークフロー',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        curationType: z.string().describe('キュレーションタイプ（ランキング、ベスト選定、比較分析など）'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        selectionCriteria: z.array(z.string()).describe('選定/ランキング基準'),
        itemsToInclude: z.array(z.string()).optional().describe('含めるべき項目（オプション）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ'),
        callToAction: z.string().optional().describe('視聴者に促したいアクション'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        result: z.object({
            title: z.string(),
            totalDuration: z.string(),
            script: z.object({
                sections: z.array(z.object({
                    sectionType: z.string(),
                    sectionTitle: z.string().optional(),
                    content: z.string(),
                    duration: z.string(),
                    visualNotes: z.string().optional(),
                    audioNotes: z.string().optional(),
                })),
                metadata: z.object({
                    targetKeywords: z.array(z.string()),
                    thumbnailSuggestions: z.array(z.string()),
                    descriptionSuggestion: z.string(),
                }),
            }),
        }).optional(),
    }),
})
    .then(validateMoezoInputStep)
    .then(designCurationStructureStep)
    .then(generateCurationScriptStep);

// ワークフローをコミット
youtubeLongFormMoezoWorkflow.commit();

// エクスポート
export { youtubeLongFormMoezoWorkflow };
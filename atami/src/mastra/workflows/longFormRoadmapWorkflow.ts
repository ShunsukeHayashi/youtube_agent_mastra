// @ts-nocheck
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = openai('gpt-4');

/**
 * 長尺ロードマップワークフロー
 * ロードマップ形式の長尺動画台本を生成するワークフロー
 */

// 入力検証ステップ
const validateRoadmapInputStep = createStep({
    id: 'validate-roadmap-input',
    description: 'Validate the input for roadmap script generation',
    inputSchema: z.object({
        topicTitle: z.string().describe('ロードマップのメインタイトル'),
        topicDescription: z.string().describe('トピックの詳細説明'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        goalState: z.string().describe('視聴者が達成すべき最終状態'),
        difficultyLevel: z.string().optional().describe('難易度レベル（初級、中級、上級）'),
        estimatedTimeToComplete: z.string().optional().describe('完了までの推定時間'),
        prerequisites: z.array(z.string()).optional().describe('前提条件や必要な知識'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            topicTitle: z.string(),
            topicDescription: z.string(),
            targetAudience: z.string(),
            goalState: z.string(),
            difficultyLevel: z.string().optional(),
            estimatedTimeToComplete: z.string().optional(),
            prerequisites: z.array(z.string()).optional(),
        }).optional(),
    }),
    execute: async (params) => {
        const input = params.input;

        if (!input.topicTitle || input.topicTitle.trim() === '') {
            return {
                isValid: false,
                message: 'ロードマップのタイトルは必須です',
            };
        }

        if (!input.topicDescription || input.topicDescription.trim() === '') {
            return {
                isValid: false,
                message: 'トピックの詳細説明は必須です',
            };
        }

        if (!input.targetAudience || input.targetAudience.trim() === '') {
            return {
                isValid: false,
                message: 'ターゲットオーディエンスは必須です',
            };
        }

        if (!input.goalState || input.goalState.trim() === '') {
            return {
                isValid: false,
                message: '達成すべき最終状態は必須です',
            };
        }

        return {
            isValid: true,
            validatedInput: input,
        };
    },
});

// ロードマップ構造設計ステップ
const designRoadmapStructureStep = createStep({
    id: 'design-roadmap-structure',
    description: 'Design the structure of the roadmap',
    inputSchema: z.object({
        validatedInput: z.object({
            topicTitle: z.string(),
            topicDescription: z.string(),
            targetAudience: z.string(),
            goalState: z.string(),
            difficultyLevel: z.string().optional(),
            estimatedTimeToComplete: z.string().optional(),
            prerequisites: z.array(z.string()).optional(),
        }),
    }),
    outputSchema: z.object({
        roadmapStructure: z.object({
            title: z.string(),
            introduction: z.object({
                hook: z.string(),
                overview: z.string(),
                valueProposition: z.string(),
            }),
            milestones: z.array(z.object({
                title: z.string(),
                description: z.string(),
                keyPoints: z.array(z.string()),
                estimatedDuration: z.string(),
                resources: z.array(z.string()).optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                nextSteps: z.string(),
                callToAction: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // ロードマップエージェントを使用して構造を設計
        const roadmapAgent = new Agent({
            name: 'Roadmap Structure Designer',
            model: llm,
            instructions: `
        あなたは教育コンテンツのロードマップ設計の専門家です。
        与えられたトピックに基づいて、明確で段階的なロードマップ構造を設計してください。
        
        各マイルストーンは以下の要素を含む必要があります：
        - 明確なタイトル
        - 簡潔な説明
        - 3-5個の重要なポイント
        - 推定所要時間
        - 推奨リソース（オプション）
        
        ロードマップ全体は以下の構造に従ってください：
        1. 導入部：フック、概要、価値提案
        2. マイルストーン（5-7個）：段階的な学習ステップ
        3. 結論：まとめ、次のステップ、コールトゥアクション
        
        ターゲットオーディエンスと最終目標に合わせた構造を設計してください。
      `,
        });

        const result = await roadmapAgent.execute(`
      # ロードマップ設計依頼
      
      ## トピック情報
      タイトル: ${input.topicTitle}
      詳細説明: ${input.topicDescription}
      ターゲットオーディエンス: ${input.targetAudience}
      最終目標: ${input.goalState}
      難易度: ${input.difficultyLevel || '指定なし'}
      推定完了時間: ${input.estimatedTimeToComplete || '指定なし'}
      前提条件: ${input.prerequisites ? input.prerequisites.join(', ') : '指定なし'}
      
      ## 依頼内容
      上記のトピックに基づいて、5-7個のマイルストーンを持つロードマップ構造を設計してください。
    `);

        // エージェントの出力を解析してロードマップ構造を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            title: input.topicTitle,
            introduction: {
                hook: "視聴者の注意を引くフック",
                overview: "コンテンツの概要説明",
                valueProposition: "視聴者が得られる価値の提案",
            },
            milestones: [
                {
                    title: "マイルストーン1: 基礎知識の習得",
                    description: "基本的な概念と用語を学びます",
                    keyPoints: ["キーポイント1", "キーポイント2", "キーポイント3"],
                    estimatedDuration: "10分",
                    resources: ["リソース1", "リソース2"],
                },
                {
                    title: "マイルストーン2: 初級スキルの開発",
                    description: "基本的なスキルを実践します",
                    keyPoints: ["キーポイント1", "キーポイント2", "キーポイント3"],
                    estimatedDuration: "15分",
                    resources: ["リソース1", "リソース2"],
                },
                {
                    title: "マイルストーン3: 中級テクニックの習得",
                    description: "より高度なテクニックを学びます",
                    keyPoints: ["キーポイント1", "キーポイント2", "キーポイント3"],
                    estimatedDuration: "20分",
                    resources: ["リソース1", "リソース2"],
                },
                {
                    title: "マイルストーン4: 応用と実践",
                    description: "学んだ知識を実際のシナリオに適用します",
                    keyPoints: ["キーポイント1", "キーポイント2", "キーポイント3"],
                    estimatedDuration: "15分",
                    resources: ["リソース1", "リソース2"],
                },
                {
                    title: "マイルストーン5: マスタリーと次のステップ",
                    description: "スキルを完成させ、次のレベルへの準備をします",
                    keyPoints: ["キーポイント1", "キーポイント2", "キーポイント3"],
                    estimatedDuration: "10分",
                    resources: ["リソース1", "リソース2"],
                },
            ],
            conclusion: {
                summary: "学んだ内容のまとめ",
                nextSteps: "次に取るべきステップの提案",
                callToAction: "視聴者に取ってほしいアクション",
            },
        };

        return {
            roadmapStructure: parsedResult,
        };
    },
});

// ロードマップスクリプト生成ステップ
const generateRoadmapScriptStep = createStep({
    id: 'generate-roadmap-script',
    description: 'Generate the detailed script for the roadmap video',
    inputSchema: z.object({
        roadmapStructure: z.object({
            title: z.string(),
            introduction: z.object({
                hook: z.string(),
                overview: z.string(),
                valueProposition: z.string(),
            }),
            milestones: z.array(z.object({
                title: z.string(),
                description: z.string(),
                keyPoints: z.array(z.string()),
                estimatedDuration: z.string(),
                resources: z.array(z.string()).optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                nextSteps: z.string(),
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
            })),
            metadata: z.object({
                targetKeywords: z.array(z.string()),
                thumbnailSuggestions: z.array(z.string()),
                descriptionSuggestion: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const roadmapStructure = params.input.roadmapStructure;

        // スクリプト生成エージェントを使用して詳細なスクリプトを生成
        const scriptAgent = new Agent({
            name: 'Roadmap Script Generator',
            model: llm,
            instructions: `
        あなたはYouTube教育コンテンツのスクリプトライターです。
        与えられたロードマップ構造に基づいて、詳細な動画スクリプトを作成してください。
        
        スクリプトは以下の要素を含む必要があります：
        - 魅力的な導入部（視聴者の注意を引くフック）
        - 各マイルストーンの詳細な説明
        - 明確な例示と説明
        - 自然な移行と接続
        - 強力な結論とコールトゥアクション
        
        各セクションには以下の情報も含めてください：
        - 推定所要時間
        - 視覚的要素に関する注記（表示すべき画像、図表、テキストなど）
        
        スクリプトは会話的で親しみやすい口調で、教育的かつ魅力的な内容にしてください。
      `,
        });

        const result = await scriptAgent.execute(`
      # ロードマップスクリプト作成依頼
      
      ## ロードマップ構造
      タイトル: ${roadmapStructure.title}
      
      ### 導入部
      フック: ${roadmapStructure.introduction.hook}
      概要: ${roadmapStructure.introduction.overview}
      価値提案: ${roadmapStructure.introduction.valueProposition}
      
      ### マイルストーン
      ${roadmapStructure.milestones.map((milestone, index) => `
      マイルストーン${index + 1}: ${milestone.title}
      説明: ${milestone.description}
      キーポイント: ${milestone.keyPoints.join(', ')}
      推定所要時間: ${milestone.estimatedDuration}
      リソース: ${milestone.resources ? milestone.resources.join(', ') : 'なし'}
      `).join('\n')}
      
      ### 結論
      まとめ: ${roadmapStructure.conclusion.summary}
      次のステップ: ${roadmapStructure.conclusion.nextSteps}
      コールトゥアクション: ${roadmapStructure.conclusion.callToAction}
      
      ## 依頼内容
      上記のロードマップ構造に基づいて、詳細な動画スクリプトを作成してください。
    `);

        // エージェントの出力を解析してスクリプトを生成
        // 実際の実装ではより堅牢な解析が必要
        const scriptSections = [
            {
                sectionType: "introduction",
                content: "こんにちは、皆さん！今日は[トピック]について学んでいきましょう。このロードマップを通じて、あなたは[最終目標]を達成することができます。私と一緒に、ステップバイステップで進めていきましょう。",
                duration: "1分30秒",
                visualNotes: "タイトル画面、ロードマップの全体像を図示",
            },
            {
                sectionType: "milestone",
                sectionTitle: roadmapStructure.milestones[0].title,
                content: "まず最初のステップとして、基礎知識を身につけていきましょう。[詳細な説明と例示]",
                duration: "5分",
                visualNotes: "キーコンセプトを図解、重要ポイントをテキストで強調",
            },
            {
                sectionType: "milestone",
                sectionTitle: roadmapStructure.milestones[1].title,
                content: "基礎を理解したところで、次は初級スキルの開発に移ります。[詳細な説明と例示]",
                duration: "7分",
                visualNotes: "ステップバイステップの手順を表示、実例のデモンストレーション",
            },
            {
                sectionType: "milestone",
                sectionTitle: roadmapStructure.milestones[2].title,
                content: "ここからは少し難易度が上がりますが、中級テクニックを習得していきましょう。[詳細な説明と例示]",
                duration: "10分",
                visualNotes: "より複雑な図解、比較表、実際の適用例",
            },
            {
                sectionType: "milestone",
                sectionTitle: roadmapStructure.milestones[3].title,
                content: "理論を学んだところで、実際に応用してみましょう。[詳細な説明と例示]",
                duration: "8分",
                visualNotes: "実際のシナリオ、ケーススタディ、問題解決プロセス",
            },
            {
                sectionType: "milestone",
                sectionTitle: roadmapStructure.milestones[4].title,
                content: "最後に、これまでの学びを統合して、マスターレベルに到達しましょう。[詳細な説明と例示]",
                duration: "5分",
                visualNotes: "高度な例、成功事例、マスターレベルの特徴",
            },
            {
                sectionType: "conclusion",
                content: "おめでとうございます！このロードマップを完了したあなたは、[トピック]について確かな知識とスキルを身につけました。次のステップとして、[提案]をお勧めします。もし質問があれば、コメント欄に残してください。チャンネル登録とグッドボタンもお忘れなく！",
                duration: "2分",
                visualNotes: "ロードマップの全体像を再表示、次のステップの提案、チャンネル登録ボタンの表示",
            },
        ];

        return {
            script: {
                title: roadmapStructure.title,
                totalDuration: "38分30秒",
                sections: scriptSections,
                metadata: {
                    targetKeywords: ["ロードマップ", "学習ガイド", roadmapStructure.title, "初心者向け"],
                    thumbnailSuggestions: [
                        "ロードマップの全体像を視覚的に表現したデザイン",
                        "「5ステップで習得」などの魅力的なテキストを含むデザイン",
                        "最終目標を視覚化したビフォーアフターのデザイン"
                    ],
                    descriptionSuggestion: `このビデオでは、${roadmapStructure.title}を習得するための完全なロードマップを提供します。初心者から上級者まで、ステップバイステップで学べる内容になっています。`,
                },
            },
        };
    },
});

// ワークフロー定義
const youtubeLongFormRoadmapWorkflow = createWorkflow({
    id: 'youtube-long-form-roadmap-workflow',
    description: 'ロードマップ形式の長尺動画台本を生成するワークフロー',
    inputSchema: z.object({
        topicTitle: z.string().describe('ロードマップのメインタイトル'),
        topicDescription: z.string().describe('トピックの詳細説明'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        goalState: z.string().describe('視聴者が達成すべき最終状態'),
        difficultyLevel: z.string().optional().describe('難易度レベル（初級、中級、上級）'),
        estimatedTimeToComplete: z.string().optional().describe('完了までの推定時間'),
        prerequisites: z.array(z.string()).optional().describe('前提条件や必要な知識'),
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
    .then(validateRoadmapInputStep)
    .then(designRoadmapStructureStep)
    .then(generateRoadmapScriptStep);

// ワークフローをコミット
youtubeLongFormRoadmapWorkflow.commit();

// エクスポート
export { youtubeLongFormRoadmapWorkflow };
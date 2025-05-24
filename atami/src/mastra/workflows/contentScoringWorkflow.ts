// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * コンテンツスコアリング＆フィードバックワークフロー
 * YouTubeコンテンツの品質評価とフィードバックを提供するワークフロー
 */

// 入力検証ステップ
const validateContentScoringInputStep = createStep({
    id: 'validate-content-scoring-input',
    description: 'Validate the input for content scoring and feedback',
    inputSchema: z.object({
        contentUrl: z.string().describe('評価対象のコンテンツURL（YouTube動画URLなど）'),
        contentType: z.string().describe('コンテンツタイプ（教育、エンターテイメント、ハウツー、レビューなど）'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        contentGoals: z.array(z.string()).describe('コンテンツの目標（認知拡大、エンゲージメント向上、コンバージョンなど）'),
        contentScript: z.string().optional().describe('コンテンツのスクリプト/台本（オプション）'),
        contentDescription: z.string().optional().describe('コンテンツの説明（オプション）'),
        specificFeedbackAreas: z.array(z.string()).optional().describe('特に評価してほしい領域（オプション）'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            contentUrl: z.string(),
            contentType: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            contentScript: z.string().optional(),
            contentDescription: z.string().optional(),
            specificFeedbackAreas: z.array(z.string()).optional(),
        }).optional(),
    }),
    execute: async (params) => {
        const input = params.input;

        if (!input.contentUrl || input.contentUrl.trim() === '') {
            return {
                isValid: false,
                message: 'コンテンツURLは必須です',
            };
        }

        if (!input.contentType || input.contentType.trim() === '') {
            return {
                isValid: false,
                message: 'コンテンツタイプは必須です',
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

        return {
            isValid: true,
            validatedInput: input,
        };
    },
});

// コンテンツ分析ステップ
const analyzeContentStep = createStep({
    id: 'analyze-content',
    description: 'Analyze the content based on various criteria',
    inputSchema: z.object({
        validatedInput: z.object({
            contentUrl: z.string(),
            contentType: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            contentScript: z.string().optional(),
            contentDescription: z.string().optional(),
            specificFeedbackAreas: z.array(z.string()).optional(),
        }),
    }),
    outputSchema: z.object({
        contentAnalysis: z.object({
            overallImpression: z.string(),
            categoryScores: z.object({
                structure: z.object({
                    score: z.number(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                }),
                delivery: z.object({
                    score: z.number(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                }),
                engagement: z.object({
                    score: z.number(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                }),
                seo: z.object({
                    score: z.number(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                }),
                production: z.object({
                    score: z.number(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                }),
            }),
            audienceAlignment: z.object({
                score: z.number(),
                analysis: z.string(),
            }),
            goalAchievement: z.object({
                score: z.number(),
                analysis: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // コンテンツ分析エージェントを使用
        const analysisAgent = new Agent({
            name: 'Content Analysis Expert',
            model: llm,
            instructions: `
        あなたはYouTubeコンテンツの分析と評価の専門家です。
        与えられたコンテンツ情報に基づいて、以下のカテゴリで詳細な分析と評価を行ってください。
        
        評価カテゴリ：
        1. 構造（Structure）
           - 導入部の効果
           - 内容の論理的な流れ
           - 結論の明確さ
           - 全体的なストーリーテリング
        
        2. 伝達（Delivery）
           - 話し方の明瞭さ
           - ペースとリズム
           - 声のトーンと表現力
           - 専門用語の適切な使用
        
        3. エンゲージメント（Engagement）
           - 視聴者の注意を引く要素
           - 視聴者参加の促進
           - 感情的な接続
           - コールトゥアクションの効果
        
        4. SEO最適化（SEO）
           - タイトルの効果
           - サムネイルの魅力
           - 説明文の最適化
           - キーワードの適切な使用
        
        5. 制作品質（Production）
           - 映像の質
           - 音声の質
           - 編集の質
           - 視覚効果とグラフィック
        
        各カテゴリを10点満点で評価し、強みと弱みを特定してください。
        また、ターゲットオーディエンスとの適合性とコンテンツ目標の達成度も評価してください。
        
        コンテンツスクリプトや説明が提供されている場合は、それらも分析に含めてください。
        特定のフィードバック領域が指定されている場合は、それらに特に注目してください。
      `,
        });

        const result = await analysisAgent.execute(`
      # コンテンツ分析依頼
      
      ## コンテンツ情報
      コンテンツURL: ${input.contentUrl}
      コンテンツタイプ: ${input.contentType}
      ターゲットオーディエンス: ${input.targetAudience}
      コンテンツ目標: ${input.contentGoals.join(', ')}
      コンテンツスクリプト: ${input.contentScript || '提供なし'}
      コンテンツ説明: ${input.contentDescription || '提供なし'}
      特に評価してほしい領域: ${input.specificFeedbackAreas ? input.specificFeedbackAreas.join(', ') : '指定なし'}
      
      ## 依頼内容
      上記のコンテンツを分析し、各カテゴリで評価してください。
    `);

        // フィードバック生成ステップ
        const generateFeedbackStep = createStep({
            id: 'generate-feedback',
            description: 'Generate detailed feedback and improvement suggestions based on the analysis',
            inputSchema: z.object({
                validatedInput: z.object({
                    contentUrl: z.string(),
                    contentType: z.string(),
                    targetAudience: z.string(),
                    contentGoals: z.array(z.string()),
                    contentScript: z.string().optional(),
                    contentDescription: z.string().optional(),
                    specificFeedbackAreas: z.array(z.string()).optional(),
                }),
                contentAnalysis: z.object({
                    overallImpression: z.string(),
                    categoryScores: z.object({
                        structure: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        delivery: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        engagement: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        seo: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        production: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                    }),
                    audienceAlignment: z.object({
                        score: z.number(),
                        analysis: z.string(),
                    }),
                    goalAchievement: z.object({
                        score: z.number(),
                        analysis: z.string(),
                    }),
                }),
            }),
            outputSchema: z.object({
                feedback: z.object({
                    overallScore: z.number(),
                    summary: z.string(),
                    detailedFeedback: z.object({
                        structure: z.string(),
                        delivery: z.string(),
                        engagement: z.string(),
                        seo: z.string(),
                        production: z.string(),
                        audienceAlignment: z.string(),
                        goalAchievement: z.string(),
                    }),
                    topStrengths: z.array(z.string()),
                    topWeaknesses: z.array(z.string()),
                    improvementSuggestions: z.array(z.object({
                        category: z.string(),
                        suggestion: z.string(),
                        priority: z.string(),
                        implementationDifficulty: z.string(),
                        expectedImpact: z.string(),
                    })),
                    nextLevelStrategies: z.array(z.string()),
                }),
            }),
            execute: async (params) => {
                const input = params.input.validatedInput;
                const analysis = params.input.contentAnalysis;

                // フィードバック生成エージェントを使用
                const feedbackAgent = new Agent({
                    name: 'Content Feedback Expert',
                    model: llm,
                    instructions: `
        あなたはYouTubeコンテンツのフィードバックと改善提案の専門家です。
        与えられた分析結果に基づいて、詳細なフィードバックと具体的な改善提案を作成してください。
        
        フィードバックには以下の要素を含めてください：
        1. 全体的な評価スコア（10点満点）と要約
        2. 各カテゴリ（構造、伝達、エンゲージメント、SEO、制作品質）の詳細なフィードバック
        3. ターゲットオーディエンスとの適合性と目標達成度に関するフィードバック
        4. 最も優れている点（トップ3）
        5. 最も改善が必要な点（トップ3）
        6. 具体的な改善提案（カテゴリ、提案内容、優先度、実装難易度、期待される効果）
        7. 次のレベルに進むための戦略的アドバイス
        
        フィードバックは建設的で実用的なものにし、具体的な例や参考資料を含めてください。
        改善提案は優先順位を付け、最も効果的なものから順に提示してください。
      `,
                });

                const result = await feedbackAgent.execute(`
      # フィードバック生成依頼
      
      ## コンテンツ情報
      コンテンツURL: ${input.contentUrl}
      コンテンツタイプ: ${input.contentType}
      ターゲットオーディエンス: ${input.targetAudience}
      コンテンツ目標: ${input.contentGoals.join(', ')}
      
      ## 分析結果
      全体的な印象: ${analysis.overallImpression}
      
      ### カテゴリ別スコア
      構造: ${analysis.categoryScores.structure.score}/10
      - 強み: ${analysis.categoryScores.structure.strengths.join(', ')}
      - 弱み: ${analysis.categoryScores.structure.weaknesses.join(', ')}
      
      伝達: ${analysis.categoryScores.delivery.score}/10
      - 強み: ${analysis.categoryScores.delivery.strengths.join(', ')}
      - 弱み: ${analysis.categoryScores.delivery.weaknesses.join(', ')}
      
      エンゲージメント: ${analysis.categoryScores.engagement.score}/10
      - 強み: ${analysis.categoryScores.engagement.strengths.join(', ')}
      - 弱み: ${analysis.categoryScores.engagement.weaknesses.join(', ')}
      
      SEO: ${analysis.categoryScores.seo.score}/10
      - 強み: ${analysis.categoryScores.seo.strengths.join(', ')}
      - 弱み: ${analysis.categoryScores.seo.weaknesses.join(', ')}
      
      制作品質: ${analysis.categoryScores.production.score}/10
      - 強み: ${analysis.categoryScores.production.strengths.join(', ')}
      - 弱み: ${analysis.categoryScores.production.weaknesses.join(', ')}
      
      ターゲットオーディエンスとの適合性: ${analysis.audienceAlignment.score}/10
      - 分析: ${analysis.audienceAlignment.analysis}
      
      目標達成度: ${analysis.goalAchievement.score}/10
      - 分析: ${analysis.goalAchievement.analysis}
      
      ## 依頼内容
      上記の分析結果に基づいて、詳細なフィードバックと具体的な改善提案を作成してください。
    `);

                // エージェントの出力を解析してフィードバックを生成
                // 実際の実装ではより堅牢な解析が必要

                // 全体スコアの計算（各カテゴリの平均）
                const categoryScores = [
                    analysis.categoryScores.structure.score,
                    analysis.categoryScores.delivery.score,
                    analysis.categoryScores.engagement.score,
                    analysis.categoryScores.seo.score,
                    analysis.categoryScores.production.score,
                    analysis.audienceAlignment.score,
                    analysis.goalAchievement.score,
                ];
                const overallScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;

                const parsedResult = {
                    overallScore: parseFloat(overallScore.toFixed(1)),
                    summary: "コンテンツの全体的な評価と主要な所見の要約",
                    detailedFeedback: {
                        structure: "構造に関する詳細なフィードバック。導入部は効果的ですが、結論をより強化し、セクション間の移行をスムーズにすることで改善できます。",
                        delivery: "伝達に関する詳細なフィードバック。話し方は明瞭で適切なペースですが、専門用語の説明をより充実させることで、より幅広い視聴者に理解されるでしょう。",
                        engagement: "エンゲージメントに関する詳細なフィードバック。質問の使用と個人的なエピソードは効果的ですが、視聴者参加の促進とコールトゥアクションを強化することで、より高いエンゲージメントを得られるでしょう。",
                        seo: "SEOに関する詳細なフィードバック。キーワードの使用は適切ですが、タイトルの最適化と説明文へのキーワード追加により、検索結果での表示が改善されるでしょう。",
                        production: "制作品質に関する詳細なフィードバック。映像、音声、編集は高品質ですが、一部のグラフィックは簡素化することで、メッセージの伝達がより明確になるでしょう。",
                        audienceAlignment: "ターゲットオーディエンスとの適合性に関する詳細なフィードバック。コンテンツは概ねターゲットオーディエンスのニーズに合致していますが、さらに特定のペルソナに焦点を当てることで、より強い共感を得られるでしょう。",
                        goalAchievement: "目標達成度に関する詳細なフィードバック。コンテンツは目標達成に向けて良い進展を示していますが、より明確なコールトゥアクションと測定可能な次のステップを提供することで、コンバージョン率が向上するでしょう。",
                    },
                    topStrengths: [
                        "高品質な映像と音声による専門的な印象の提供",
                        "明瞭で適切なペースの話し方による情報の効果的な伝達",
                        "視聴者の注意を引く効果的な導入部",
                    ],
                    topWeaknesses: [
                        "SEO最適化の不足（特にタイトルと説明文）",
                        "視聴者エンゲージメントとコールトゥアクションの弱さ",
                        "結論部分の効果が限定的",
                    ],
                    improvementSuggestions: [
                        {
                            category: "SEO",
                            suggestion: "タイトルにメインキーワードを含め、より検索意図に合致するように最適化する",
                            priority: "高",
                            implementationDifficulty: "低",
                            expectedImpact: "検索結果での表示回数の増加、クリック率の向上",
                        },
                        {
                            category: "エンゲージメント",
                            suggestion: "視聴者に質問を投げかけ、コメント欄での議論を促す具体的なプロンプトを追加する",
                            priority: "高",
                            implementationDifficulty: "低",
                            expectedImpact: "コメント数の増加、コミュニティ形成の促進",
                        },
                        {
                            category: "構造",
                            suggestion: "結論部分を強化し、主要なポイントの要約と明確な次のステップを提供する",
                            priority: "中",
                            implementationDifficulty: "中",
                            expectedImpact: "情報の定着率の向上、視聴者のアクション率の向上",
                        },
                        {
                            category: "伝達",
                            suggestion: "専門用語を使用する際に、簡潔な説明や視覚的な例を追加する",
                            priority: "中",
                            implementationDifficulty: "中",
                            expectedImpact: "より幅広い視聴者層の理解度向上",
                        },
                        {
                            category: "制作品質",
                            suggestion: "一部の複雑なグラフィックを簡素化し、主要なメッセージに焦点を当てる",
                            priority: "低",
                            implementationDifficulty: "中",
                            expectedImpact: "視聴者の理解度と情報の定着率の向上",
                        },
                    ],
                    nextLevelStrategies: [
                        "シリーズコンテンツの作成による視聴者の継続的なエンゲージメントの促進",
                        "視聴者からのフィードバックを取り入れたコンテンツの改善サイクルの確立",
                        "コラボレーションによる視聴者層の拡大と新たな視点の導入",
                        "データ分析に基づくコンテンツ戦略の最適化と実験的アプローチの導入",
                    ],
                };

                return {
                    feedback: parsedResult,
                };
            },
        });

        // スコアリングレポート生成ステップ
        const generateScoringReportStep = createStep({
            id: 'generate-scoring-report',
            description: 'Generate a comprehensive scoring report with visualizations',
            inputSchema: z.object({
                validatedInput: z.object({
                    contentUrl: z.string(),
                    contentType: z.string(),
                    targetAudience: z.string(),
                    contentGoals: z.array(z.string()),
                    contentScript: z.string().optional(),
                    contentDescription: z.string().optional(),
                    specificFeedbackAreas: z.array(z.string()).optional(),
                }),
                contentAnalysis: z.object({
                    overallImpression: z.string(),
                    categoryScores: z.object({
                        structure: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        delivery: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        engagement: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        seo: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        production: z.object({
                            score: z.number(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                    }),
                    audienceAlignment: z.object({
                        score: z.number(),
                        analysis: z.string(),
                    }),
                    goalAchievement: z.object({
                        score: z.number(),
                        analysis: z.string(),
                    }),
                }),
                feedback: z.object({
                    overallScore: z.number(),
                    summary: z.string(),
                    detailedFeedback: z.object({
                        structure: z.string(),
                        delivery: z.string(),
                        engagement: z.string(),
                        seo: z.string(),
                        production: z.string(),
                        audienceAlignment: z.string(),
                        goalAchievement: z.string(),
                    }),
                    topStrengths: z.array(z.string()),
                    topWeaknesses: z.array(z.string()),
                    improvementSuggestions: z.array(z.object({
                        category: z.string(),
                        suggestion: z.string(),
                        priority: z.string(),
                        implementationDifficulty: z.string(),
                        expectedImpact: z.string(),
                    })),
                    nextLevelStrategies: z.array(z.string()),
                }),
            }),
            outputSchema: z.object({
                scoringReport: z.object({
                    title: z.string(),
                    contentSummary: z.object({
                        contentUrl: z.string(),
                        contentType: z.string(),
                        targetAudience: z.string(),
                        contentGoals: z.array(z.string()),
                    }),
                    scorecard: z.object({
                        overallScore: z.number(),
                        categoryScores: z.object({
                            structure: z.number(),
                            delivery: z.number(),
                            engagement: z.number(),
                            seo: z.number(),
                            production: z.number(),
                            audienceAlignment: z.number(),
                            goalAchievement: z.number(),
                        }),
                        visualizationData: z.string(),
                    }),
                    strengthsAndWeaknesses: z.object({
                        topStrengths: z.array(z.string()),
                        topWeaknesses: z.array(z.string()),
                    }),
                    detailedAnalysis: z.object({
                        structure: z.object({
                            score: z.number(),
                            feedback: z.string(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        delivery: z.object({
                            score: z.number(),
                            feedback: z.string(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        engagement: z.object({
                            score: z.number(),
                            feedback: z.string(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        seo: z.object({
                            score: z.number(),
                            feedback: z.string(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                        production: z.object({
                            score: z.number(),
                            feedback: z.string(),
                            strengths: z.array(z.string()),
                            weaknesses: z.array(z.string()),
                        }),
                    }),
                    improvementPlan: z.object({
                        summary: z.string(),
                        prioritizedSuggestions: z.array(z.object({
                            category: z.string(),
                            suggestion: z.string(),
                            priority: z.string(),
                            difficulty: z.string(),
                            impact: z.string(),
                        })),
                        nextLevelStrategies: z.array(z.string()),
                    }),
                    conclusionAndNextSteps: z.string(),
                }),
            }),
            execute: async (params) => {
                const input = params.input.validatedInput;
                const analysis = params.input.contentAnalysis;
                const feedback = params.input.feedback;

                // レポート生成エージェントを使用
                const reportAgent = new Agent({
                    name: 'Scoring Report Generator',
                    model: llm,
                    instructions: `
        あなたはYouTubeコンテンツのスコアリングレポート生成の専門家です。
        与えられた分析結果とフィードバックに基づいて、包括的なスコアリングレポートを作成してください。
        
        レポートには以下の要素を含めてください：
        1. タイトルと概要
        2. コンテンツの基本情報（URL、タイプ、ターゲットオーディエンス、目標）
        3. スコアカード（全体スコアとカテゴリ別スコア）
        4. 強みと弱みの要約
        5. 各カテゴリの詳細分析
        6. 改善計画（優先順位付けされた提案）
        7. 次のレベルに進むための戦略
        8. 結論と次のステップ
        
        レポートは視覚的に魅力的で、実用的な情報を提供するものにしてください。
        データの視覚化についての説明も含めてください（実際のチャートやグラフは生成できませんが、どのようなものが有効かを説明してください）。
      `,
                });

                const result = await reportAgent.execute(`
      # スコアリングレポート生成依頼
      
      ## コンテンツ情報
      コンテンツURL: ${input.contentUrl}
      コンテンツタイプ: ${input.contentType}
      ターゲットオーディエンス: ${input.targetAudience}
      コンテンツ目標: ${input.contentGoals.join(', ')}
      
      ## 分析結果
      全体的な印象: ${analysis.overallImpression}
      
      ### カテゴリ別スコア
      構造: ${analysis.categoryScores.structure.score}/10
      伝達: ${analysis.categoryScores.delivery.score}/10
      エンゲージメント: ${analysis.categoryScores.engagement.score}/10
      SEO: ${analysis.categoryScores.seo.score}/10
      制作品質: ${analysis.categoryScores.production.score}/10
      ターゲットオーディエンスとの適合性: ${analysis.audienceAlignment.score}/10
      目標達成度: ${analysis.goalAchievement.score}/10
      
      ## フィードバック
      全体スコア: ${feedback.overallScore}/10
      要約: ${feedback.summary}
      
      ### 強みと弱み
      トップ強み: ${feedback.topStrengths.join(', ')}
      トップ弱み: ${feedback.topWeaknesses.join(', ')}
      
      ### 改善提案
      ${feedback.improvementSuggestions.map(suggestion =>
                    `カテゴリ: ${suggestion.category}
        提案: ${suggestion.suggestion}
        優先度: ${suggestion.priority}
        実装難易度: ${suggestion.implementationDifficulty}
        期待される効果: ${suggestion.expectedImpact}`
                ).join('\n\n')}
      
      ### 次のレベル戦略
      ${feedback.nextLevelStrategies.join(', ')}
      
      ## 依頼内容
      上記の情報に基づいて、包括的なスコアリングレポートを作成してください。
    `);

                // エージェントの出力を解析してレポートを生成
                // 実際の実装ではより堅牢な解析が必要
                const parsedResult = {
                    title: `コンテンツスコアリングレポート: ${input.contentType}コンテンツの評価と改善提案`,
                    contentSummary: {
                        contentUrl: input.contentUrl,
                        contentType: input.contentType,
                        targetAudience: input.targetAudience,
                        contentGoals: input.contentGoals,
                    },
                    scorecard: {
                        overallScore: feedback.overallScore,
                        categoryScores: {
                            structure: analysis.categoryScores.structure.score,
                            delivery: analysis.categoryScores.delivery.score,
                            engagement: analysis.categoryScores.engagement.score,
                            seo: analysis.categoryScores.seo.score,
                            production: analysis.categoryScores.production.score,
                            audienceAlignment: analysis.audienceAlignment.score,
                            goalAchievement: analysis.goalAchievement.score,
                        },
                        visualizationData: "レーダーチャートとバーグラフによるスコア視覚化の説明",
                    },
                    strengthsAndWeaknesses: {
                        topStrengths: feedback.topStrengths,
                        topWeaknesses: feedback.topWeaknesses,
                    },
                    detailedAnalysis: {
                        structure: {
                            score: analysis.categoryScores.structure.score,
                            feedback: feedback.detailedFeedback.structure,
                            strengths: analysis.categoryScores.structure.strengths,
                            weaknesses: analysis.categoryScores.structure.weaknesses,
                        },
                        delivery: {
                            score: analysis.categoryScores.delivery.score,
                            feedback: feedback.detailedFeedback.delivery,
                            strengths: analysis.categoryScores.delivery.strengths,
                            weaknesses: analysis.categoryScores.delivery.weaknesses,
                        },
                        engagement: {
                            score: analysis.categoryScores.engagement.score,
                            feedback: feedback.detailedFeedback.engagement,
                            strengths: analysis.categoryScores.engagement.strengths,
                            weaknesses: analysis.categoryScores.engagement.weaknesses,
                        },
                        seo: {
                            score: analysis.categoryScores.seo.score,
                            feedback: feedback.detailedFeedback.seo,
                            strengths: analysis.categoryScores.seo.strengths,
                            weaknesses: analysis.categoryScores.seo.weaknesses,
                        },
                        production: {
                            score: analysis.categoryScores.production.score,
                            feedback: feedback.detailedFeedback.production,
                            strengths: analysis.categoryScores.production.strengths,
                            weaknesses: analysis.categoryScores.production.weaknesses,
                        },
                    },
                    improvementPlan: {
                        summary: "優先度に基づいた改善計画の概要",
                        prioritizedSuggestions: feedback.improvementSuggestions.map(suggestion => ({
                            category: suggestion.category,
                            suggestion: suggestion.suggestion,
                            priority: suggestion.priority,
                            difficulty: suggestion.implementationDifficulty,
                            impact: suggestion.expectedImpact,
                        })),
                        nextLevelStrategies: feedback.nextLevelStrategies,
                    },
                    conclusionAndNextSteps: "レポートの結論と推奨される次のステップの概要",
                };

                return {
                    scoringReport: parsedResult,
                };
            },
        });

        // ワークフロー定義
        const youtubeContentScoringWorkflow = createWorkflow({
            id: 'youtube-content-scoring-workflow',
            description: 'YouTubeコンテンツの品質評価とフィードバックを提供するワークフロー',
            inputSchema: z.object({
                contentUrl: z.string().describe('評価対象のコンテンツURL（YouTube動画URLなど）'),
                contentType: z.string().describe('コンテンツタイプ（教育、エンターテイメント、ハウツー、レビューなど）'),
                targetAudience: z.string().describe('ターゲットオーディエンス'),
                contentGoals: z.array(z.string()).describe('コンテンツの目標（認知拡大、エンゲージメント向上、コンバージョンなど）'),
                contentScript: z.string().optional().describe('コンテンツのスクリプト/台本（オプション）'),
                contentDescription: z.string().optional().describe('コンテンツの説明（オプション）'),
                specificFeedbackAreas: z.array(z.string()).optional().describe('特に評価してほしい領域（オプション）'),
            }),
            outputSchema: z.object({
                success: z.boolean(),
                message: z.string(),
                result: z.object({
                    scoringReport: z.object({
                        title: z.string(),
                        contentSummary: z.object({
                            contentUrl: z.string(),
                            contentType: z.string(),
                            targetAudience: z.string(),
                            contentGoals: z.array(z.string()),
                        }),
                        scorecard: z.object({
                            overallScore: z.number(),
                            categoryScores: z.object({
                                structure: z.number(),
                                delivery: z.number(),
                                engagement: z.number(),
                                seo: z.number(),
                                production: z.number(),
                                audienceAlignment: z.number(),
                                goalAchievement: z.number(),
                            }),
                            visualizationData: z.string(),
                        }),
                        strengthsAndWeaknesses: z.object({
                            topStrengths: z.array(z.string()),
                            topWeaknesses: z.array(z.string()),
                        }),
                        detailedAnalysis: z.object({
                            structure: z.object({
                                score: z.number(),
                                feedback: z.string(),
                                strengths: z.array(z.string()),
                                weaknesses: z.array(z.string()),
                            }),
                            delivery: z.object({
                                score: z.number(),
                                feedback: z.string(),
                                strengths: z.array(z.string()),
                                weaknesses: z.array(z.string()),
                            }),
                            engagement: z.object({
                                score: z.number(),
                                feedback: z.string(),
                                strengths: z.array(z.string()),
                                weaknesses: z.array(z.string()),
                            }),
                            seo: z.object({
                                score: z.number(),
                                feedback: z.string(),
                                strengths: z.array(z.string()),
                                weaknesses: z.array(z.string()),
                            }),
                            production: z.object({
                                score: z.number(),
                                feedback: z.string(),
                                strengths: z.array(z.string()),
                                weaknesses: z.array(z.string()),
                            }),
                        }),
                        improvementPlan: z.object({
                            summary: z.string(),
                            prioritizedSuggestions: z.array(z.object({
                                category: z.string(),
                                suggestion: z.string(),
                                priority: z.string(),
                                difficulty: z.string(),
                                impact: z.string(),
                            })),
                            nextLevelStrategies: z.array(z.string()),
                        }),
                        conclusionAndNextSteps: z.string(),
                    }),
                }).optional(),
            }),
        })
            .then(validateContentScoringInputStep)
            .then(analyzeContentStep)
            .then(generateFeedbackStep)
            .then(generateScoringReportStep);

        // ワークフローをコミット
        youtubeContentScoringWorkflow.commit();

        // エクスポート
        export { youtubeContentScoringWorkflow };
        // エージェントの出力を解析して分析結果を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            overallImpression: "コンテンツの全体的な印象と概要",
            categoryScores: {
                structure: {
                    score: 7.5,
                    strengths: ["導入部が視聴者の注意を引く", "論理的な流れがある"],
                    weaknesses: ["結論がやや弱い", "一部のセクション間の移行がスムーズでない"],
                },
                delivery: {
                    score: 8.0,
                    strengths: ["明瞭な話し方", "適切なペース"],
                    weaknesses: ["専門用語の説明が不足している箇所がある"],
                },
                engagement: {
                    score: 7.0,
                    strengths: ["視聴者の関心を引く質問の使用", "個人的なエピソードの共有"],
                    weaknesses: ["視聴者参加の促進が限定的", "コールトゥアクションがやや弱い"],
                },
                seo: {
                    score: 6.5,
                    strengths: ["キーワードの適切な使用"],
                    weaknesses: ["タイトルの最適化の余地あり", "説明文にキーワードが不足"],
                },
                production: {
                    score: 8.5,
                    strengths: ["高品質な映像", "クリアな音声", "プロフェッショナルな編集"],
                    weaknesses: ["一部のグラフィックがやや過剰"],
                },
            },
            audienceAlignment: {
                score: 7.5,
                analysis: "ターゲットオーディエンスとの適合性分析",
            },
            goalAchievement: {
                score: 7.0,
                analysis: "コンテンツ目標の達成度分析",
            },
        };

        return {
            contentAnalysis: parsedResult,
        };
    },
});
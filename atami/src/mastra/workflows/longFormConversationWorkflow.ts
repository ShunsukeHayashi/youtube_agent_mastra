// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * 長尺掛け合いワークフロー
 * 対話型の長尺動画台本を生成するワークフロー
 * UNIVERSAL_EXPERT_CONVERSATION_DNA V14.3
 */

// 入力検証ステップ
const validateConversationInputStep = createStep({
    id: 'validate-conversation-input',
    description: 'Validate the input for conversation script generation',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        expertRole: z.string().describe('専門家の役割/肩書き'),
        interviewerRole: z.string().optional().describe('インタビュアーの役割/肩書き'),
        keyQuestions: z.array(z.string()).describe('主要な質問事項'),
        keyPoints: z.array(z.string()).describe('伝えるべき重要なポイント'),
        conversationStyle: z.string().optional().describe('会話のスタイル（カジュアル、教育的、ディベートなど）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            videoTitle: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            expertRole: z.string(),
            interviewerRole: z.string(),
            keyQuestions: z.array(z.string()),
            keyPoints: z.array(z.string()),
            conversationStyle: z.string().optional(),
            desiredDuration: z.string().optional(),
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

        if (!input.expertRole || input.expertRole.trim() === '') {
            return {
                isValid: false,
                message: '専門家の役割/肩書きは必須です',
            };
        }

        if (!input.keyQuestions || input.keyQuestions.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つの主要な質問事項が必要です',
            };
        }

        if (!input.keyPoints || input.keyPoints.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つの重要なポイントが必要です',
            };
        }

        // インタビュアーの役割が指定されていない場合はデフォルト値を設定
        const interviewerRole = input.interviewerRole || 'インタビュアー';

        return {
            isValid: true,
            validatedInput: {
                ...input,
                interviewerRole,
            },
        };
    },
});

// 会話構造設計ステップ
const designConversationStructureStep = createStep({
    id: 'design-conversation-structure',
    description: 'Design the conversation structure based on UNIVERSAL_EXPERT_CONVERSATION_DNA',
    inputSchema: z.object({
        validatedInput: z.object({
            videoTitle: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            expertRole: z.string(),
            interviewerRole: z.string(),
            keyQuestions: z.array(z.string()),
            keyPoints: z.array(z.string()),
            conversationStyle: z.string().optional(),
            desiredDuration: z.string().optional(),
        }),
    }),
    outputSchema: z.object({
        conversationStructure: z.object({
            title: z.string(),
            participants: z.object({
                expert: z.object({
                    role: z.string(),
                    personality: z.string(),
                    expertise: z.array(z.string()),
                }),
                interviewer: z.object({
                    role: z.string(),
                    personality: z.string(),
                }),
            }),
            introduction: z.object({
                openingHook: z.string(),
                topicIntroduction: z.string(),
                expertIntroduction: z.string(),
            }),
            segments: z.array(z.object({
                title: z.string(),
                mainQuestion: z.string(),
                followUpQuestions: z.array(z.string()),
                keyPoints: z.array(z.string()),
                expertInsights: z.array(z.string()),
                transition: z.string().optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                finalThoughts: z.string(),
                callToAction: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // 会話構造設計エージェントを使用
        const conversationAgent = new Agent({
            name: 'Conversation Structure Designer',
            model: llm,
            instructions: `
        あなたは対話型コンテンツの構造設計の専門家です。
        与えられたトピックと質問事項に基づいて、UNIVERSAL_EXPERT_CONVERSATION_DNAに従った
        魅力的な対話構造を設計してください。
        
        UNIVERSAL_EXPERT_CONVERSATION_DNAの構造：
        1. 参加者設定
           - 専門家：役割、個性、専門分野
           - インタビュアー：役割、個性
        
        2. 導入部
           - オープニングフック：視聴者の注意を引く導入
           - トピック紹介：テーマの背景と重要性
           - 専門家紹介：専門家の経歴と信頼性
        
        3. セグメント（3-5個）
           - タイトル：セグメントの主題
           - メイン質問：セグメントの中心となる質問
           - フォローアップ質問：掘り下げるための質問
           - 重要ポイント：伝えるべき主要な情報
           - 専門家の洞察：専門家ならではの見解
           - 移行：次のセグメントへの橋渡し
        
        4. 結論
           - まとめ：主要なポイントの要約
           - 最終的な考え：専門家の締めくくりの言葉
           - コールトゥアクション：視聴者に促す具体的な行動
        
        ターゲットオーディエンスと会話スタイルに合わせた構造を設計してください。
        動画の冒頭はインタビュアーのラフな質問から始まり、各発言には必ず名前プレフィックスを付けてください。
      `,
        });

        const result = await conversationAgent.execute(`
      # 会話構造設計依頼
      
      ## コンテンツ情報
      タイトル: ${input.videoTitle}
      メインテーマ: ${input.mainTopic}
      ターゲットオーディエンス: ${input.targetAudience}
      専門家の役割: ${input.expertRole}
      インタビュアーの役割: ${input.interviewerRole}
      主要な質問事項: ${input.keyQuestions.join(', ')}
      重要なポイント: ${input.keyPoints.join(', ')}
      会話のスタイル: ${input.conversationStyle || '指定なし'}
      希望する長さ: ${input.desiredDuration || '指定なし'}
      
      ## 依頼内容
      上記の情報に基づいて、UNIVERSAL_EXPERT_CONVERSATION_DNAに従った会話構造を設計してください。
    `);

        // エージェントの出力を解析して会話構造を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            title: input.videoTitle,
            participants: {
                expert: {
                    role: input.expertRole,
                    personality: "知識豊富で親しみやすく、複雑な概念を分かりやすく説明できる",
                    expertise: ["専門分野1", "専門分野2", "専門分野3"],
                },
                interviewer: {
                    role: input.interviewerRole,
                    personality: "好奇心旺盛で視聴者の疑問を代弁する、会話を自然に導く",
                },
            },
            introduction: {
                openingHook: "視聴者の注意を引くオープニングフック",
                topicIntroduction: "テーマの背景と重要性の紹介",
                expertIntroduction: "専門家の経歴と信頼性の紹介",
            },
            segments: [
                {
                    title: "セグメント1: 基本概念",
                    mainQuestion: input.keyQuestions[0] || "メイン質問1",
                    followUpQuestions: ["フォローアップ質問1-1", "フォローアップ質問1-2"],
                    keyPoints: [input.keyPoints[0] || "重要ポイント1"],
                    expertInsights: ["専門家の洞察1-1", "専門家の洞察1-2"],
                    transition: "セグメント2への移行",
                },
                {
                    title: "セグメント2: 実践応用",
                    mainQuestion: input.keyQuestions[1] || "メイン質問2",
                    followUpQuestions: ["フォローアップ質問2-1", "フォローアップ質問2-2"],
                    keyPoints: [input.keyPoints[1] || "重要ポイント2"],
                    expertInsights: ["専門家の洞察2-1", "専門家の洞察2-2"],
                    transition: "セグメント3への移行",
                },
                {
                    title: "セグメント3: 将来展望",
                    mainQuestion: input.keyQuestions[2] || "メイン質問3",
                    followUpQuestions: ["フォローアップ質問3-1", "フォローアップ質問3-2"],
                    keyPoints: [input.keyPoints[2] || "重要ポイント3"],
                    expertInsights: ["専門家の洞察3-1", "専門家の洞察3-2"],
                },
            ],
            conclusion: {
                summary: "主要なポイントのまとめ",
                finalThoughts: "専門家の締めくくりの言葉",
                callToAction: "視聴者に促す具体的な行動",
            },
        };

        return {
            conversationStructure: parsedResult,
        };
    },
});

// 会話スクリプト生成ステップ
const generateConversationScriptStep = createStep({
    id: 'generate-conversation-script',
    description: 'Generate the detailed conversation script based on the structure',
    inputSchema: z.object({
        conversationStructure: z.object({
            title: z.string(),
            participants: z.object({
                expert: z.object({
                    role: z.string(),
                    personality: z.string(),
                    expertise: z.array(z.string()),
                }),
                interviewer: z.object({
                    role: z.string(),
                    personality: z.string(),
                }),
            }),
            introduction: z.object({
                openingHook: z.string(),
                topicIntroduction: z.string(),
                expertIntroduction: z.string(),
            }),
            segments: z.array(z.object({
                title: z.string(),
                mainQuestion: z.string(),
                followUpQuestions: z.array(z.string()),
                keyPoints: z.array(z.string()),
                expertInsights: z.array(z.string()),
                transition: z.string().optional(),
            })),
            conclusion: z.object({
                summary: z.string(),
                finalThoughts: z.string(),
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
        const conversationStructure = params.input.conversationStructure;

        // スクリプト生成エージェントを使用して詳細なスクリプトを生成
        const scriptAgent = new Agent({
            name: 'Conversation Script Generator',
            model: llm,
            instructions: `
        あなたは対話型YouTubeコンテンツのスクリプトライターです。
        与えられた会話構造に基づいて、詳細な動画スクリプトを作成してください。
        
        スクリプトは以下の要素を含む必要があります：
        - 魅力的な導入部（オープニングフック、トピック紹介、専門家紹介）
        - 各セグメントの詳細な会話（メイン質問、フォローアップ質問、専門家の回答、移行）
        - 明確な結論（まとめ、最終的な考え、コールトゥアクション）
        
        各セクションには以下の情報も含めてください：
        - 推定所要時間
        - 視覚的要素に関する注記（表示すべき画像、図表、テキストなど）
        - 音声/音楽に関する注記（BGM、効果音、声のトーンなど）
        
        スクリプトは自然な会話の流れを持ち、専門家とインタビュアーの個性が表れる内容にしてください。
        各発言の前には必ず「インタビュアー:」「専門家:」などの名前プレフィックスを付けてください。
        動画の冒頭はインタビュアーのラフな質問から始めてください。
      `,
        });

        const result = await scriptAgent.execute(`
      # 会話スクリプト作成依頼
      
      ## 会話構造
      タイトル: ${conversationStructure.title}
      
      ### 参加者
      専門家の役割: ${conversationStructure.participants.expert.role}
      専門家の個性: ${conversationStructure.participants.expert.personality}
      専門家の専門分野: ${conversationStructure.participants.expert.expertise.join(', ')}
      インタビュアーの役割: ${conversationStructure.participants.interviewer.role}
      インタビュアーの個性: ${conversationStructure.participants.interviewer.personality}
      
      ### 導入部
      オープニングフック: ${conversationStructure.introduction.openingHook}
      トピック紹介: ${conversationStructure.introduction.topicIntroduction}
      専門家紹介: ${conversationStructure.introduction.expertIntroduction}
      
      ### セグメント
      ${conversationStructure.segments.map((segment, index) => `
      セグメント${index + 1}: ${segment.title}
      メイン質問: ${segment.mainQuestion}
      フォローアップ質問: ${segment.followUpQuestions.join(', ')}
      重要ポイント: ${segment.keyPoints.join(', ')}
      専門家の洞察: ${segment.expertInsights.join(', ')}
      移行: ${segment.transition || 'なし'}
      `).join('\n')}
      
      ### 結論
      まとめ: ${conversationStructure.conclusion.summary}
      最終的な考え: ${conversationStructure.conclusion.finalThoughts}
      コールトゥアクション: ${conversationStructure.conclusion.callToAction}
      
      ## 依頼内容
      上記の会話構造に基づいて、詳細な動画スクリプトを作成してください。
    `);

        // エージェントの出力を解析してスクリプトを生成
        // 実際の実装ではより堅牢な解析が必要
        const scriptSections = [
            {
                sectionType: "introduction",
                content: `${conversationStructure.participants.interviewer.role}: こんにちは、皆さん！今日は[トピック]について詳しく掘り下げていきたいと思います。[オープニングフック]。このテーマは[トピック紹介]。今日は特別ゲストとして、[専門家紹介]の${conversationStructure.participants.expert.role}にお越しいただいています。よろしくお願いします！\n\n${conversationStructure.participants.expert.role}: こんにちは、お招きいただきありがとうございます。今日は[トピック]について皆さんと共有できることを楽しみにしています。`,
                duration: "3分",
                visualNotes: "両者の2ショット、専門家の肩書きをテロップ表示、トピックに関連する背景映像",
                audioNotes: "明るく親しみやすい導入音楽、徐々にフェードアウト",
            },
            {
                sectionType: "segment",
                sectionTitle: conversationStructure.segments[0].title,
                content: `${conversationStructure.participants.interviewer.role}: まず最初に伺いたいのですが、${conversationStructure.segments[0].mainQuestion}？\n\n${conversationStructure.participants.expert.role}: 良い質問ですね。[専門家の回答1]。特に重要なのは[重要ポイント1]です。\n\n${conversationStructure.participants.interviewer.role}: なるほど、とても興味深いですね。では、${conversationStructure.segments[0].followUpQuestions[0]}？\n\n${conversationStructure.participants.expert.role}: [専門家の回答2]。私の経験からすると、[専門家の洞察1-1]ということが言えます。\n\n${conversationStructure.participants.interviewer.role}: ${conversationStructure.segments[0].followUpQuestions[1]}についてはどうお考えですか？\n\n${conversationStructure.participants.expert.role}: [専門家の回答3]。[専門家の洞察1-2]という点も見逃せません。`,
                duration: "7分",
                visualNotes: "会話に合わせて関連図表や例示を表示、重要ポイントをテロップ強調",
                audioNotes: "バックグラウンドに控えめなBGM、重要ポイント強調時に軽い効果音",
            },
            {
                sectionType: "segment",
                sectionTitle: conversationStructure.segments[1].title,
                content: `${conversationStructure.participants.interviewer.role}: 次に、${conversationStructure.segments[1].mainQuestion}についてお聞きしたいと思います。\n\n${conversationStructure.participants.expert.role}: これは多くの人が気にしている点ですね。[専門家の回答4]。実践的には、[重要ポイント2]がカギとなります。\n\n${conversationStructure.participants.interviewer.role}: 具体的には、${conversationStructure.segments[1].followUpQuestions[0]}？\n\n${conversationStructure.participants.expert.role}: [専門家の回答5]。[専門家の洞察2-1]という事例もあります。\n\n${conversationStructure.participants.interviewer.role}: 興味深いですね。${conversationStructure.segments[1].followUpQuestions[1]}という意見もありますが、どう思われますか？\n\n${conversationStructure.participants.expert.role}: [専門家の回答6]。私の見解では、[専門家の洞察2-2]と考えています。`,
                duration: "7分",
                visualNotes: "実践例の映像や図解、専門家のジェスチャーに注目したカット",
                audioNotes: "セグメント2用のBGM、専門家の重要な洞察時に音楽の変化",
            },
            {
                sectionType: "segment",
                sectionTitle: conversationStructure.segments[2].title,
                content: `${conversationStructure.participants.interviewer.role}: 最後に、将来の展望について伺いたいと思います。${conversationStructure.segments[2].mainQuestion}？\n\n${conversationStructure.participants.expert.role}: 将来を予測するのは難しいですが、[専門家の回答7]。特に注目すべきは[重要ポイント3]です。\n\n${conversationStructure.participants.interviewer.role}: ${conversationStructure.segments[2].followUpQuestions[0]}についてはどうでしょうか？\n\n${conversationStructure.participants.expert.role}: [専門家の回答8]。[専門家の洞察3-1]という可能性も考えられます。\n\n${conversationStructure.participants.interviewer.role}: 最後に、${conversationStructure.segments[2].followUpQuestions[1]}？\n\n${conversationStructure.participants.expert.role}: [専門家の回答9]。私は[専門家の洞察3-2]と信じています。`,
                duration: "7分",
                visualNotes: "未来を象徴する映像、予測グラフ、専門家の表情のクローズアップ",
                audioNotes: "将来展望に合わせた前向きなBGM、締めくくりに向けて徐々に盛り上がるトーン",
            },
            {
                sectionType: "conclusion",
                content: `${conversationStructure.participants.interviewer.role}: 今日は大変貴重なお話をありがとうございました。最後に、視聴者へのメッセージをお願いできますか？\n\n${conversationStructure.participants.expert.role}: こちらこそ、お招きいただきありがとうございました。[まとめ]。[最終的な考え]。皆さんには、ぜひ[コールトゥアクション]していただければと思います。\n\n${conversationStructure.participants.interviewer.role}: 素晴らしいアドバイスをありがとうございました。視聴者の皆さん、いかがでしたか？もし質問があれば、コメント欄に残してください。チャンネル登録とグッドボタンもお忘れなく！また次回お会いしましょう！`,
                duration: "3分",
                visualNotes: "両者の2ショット、主要ポイントのまとめ表示、コールトゥアクションのテロップ、チャンネル登録ボタンの表示",
                audioNotes: "締めくくりの穏やかなBGM、エンディングテーマへの移行",
            },
        ];

        return {
            script: {
                title: conversationStructure.title,
                totalDuration: "27分",
                sections: scriptSections,
                metadata: {
                    targetKeywords: ["インタビュー", conversationStructure.title, conversationStructure.participants.expert.role, "専門家対談"],
                    thumbnailSuggestions: [
                        "専門家とインタビュアーの2ショットに魅力的なタイトルテキスト",
                        "専門家のクローズアップと「専門家が語る[トピック]の真実」などの文言",
                        "対談形式を象徴する2人の横顔シルエットデザイン"
                    ],
                    descriptionSuggestion: `このビデオでは、${conversationStructure.participants.expert.role}をゲストに迎え、${conversationStructure.title}について深く掘り下げています。${conversationStructure.introduction.topicIntroduction}について、専門家ならではの洞察と実践的なアドバイスをお届けします。`,
                },
            },
        };
    },
});

// ワークフロー定義
const youtubeLongFormConversationWorkflow = createWorkflow({
    id: 'youtube-long-form-conversation-workflow',
    description: '対話型の長尺動画台本を生成するワークフロー',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        expertRole: z.string().describe('専門家の役割/肩書き'),
        interviewerRole: z.string().optional().describe('インタビュアーの役割/肩書き'),
        keyQuestions: z.array(z.string()).describe('主要な質問事項'),
        keyPoints: z.array(z.string()).describe('伝えるべき重要なポイント'),
        conversationStyle: z.string().optional().describe('会話のスタイル（カジュアル、教育的、ディベートなど）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ'),
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
    .then(validateConversationInputStep)
    .then(designConversationStructureStep)
    .then(generateConversationScriptStep);

// ワークフローをコミット
youtubeLongFormConversationWorkflow.commit();

// エクスポート
export { youtubeLongFormConversationWorkflow };
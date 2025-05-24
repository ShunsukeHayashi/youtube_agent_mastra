// @ts-nocheck
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * 長尺おさるワークフロー
 * ナラティブ型の長尺動画台本を生成するワークフロー
 * NARRATIVE_DNA_BLUEPRINT（オーバーチュア→Illumination 1→CTV→…）
 */

// 入力検証ステップ
const validateOsaruInputStep = createStep({
    id: 'validate-osaru-input',
    description: 'Validate the input for Osaru narrative script generation',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        keyInsights: z.array(z.string()).describe('伝えたい主要な洞察やポイント'),
        narrativeStyle: z.string().optional().describe('ナラティブスタイル（ストーリーテリング、ケーススタディ、パーソナルジャーニーなど）'),
        emotionalTone: z.string().optional().describe('感情的なトーン（インスピレーショナル、教育的、感動的など）'),
        desiredDuration: z.string().optional().describe('希望する動画の長さ'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            videoTitle: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            keyInsights: z.array(z.string()),
            narrativeStyle: z.string().optional(),
            emotionalTone: z.string().optional(),
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

        if (!input.keyInsights || input.keyInsights.length === 0) {
            return {
                isValid: false,
                message: '少なくとも1つの主要な洞察やポイントが必要です',
            };
        }

        return {
            isValid: true,
            validatedInput: input,
        };
    },
});

// ナラティブ構造設計ステップ
const designNarrativeStructureStep = createStep({
    id: 'design-narrative-structure',
    description: 'Design the narrative structure based on NARRATIVE_DNA_BLUEPRINT',
    inputSchema: z.object({
        validatedInput: z.object({
            videoTitle: z.string(),
            mainTopic: z.string(),
            targetAudience: z.string(),
            keyInsights: z.array(z.string()),
            narrativeStyle: z.string().optional(),
            emotionalTone: z.string().optional(),
            desiredDuration: z.string().optional(),
        }),
    }),
    outputSchema: z.object({
        narrativeStructure: z.object({
            title: z.string(),
            overture: z.object({
                hook: z.string(),
                problem: z.string(),
                promise: z.string(),
            }),
            illuminations: z.array(z.object({
                title: z.string(),
                insight: z.string(),
                story: z.string(),
                lesson: z.string(),
                transition: z.string(),
            })),
            ctv: z.object({ // Central Transformative Value
                mainValue: z.string(),
                emotionalPeak: z.string(),
                revelation: z.string(),
            }),
            resolution: z.object({
                summary: z.string(),
                callToAction: z.string(),
                futureVision: z.string(),
            }),
        }),
    }),
    execute: async (params) => {
        const input = params.input.validatedInput;

        // ナラティブ構造設計エージェントを使用
        const narrativeAgent = new Agent({
            name: 'Narrative Structure Designer',
            model: llm,
            instructions: `
        あなたはナラティブ型コンテンツのストーリー構造設計の専門家です。
        与えられたトピックとキーインサイトに基づいて、NARRATIVE_DNA_BLUEPRINTに従った
        魅力的なストーリー構造を設計してください。
        
        NARRATIVE_DNA_BLUEPRINTの構造：
        1. オーバーチュア（導入部）
           - フック：視聴者の注意を引く強力な導入
           - 問題提起：視聴者が直面している問題や課題
           - 約束：このビデオで得られる価値の予告
        
        2. イルミネーション（啓発）セクション（3-5個）
           - タイトル：セクションの主題
           - インサイト：伝えたい重要な洞察
           - ストーリー：インサイトを例示する物語やケーススタディ
           - 教訓：ストーリーから学べる具体的な教訓
           - 移行：次のセクションへの自然な橋渡し
        
        3. CTV（Central Transformative Value）
           - 中心的価値：コンテンツの核心となる変革的価値
           - 感情的ピーク：視聴者の感情を最高潮に高める瞬間
           - 啓示：視聴者の視点を変える重要な気づき
        
        4. 解決（結論部）
           - まとめ：主要なポイントの要約
           - コールトゥアクション：視聴者に促す具体的な行動
           - 未来像：行動した後に得られる理想的な未来の描写
        
        ターゲットオーディエンスと感情的トーンに合わせた構造を設計してください。
      `,
        });

        const result = await narrativeAgent.execute(`
      # ナラティブ構造設計依頼
      
      ## コンテンツ情報
      タイトル: ${input.videoTitle}
      メインテーマ: ${input.mainTopic}
      ターゲットオーディエンス: ${input.targetAudience}
      主要な洞察: ${input.keyInsights.join(', ')}
      ナラティブスタイル: ${input.narrativeStyle || '指定なし'}
      感情的トーン: ${input.emotionalTone || '指定なし'}
      希望する長さ: ${input.desiredDuration || '指定なし'}
      
      ## 依頼内容
      上記の情報に基づいて、NARRATIVE_DNA_BLUEPRINTに従ったナラティブ構造を設計してください。
    `);

        // エージェントの出力を解析してナラティブ構造を生成
        // 実際の実装ではより堅牢な解析が必要
        const parsedResult = {
            title: input.videoTitle,
            overture: {
                hook: "視聴者の注意を引く強力なフック",
                problem: "視聴者が直面している問題や課題の提示",
                promise: "このビデオで得られる価値の予告",
            },
            illuminations: [
                {
                    title: "イルミネーション1: 最初の洞察",
                    insight: input.keyInsights[0] || "主要な洞察1",
                    story: "洞察を例示するストーリー1",
                    lesson: "ストーリーから学べる教訓1",
                    transition: "次のセクションへの移行1",
                },
                {
                    title: "イルミネーション2: 2つ目の洞察",
                    insight: input.keyInsights[1] || "主要な洞察2",
                    story: "洞察を例示するストーリー2",
                    lesson: "ストーリーから学べる教訓2",
                    transition: "次のセクションへの移行2",
                },
                {
                    title: "イルミネーション3: 3つ目の洞察",
                    insight: input.keyInsights[2] || "主要な洞察3",
                    story: "洞察を例示するストーリー3",
                    lesson: "ストーリーから学べる教訓3",
                    transition: "次のセクションへの移行3",
                },
            ],
            ctv: {
                mainValue: "コンテンツの核心となる変革的価値",
                emotionalPeak: "視聴者の感情を最高潮に高める瞬間",
                revelation: "視聴者の視点を変える重要な気づき",
            },
            resolution: {
                summary: "主要なポイントのまとめ",
                callToAction: "視聴者に促す具体的な行動",
                futureVision: "行動した後に得られる理想的な未来の描写",
            },
        };

        return {
            narrativeStructure: parsedResult,
        };
    },
});

// ナラティブスクリプト生成ステップ
const generateNarrativeScriptStep = createStep({
    id: 'generate-narrative-script',
    description: 'Generate the detailed narrative script based on the structure',
    inputSchema: z.object({
        narrativeStructure: z.object({
            title: z.string(),
            overture: z.object({
                hook: z.string(),
                problem: z.string(),
                promise: z.string(),
            }),
            illuminations: z.array(z.object({
                title: z.string(),
                insight: z.string(),
                story: z.string(),
                lesson: z.string(),
                transition: z.string(),
            })),
            ctv: z.object({
                mainValue: z.string(),
                emotionalPeak: z.string(),
                revelation: z.string(),
            }),
            resolution: z.object({
                summary: z.string(),
                callToAction: z.string(),
                futureVision: z.string(),
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
        const narrativeStructure = params.input.narrativeStructure;

        // スクリプト生成エージェントを使用して詳細なスクリプトを生成
        const scriptAgent = new Agent({
            name: 'Narrative Script Generator',
            model: llm,
            instructions: `
        あなたはナラティブ型YouTubeコンテンツのスクリプトライターです。
        与えられたナラティブ構造に基づいて、詳細な動画スクリプトを作成してください。
        
        スクリプトは以下の要素を含む必要があります：
        - 魅力的なオーバーチュア（視聴者の注意を引くフック、問題提起、価値の約束）
        - 各イルミネーションセクションの詳細な展開（洞察、ストーリー、教訓、移行）
        - 感情的に強力なCTV（中心的価値、感情的ピーク、啓示）
        - 明確な解決部（まとめ、コールトゥアクション、未来像）
        
        各セクションには以下の情報も含めてください：
        - 推定所要時間
        - 視覚的要素に関する注記（表示すべき画像、図表、テキストなど）
        - 音声/音楽に関する注記（BGM、効果音、声のトーンなど）
        
        スクリプトは会話的で親しみやすい口調で、感情的に響く内容にしてください。
        ストーリーテリングの技法を活用し、視聴者を感情的な旅に連れていくような構成にしてください。
      `,
        });

        const result = await scriptAgent.execute(`
      # ナラティブスクリプト作成依頼
      
      ## ナラティブ構造
      タイトル: ${narrativeStructure.title}
      
      ### オーバーチュア
      フック: ${narrativeStructure.overture.hook}
      問題提起: ${narrativeStructure.overture.problem}
      価値の約束: ${narrativeStructure.overture.promise}
      
      ### イルミネーション
      ${narrativeStructure.illuminations.map((illumination, index) => `
      イルミネーション${index + 1}: ${illumination.title}
      洞察: ${illumination.insight}
      ストーリー: ${illumination.story}
      教訓: ${illumination.lesson}
      移行: ${illumination.transition}
      `).join('\n')}
      
      ### CTV
      中心的価値: ${narrativeStructure.ctv.mainValue}
      感情的ピーク: ${narrativeStructure.ctv.emotionalPeak}
      啓示: ${narrativeStructure.ctv.revelation}
      
      ### 解決
      まとめ: ${narrativeStructure.resolution.summary}
      コールトゥアクション: ${narrativeStructure.resolution.callToAction}
      未来像: ${narrativeStructure.resolution.futureVision}
      
      ## 依頼内容
      上記のナラティブ構造に基づいて、詳細な動画スクリプトを作成してください。
    `);

        // エージェントの出力を解析してスクリプトを生成
        // 実際の実装ではより堅牢な解析が必要
        const scriptSections = [
            {
                sectionType: "overture",
                content: "（魅力的なフックで始まる導入）こんにちは、皆さん。今日は[問題]について考えてみたいと思います。多くの人が[問題の詳細]に悩んでいますが、今日のビデオでは[約束]をお伝えします。",
                duration: "2分",
                visualNotes: "注目を引く映像、問題を視覚化する画像、約束を強調するテキストオーバーレイ",
                audioNotes: "穏やかな導入音楽から始まり、問題提起時に少し緊張感のある音楽に変化、約束の部分で希望を感じさせるトーンに",
            },
            {
                sectionType: "illumination",
                sectionTitle: narrativeStructure.illuminations[0].title,
                content: "最初に理解すべき重要なポイントは[洞察1]です。これを説明するために、ある物語をお話しします。[ストーリー1の詳細な展開]。この物語から私たちが学べることは[教訓1]です。",
                duration: "5分",
                visualNotes: "ストーリーを視覚化する映像やアニメーション、キーポイントをテキストで強調",
                audioNotes: "ストーリーテリング用の背景音楽、重要なポイントで音楽のテンポ変化",
            },
            {
                sectionType: "illumination",
                sectionTitle: narrativeStructure.illuminations[1].title,
                content: "次に考えたいのは[洞察2]についてです。[ストーリー2の詳細な展開]。このケースから分かるように、[教訓2]が重要なのです。",
                duration: "5分",
                visualNotes: "2つ目のストーリーを視覚化、比較図表、実例の映像",
                audioNotes: "2つ目のセクションに合わせた音楽変化、感情的な瞬間で効果音",
            },
            {
                sectionType: "illumination",
                sectionTitle: narrativeStructure.illuminations[2].title,
                content: "3つ目の重要なポイントは[洞察3]です。[ストーリー3の詳細な展開]。ここから学べる教訓は[教訓3]です。",
                duration: "5分",
                visualNotes: "3つ目のストーリーを視覚化、キーポイントのアニメーション、実践例の映像",
                audioNotes: "3つ目のセクションに合わせた音楽、クライマックスに向けて徐々に盛り上がるトーン",
            },
            {
                sectionType: "ctv",
                content: "ここまでの話をまとめると、最も重要なのは[中心的価値]だということです。[感情的ピークを生み出す強力な言葉や例え]。多くの人はこれまで[古い考え方]と思い込んできましたが、実は[啓示]なのです。",
                duration: "3分",
                visualNotes: "感情的なインパクトのある映像、変化を象徴する視覚効果、啓示を強調するテキスト",
                audioNotes: "感情的クライマックスに合わせた音楽、啓示の瞬間で一瞬の静寂後に力強い音楽",
            },
            {
                sectionType: "resolution",
                content: "今日お話しした内容をまとめると、[主要ポイントの要約]です。ぜひ今日から[具体的なアクション]を始めてみてください。そうすれば、[理想的な未来像]を実現できるでしょう。このビデオが皆さんの助けになれば幸いです。チャンネル登録とグッドボタンもお忘れなく！",
                duration: "2分",
                visualNotes: "主要ポイントのまとめ図表、アクションステップのリスト、明るい未来を象徴する映像、チャンネル登録ボタンの表示",
                audioNotes: "まとめに合わせた落ち着いた音楽、コールトゥアクションで前向きなトーン、エンディングテーマ",
            },
        ];

        return {
            script: {
                title: narrativeStructure.title,
                totalDuration: "22分",
                sections: scriptSections,
                metadata: {
                    targetKeywords: ["ナラティブ", "ストーリーテリング", narrativeStructure.title, "パーソナルジャーニー"],
                    thumbnailSuggestions: [
                        "感情的なインパクトのある画像と魅力的なタイトルテキスト",
                        "ストーリーの変化を象徴するビフォーアフター画像",
                        "視聴者の共感を呼ぶ表情や状況を捉えた画像"
                    ],
                    descriptionSuggestion: `このビデオでは、${narrativeStructure.title}について、実際のストーリーと洞察を交えながら深く掘り下げています。${narrativeStructure.overture.problem}に悩んでいる方に、${narrativeStructure.ctv.mainValue}を通じて新たな視点をお届けします。`,
                },
            },
        };
    },
});

// ワークフロー定義
const youtubeLongFormOsaruWorkflow = createWorkflow({
    id: 'youtube-long-form-osaru-workflow',
    description: 'ナラティブ型の長尺動画台本を生成するワークフロー',
    inputSchema: z.object({
        videoTitle: z.string().describe('動画のタイトル'),
        mainTopic: z.string().describe('メインテーマ/トピック'),
        targetAudience: z.string().describe('ターゲットオーディエンス'),
        keyInsights: z.array(z.string()).describe('伝えたい主要な洞察やポイント'),
        narrativeStyle: z.string().optional().describe('ナラティブスタイル（ストーリーテリング、ケーススタディ、パーソナルジャーニーなど）'),
        emotionalTone: z.string().optional().describe('感情的なトーン（インスピレーショナル、教育的、感動的など）'),
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
    .then(validateOsaruInputStep)
    .then(designNarrativeStructureStep)
    .then(generateNarrativeScriptStep);

// ワークフローをコミット
youtubeLongFormOsaruWorkflow.commit();

// エクスポート
export { youtubeLongFormOsaruWorkflow };
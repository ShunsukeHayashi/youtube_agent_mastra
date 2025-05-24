/**
 * Vercel AI SDKを使用したYouTube動画スクリプト生成ワークフロー（LangChainから移行）
 */

import { z } from "zod";
import { openai } from '@ai-sdk/openai';
import { youtubeVideoScriptGeneratorTool } from '../tools/videoScriptGenerator';
import { youtubeVideoPlanningTool } from '../tools/videoPlanningSeo';

// モデルの初期化
const llm = openai('gpt-4o');

// 出力スキーマの定義
const outputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
        title: z.string(),
        introduction: z.string(),
        sections: z.array(z.object({
            title: z.string(),
            content: z.string(),
            duration: z.string(),
            purpose: z.string(),
        })),
        conclusion: z.string(),
        callToAction: z.string(),
        fullScript: z.string(),
        metadata: z.object({
            estimatedDuration: z.string(),
            wordCount: z.number(),
            targetAudience: z.string(),
            keywordsUsed: z.array(z.string()),
            processingTime: z.number(),
        }),
        analysis: z.string(),
        suggestions: z.array(z.string()),
    }).optional(),
});

// スクリプト生成チェーンの作成関数
const createYoutubeVideoScriptGeneratorChain = async () => {
    return {
        invoke: async (input: any) => {
            try {
                console.log("入力データを処理中:", input);

                // 入力の検証
                if (!input.topic) {
                    return {
                        success: false,
                        message: "Topic is required",
                    };
                }

                if (!input.targetAudience) {
                    return {
                        success: false,
                        message: "Target audience is required",
                    };
                }

                // 動画企画データの生成（オプション）
                let videoPlanningData = null;
                if (input.usePlanningData) {
                    try {
                        videoPlanningData = await youtubeVideoPlanningTool.invoke({
                            channelConcept: `${input.topic}に関するYouTubeチャンネル`,
                            targetAudience: input.targetAudience,
                            videoTopic: input.topic,
                            existingKeywords: input.keywords || [],
                            videoDuration: input.scriptLength === 'short' ? '5-10 minutes' :
                                input.scriptLength === 'medium' ? '10-15 minutes' :
                                    '15-20 minutes',
                            contentGoal: input.scriptStyle === '教育的' ? 'educate' :
                                input.scriptStyle === 'エンターテイメント' ? 'entertain' :
                                    'convert',
                        });
                    } catch (error) {
                        console.error('Error generating video planning data:', error);
                        // エラーが発生しても処理を続行
                    }
                }

                // スクリプトの生成
                const scriptResult = await youtubeVideoScriptGeneratorTool.invoke({
                    topic: input.topic,
                    keywords: input.keywords || [],
                    targetAudience: input.targetAudience,
                    scriptStyle: input.scriptStyle || '教育的',
                    scriptTone: input.scriptTone || 'カジュアル',
                    scriptLength: input.scriptLength || 'medium',
                    includeTimestamps: input.includeTimestamps || false,
                    videoPlanningData,
                });

                // スクリプトの分析
                const analysisPrompt = `
以下のYouTube動画スクリプトを分析し、フィードバックを提供してください：

タイトル: ${scriptResult.title}

イントロダクション:
${scriptResult.introduction}

セクション数: ${scriptResult.sections.length}

結論:
${scriptResult.conclusion}

コール・トゥ・アクション:
${scriptResult.callToAction}

メタデータ:
- 推定時間: ${scriptResult.metadata.estimatedDuration}
- 単語数: ${scriptResult.metadata.wordCount}
- ターゲットオーディエンス: ${scriptResult.metadata.targetAudience}
- 使用キーワード: ${scriptResult.metadata.keywordsUsed.join(', ')}

以下の点について分析してください：
1. スクリプトの強み
2. 改善点
3. SEO最適化の観点からの評価
4. 視聴者の関心を維持するための工夫
5. コール・トゥ・アクションの効果

具体的な改善提案も3つ以上提供してください。
`;

                const analysisResponse = await llm.doGenerate({
                    inputFormat: "messages",
                    mode: { type: "regular" },
                    prompt: [{ role: "user", content: [{ type: "text", text: analysisPrompt }] }],
                    temperature: 0.7,
                    maxTokens: 4000,
                });
                const analysisText = analysisResponse.text || '';

                // 分析テキストから提案を抽出
                const suggestionMatch = analysisText.match(/改善提案：([\s\S]*?)(?:\n\n|$)/);
                const suggestions = suggestionMatch
                    ? suggestionMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-')).map((line: string) => line.trim().substring(2))
                    : ['スクリプトの導入部をより注目を集めるものにする', 'キーワードの使用頻度を増やす', 'セクション間の移行をよりスムーズにする'];

                return {
                    success: true,
                    message: "スクリプト生成と分析が完了しました",
                    result: {
                        ...scriptResult,
                        analysis: analysisText,
                        suggestions,
                    }
                };
            } catch (error) {
                console.error('Error in script generation chain:', error);
                return {
                    success: false,
                    message: `エラーが発生しました: ${error}`,
                };
            }
        }
    };
};

// エクスポート
export const youtubeVideoScriptGeneratorChain = {
    create: createYoutubeVideoScriptGeneratorChain
};
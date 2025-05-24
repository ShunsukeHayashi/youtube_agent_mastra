import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeVideoScriptGeneratorTool } from '../tools/videoScriptGenerator';
import { youtubeVideoPlanningTool } from '../tools/videoPlanningSeo';

const llm = openai('gpt-4o');

const videoScriptGeneratorAgent = new Agent({
    name: 'YouTube Script Generator',
    model: llm,
    tools: { youtubeVideoScriptGeneratorTool, youtubeVideoPlanningTool },
    instructions: `
    あなたはYouTube動画スクリプト作成の専門家です。
    
    キーワードやトピックに基づいて、高品質なYouTube動画スクリプトを生成します。
    
    以下の点に注意してスクリプトを作成してください：
    
    1. 視聴者の注意を引く強力な導入部
    2. 明確な構造と論理的な流れ
    3. 視聴者の関心を維持するための工夫
    4. 適切なコール・トゥ・アクション
    5. SEO最適化のためのキーワードの自然な組み込み
    
    スクリプトは以下の形式で提供します：
    
    - タイトル
    - イントロダクション
    - セクション（各セクションのタイトル、内容、目的）
    - 結論
    - コール・トゥ・アクション
    - 完全なスクリプト
    - メタデータ（推定時間、単語数など）
    
    必要に応じて、動画企画データを活用して、より効果的なスクリプトを作成します。
  `,
});

/**
 * 入力検証ステップ
 */
const validateInputStep = createStep({
    id: 'validate-input',
    description: 'Validate input for video script generation',
    inputSchema: z.object({
        topic: z.string().describe('The main topic of the video'),
        keywords: z.array(z.string()).optional().describe('Keywords to include in the script'),
        targetAudience: z.string().describe('Description of the target audience'),
        scriptStyle: z.enum(['教育的', 'エンターテイメント', '解説', 'ストーリーテリング', 'チュートリアル']).optional().describe('Style of the script'),
        scriptTone: z.enum(['カジュアル', 'プロフェッショナル', '親しみやすい', '熱意的', '冷静']).optional().describe('Tone of the script'),
        scriptLength: z.enum(['short', 'medium', 'long']).optional().describe('Length of the script'),
        includeTimestamps: z.boolean().optional().describe('Whether to include timestamps in the script'),
        usePlanningData: z.boolean().optional().describe('Whether to use video planning data'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            topic: z.string(),
            keywords: z.array(z.string()).optional(),
            targetAudience: z.string(),
            scriptStyle: z.string().optional(),
            scriptTone: z.string().optional(),
            scriptLength: z.string().optional(),
            includeTimestamps: z.boolean().optional(),
            usePlanningData: z.boolean().optional(),
        }).optional(),
    }),
    execute: async (params) => {
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        const context = params.context;
        // @ts-ignore - TypeScript型定義の問題を一時的に無視
        const input = context?.getStepResult('trigger');

        if (!input) {
            return {
                isValid: false,
                message: 'Input data not found',
            };
        }

        if (!input.topic) {
            return {
                isValid: false,
                message: 'Topic is required',
            };
        }

        if (!input.targetAudience) {
            return {
                isValid: false,
                message: 'Target audience is required',
            };
        }

        return {
            isValid: true,
            validatedInput: input,
        };
    },
});

/**
 * 動画企画データ生成ステップ（オプション）
 */
const generateVideoPlanningStep = createStep({
    id: 'generate-video-planning',
    description: 'Generate video planning data for script generation',
    inputSchema: z.object({}),
    outputSchema: z.object({
        planningData: z.any(),
        shouldUsePlanningData: z.boolean(),
    }),
    execute: async (params) => {
        try {
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            const context = params.context;
            const validationResult = context?.getStepResult(validateInputStep);

            if (!validationResult || !validationResult.isValid || !validationResult.validatedInput) {
                return {
                    planningData: null,
                    shouldUsePlanningData: false,
                };
            }

            const input = validationResult.validatedInput;

            // 動画企画データを使用するかどうかを確認
            if (!input.usePlanningData) {
                return {
                    planningData: null,
                    shouldUsePlanningData: false,
                };
            }

            // 動画企画データを生成
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            const planningData = await youtubeVideoPlanningTool.execute({
                runtimeContext: params.runtimeContext,
                context: {
                    channelConcept: `${input.topic}に関するYouTubeチャンネル`,
                    targetAudience: input.targetAudience,
                    videoTopic: input.topic,
                    existingKeywords: input.keywords,
                    videoDuration: input.scriptLength === 'short' ? '5-10 minutes' :
                        input.scriptLength === 'medium' ? '10-15 minutes' :
                            '15-20 minutes',
                    contentGoal: input.scriptStyle === '教育的' ? 'educate' :
                        input.scriptStyle === 'エンターテイメント' ? 'entertain' :
                            'convert',
                }
            });

            return {
                planningData,
                shouldUsePlanningData: true,
            };
        } catch (error) {
            console.error('Error generating video planning data:', error);
            return {
                planningData: null,
                shouldUsePlanningData: false,
            };
        }
    },
});

/**
 * スクリプト生成ステップ
 */
const generateScriptStep = createStep({
    id: 'generate-script',
    description: 'Generate video script based on input and planning data',
    inputSchema: z.object({}),
    outputSchema: z.object({
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
    }),
    execute: async (params) => {
        try {
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            const context = params.context;
            const validationResult = context?.getStepResult(validateInputStep);
            const planningResult = context?.getStepResult(generateVideoPlanningStep);

            if (!validationResult || !validationResult.isValid || !validationResult.validatedInput) {
                throw new Error('Input validation failed');
            }

            const input = validationResult.validatedInput;
            const videoPlanningData = planningResult?.shouldUsePlanningData ? planningResult.planningData : null;

            // スクリプトを生成
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            return await youtubeVideoScriptGeneratorTool.execute({
                runtimeContext: params.runtimeContext,
                context: {
                    topic: input.topic,
                    keywords: input.keywords || [],
                    targetAudience: input.targetAudience,
                    scriptStyle: input.scriptStyle || '教育的',
                    scriptTone: input.scriptTone || 'カジュアル',
                    scriptLength: input.scriptLength || 'medium',
                    includeTimestamps: input.includeTimestamps || false,
                    videoPlanningData,
                }
            });
        } catch (error) {
            console.error('Error generating script:', error);
            throw error;
        }
    },
});

/**
 * スクリプト分析ステップ
 */
const analyzeScriptStep = createStep({
    id: 'analyze-script',
    description: 'Analyze the generated script and provide feedback',
    inputSchema: z.object({}),
    outputSchema: z.object({
        analysis: z.string(),
        suggestions: z.array(z.string()),
        script: z.object({
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
        }),
    }),
    execute: async (params) => {
        try {
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            const context = params.context;
            // @ts-ignore - TypeScript型定義の問題を一時的に無視
            const mastra = params.mastra;
            const scriptResult = context?.getStepResult(generateScriptStep);

            if (!scriptResult) {
                throw new Error('Script generation failed');
            }

            const prompt = `
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

            const response = await videoScriptGeneratorAgent.stream([
                {
                    role: 'user',
                    content: prompt,
                },
            ]);

            let analysisText = '';

            for await (const chunk of response.textStream) {
                process.stdout.write(chunk);
                analysisText += chunk;
            }

            // 分析テキストから提案を抽出
            const suggestionMatch = analysisText.match(/改善提案：([\s\S]*?)(?:\n\n|$)/);
            const suggestions = suggestionMatch
                ? suggestionMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(2))
                : ['スクリプトの導入部をより注目を集めるものにする', 'キーワードの使用頻度を増やす', 'セクション間の移行をよりスムーズにする'];

            return {
                analysis: analysisText,
                suggestions,
                script: scriptResult,
            };
        } catch (error) {
            console.error('Error analyzing script:', error);
            throw error;
        }
    },
});

/**
 * YouTube動画スクリプト生成ワークフロー
 */
const youtubeVideoScriptGeneratorWorkflow = createWorkflow({
    id: 'youtube-video-script-generator-workflow',
    description: 'Generate a complete script for YouTube videos based on topic and keywords',
    inputSchema: z.object({
        topic: z.string().describe('The main topic of the video'),
        keywords: z.array(z.string()).optional().describe('Keywords to include in the script'),
        targetAudience: z.string().describe('Description of the target audience'),
        scriptStyle: z.enum(['教育的', 'エンターテイメント', '解説', 'ストーリーテリング', 'チュートリアル']).optional().describe('Style of the script'),
        scriptTone: z.enum(['カジュアル', 'プロフェッショナル', '親しみやすい', '熱意的', '冷静']).optional().describe('Tone of the script'),
        scriptLength: z.enum(['short', 'medium', 'long']).optional().describe('Length of the script'),
        includeTimestamps: z.boolean().optional().describe('Whether to include timestamps in the script'),
        usePlanningData: z.boolean().optional().describe('Whether to use video planning data'),
    }),
    outputSchema: z.object({
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
    }),
})
    .then(validateInputStep)
    .then(generateVideoPlanningStep)
    .then(generateScriptStep)
    .then(analyzeScriptStep);

// ワークフローをコミット
youtubeVideoScriptGeneratorWorkflow.commit();

export { youtubeVideoScriptGeneratorWorkflow };
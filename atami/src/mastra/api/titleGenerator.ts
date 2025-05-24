/**
 * YouTubeタイトル生成APIエンドポイント
 * Vercel AI SDKを使用したワークフローを呼び出す
 */

import { z } from 'zod';
import { registerApiRoute } from '@mastra/core/server';
import { youtubeTitleGeneratorVercelAI } from '../workflows/titleGeneratorWorkflow.vercel-ai';

// 入力スキーマの定義
const inputSchema = z.object({
    videoTopic: z.string().describe('動画のトピック'),
    targetAudience: z.string().optional().describe('ターゲットオーディエンス'),
    contentType: z.string().optional().describe('コンテンツタイプ（教育、エンターテイメントなど）'),
    keyPoints: z.array(z.string()).optional().describe('動画の主要ポイント'),
    competitorTitles: z.array(z.string()).optional().describe('競合動画のタイトル'),
    titleCount: z.number().optional().default(5).describe('生成するタイトル数'),
});

// APIエンドポイントの登録
export const titleGeneratorApi = registerApiRoute('/title-generator', {
    method: 'post',
    handler: async (c) => {
        try {
            // リクエストボディの取得と検証
            const body = await c.req.json();
            const validationResult = inputSchema.safeParse(body);

            if (!validationResult.success) {
                return c.json({
                    success: false,
                    message: '入力データが無効です',
                    errors: validationResult.error.format(),
                }, 400);
            }

            // Vercel AI SDKを使用したワークフローの実行
            const result = await youtubeTitleGeneratorVercelAI.generate(validationResult.data);

            // 結果を返す
            return c.json(result);
        } catch (error) {
            console.error('タイトル生成中にエラーが発生しました:', error);
            return c.json({
                success: false,
                message: `エラーが発生しました: ${error}`,
            }, 500);
        }
    },
    openapi: {
        summary: 'YouTubeタイトル生成API',
        description: 'Vercel AI SDKを使用して、YouTubeタイトルとサムネイルテキストを生成します',
        tags: ['title-generator'],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['videoTopic'],
                        properties: {
                            videoTopic: {
                                type: 'string',
                                description: '動画のトピック',
                                example: 'プログラミング初心者向けのJavaScript入門講座',
                            },
                            targetAudience: {
                                type: 'string',
                                description: 'ターゲットオーディエンス',
                                example: 'プログラミング初心者、20代〜30代',
                            },
                            contentType: {
                                type: 'string',
                                description: 'コンテンツタイプ（教育、エンターテイメントなど）',
                                example: '教育',
                            },
                            keyPoints: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                                description: '動画の主要ポイント',
                                example: ['変数の基本', '関数の使い方', '条件分岐', 'ループ処理'],
                            },
                            competitorTitles: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                                description: '競合動画のタイトル',
                                example: [
                                    'JavaScript入門講座 - 初心者でも分かる基礎から応用まで',
                                    '【初心者向け】JavaScriptの基本を1時間で学ぼう',
                                ],
                            },
                            titleCount: {
                                type: 'number',
                                description: '生成するタイトル数',
                                default: 5,
                                example: 5,
                            },
                        },
                    },
                },
            },
        },
        responses: {
            '200': {
                description: '成功',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                success: {
                                    type: 'boolean',
                                    description: '処理が成功したかどうか',
                                },
                                message: {
                                    type: 'string',
                                    description: '処理結果のメッセージ',
                                },
                                result: {
                                    type: 'object',
                                    properties: {
                                        titles: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                            },
                                            description: '生成されたタイトル',
                                        },
                                        thumbnailTexts: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                            },
                                            description: '生成されたサムネイルテキスト',
                                        },
                                        analysis: {
                                            type: 'string',
                                            description: 'タイトルとサムネイルテキストの分析',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '400': {
                description: '入力データが無効',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                success: {
                                    type: 'boolean',
                                    example: false,
                                },
                                message: {
                                    type: 'string',
                                    example: '入力データが無効です',
                                },
                                errors: {
                                    type: 'object',
                                    description: '検証エラーの詳細',
                                },
                            },
                        },
                    },
                },
            },
            '500': {
                description: 'サーバーエラー',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                success: {
                                    type: 'boolean',
                                    example: false,
                                },
                                message: {
                                    type: 'string',
                                    example: 'エラーが発生しました',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});
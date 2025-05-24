/**
 * Vercel AI SDKを使用したYouTubeタイトル生成ワークフロー（LangChainから移行）
 */

// .envファイルを読み込む
import dotenv from 'dotenv';
dotenv.config();

import { z } from "zod";
import { openai } from '@ai-sdk/openai';

// モデルの初期化
const llm = openai('gpt-4o');

// 出力スキーマの定義
const outputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
        titles: z.array(z.string()),
        thumbnailTexts: z.array(z.string()),
        analysis: z.string(),
    }).optional(),
});

// シンプルなチェーンの作成関数
const createYoutubeTitleGeneratorChain = async () => {
    return {
        invoke: async (input: any) => {
            console.log("入力データを処理中:", input);
            console.log("タイトル生成処理を実行中...");

            try {
                // タイトル生成プロンプト
                const titlePrompt = `
あなたはYouTubeタイトルとサムネイルテキストの生成の専門家です。
以下の情報に基づいて、魅力的なYouTubeタイトルとサムネイルテキストを生成してください。

## 動画トピック
${input.videoTopic}

## ターゲットオーディエンス
${input.targetAudience || 'プログラミング初心者、20代〜30代'}

## コンテンツタイプ
${input.contentType || '教育'}

## キーポイント
${input.keyPoints ? input.keyPoints.join(', ') : '変数の基本, 関数の使い方, 条件分岐, ループ処理'}

## 競合タイトル
${input.competitorTitles ? input.competitorTitles.join('\n') : '- JavaScript入門講座 - 初心者でも分かる基礎から応用まで\n- 【初心者向け】JavaScriptの基本を1時間で学ぼう\n- プログラミング未経験者でも分かるJavaScript入門'}

以下の形式で出力してください：

1. タイトル（${input.titleCount || 5}個）:
- タイトル1
- タイトル2
...

2. サムネイルテキスト（${input.titleCount || 5}個）:
- サムネイルテキスト1
- サムネイルテキスト2
...
`;

                // タイトル生成
                const titleResponse = await llm.doGenerate({
                    inputFormat: "messages",
                    mode: { type: "regular" },
                    prompt: [{ role: "user", content: [{ type: "text", text: titlePrompt }] }],
                    temperature: 0.7,
                    maxTokens: 4000,
                });
                const titleContent = titleResponse.text || '';

                // タイトルとサムネイルテキストを抽出
                const titleMatch = titleContent.match(/1\. タイトル[^-]+((?:-[^\n]+\n)+)/s);
                const thumbnailMatch = titleContent.match(/2\. サムネイルテキスト[^-]+((?:-[^\n]+\n)+)/s);

                const titles = titleMatch
                    ? titleMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
                    : [
                        `【初心者必見】JavaScriptの基本を1から学ぶ完全ガイド | ${input.keyPoints?.[0] || '変数'} から ${input.keyPoints?.[1] || '関数'} まで`,
                        `【${input.targetAudience?.split('、')[0] || 'プログラミング初心者'}向け】JavaScriptマスター講座 - ${input.keyPoints?.[2] || '条件分岐'} と ${input.keyPoints?.[3] || 'ループ処理'} を徹底解説`,
                        `JavaScript入門2025 - コードが書けない人でもわかる基礎から応用まで`,
                        `【実践で学ぶ】JavaScriptプログラミング入門 - 現役エンジニアが教える基本スキル`,
                        `ゼロからはじめるJavaScript講座 - 初心者でも挫折しない学習法`
                    ];

                const thumbnailTexts = thumbnailMatch
                    ? thumbnailMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
                    : [
                        "JavaScript入門【初心者でも分かる】",
                        "【完全保存版】JavaScript基礎講座",
                        "0から学ぶJavaScript",
                        "挫折しないJavaScript入門",
                        "現役エンジニアが教えるJS入門"
                    ];

                // 分析プロンプト
                const analysisPrompt = `
あなたはYouTubeマーケティング戦略の専門家です。以下のタイトルとサムネイルテキストを分析し、戦略的な洞察を提供してください。

## 動画トピック
${input.videoTopic}

## ターゲットオーディエンス
${input.targetAudience || 'プログラミング初心者、20代〜30代'}

## タイトル
${titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

## サムネイルテキスト
${thumbnailTexts.map((text, index) => `${index + 1}. ${text}`).join('\n')}

以下の観点から分析してください：
1. クリック率の可能性
2. 複数のペルソナに対する訴求力
3. 使用されている心理的トリガー
4. SEO効果
5. 全体的なマーケティング戦略

最も効果的なタイトルとサムネイルテキストの組み合わせを3つ推奨し、その理由を説明してください。
`;

                // 分析実行
                const analysisResponse = await llm.doGenerate({
                    inputFormat: "messages",
                    mode: { type: "regular" },
                    prompt: [{ role: "user", content: [{ type: "text", text: analysisPrompt }] }],
                    temperature: 0.7,
                    maxTokens: 4000,
                });
                const analysis = analysisResponse.text || '';

                return {
                    success: true,
                    message: "タイトルとサムネイルテキストの生成が完了しました",
                    result: {
                        titles,
                        thumbnailTexts,
                        analysis
                    }
                };
            } catch (error) {
                console.error('エラーが発生しました:', error);
                return {
                    success: false,
                    message: `エラーが発生しました: ${error}`,
                };
            }
        }
    };
};

// エクスポート
export const youtubeTitleGeneratorChain = {
    create: createYoutubeTitleGeneratorChain
};

// デフォルトエクスポート
export default {
    youtubeTitleGeneratorChain
};
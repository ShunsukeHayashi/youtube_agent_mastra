/**
 * Vercel AI SDKを使用したYouTubeタイトル生成ワークフロー
 */

// .envファイルを読み込む
import dotenv from 'dotenv';
dotenv.config();

import { z } from "zod";
import { openai } from '@ai-sdk/openai';

// モデルの初期化
const llm = openai('gpt-4o');

// 入力スキーマの定義
const inputSchema = z.object({
    videoTopic: z.string().describe('動画のトピック'),
    targetAudience: z.string().optional().describe('ターゲットオーディエンス'),
    contentType: z.string().optional().describe('コンテンツタイプ（教育、エンターテイメントなど）'),
    keyPoints: z.array(z.string()).optional().describe('動画の主要ポイント'),
    competitorTitles: z.array(z.string()).optional().describe('競合動画のタイトル'),
    titleCount: z.number().optional().default(5).describe('生成するタイトル数'),
});

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

// タイトル生成関数
export async function generateTitles(input: z.infer<typeof inputSchema>) {
    try {
        // 入力の検証
        const validatedInput = inputSchema.parse(input);

        // タイトル生成プロンプト
        const titlePrompt = `
あなたはYouTubeタイトルとサムネイルテキストの生成の専門家です。
以下の情報に基づいて、魅力的なYouTubeタイトルとサムネイルテキストを生成してください。

## 動画トピック
${validatedInput.videoTopic}

## ターゲットオーディエンス
${validatedInput.targetAudience || 'プログラミング初心者、20代〜30代'}

## コンテンツタイプ
${validatedInput.contentType || '教育'}

## キーポイント
${validatedInput.keyPoints ? validatedInput.keyPoints.join(', ') : '変数の基本, 関数の使い方, 条件分岐, ループ処理'}

## 競合タイトル
${validatedInput.competitorTitles ? validatedInput.competitorTitles.join('\n') : '- JavaScript入門講座 - 初心者でも分かる基礎から応用まで\n- 【初心者向け】JavaScriptの基本を1時間で学ぼう\n- プログラミング未経験者でも分かるJavaScript入門'}

以下の形式で出力してください：

1. タイトル（${validatedInput.titleCount}個）:
- タイトル1
- タイトル2
...

2. サムネイルテキスト（${validatedInput.titleCount}個）:
- サムネイルテキスト1
- サムネイルテキスト2
...
`;

        // Vercel AI SDKを使用してタイトル生成（ストリーミングなし）
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
            ? titleMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-')).map((line: string) => line.trim().substring(1).trim())
            : [
                `【初心者必見】${validatedInput.videoTopic}の基本を1から学ぶ完全ガイド`,
                `【${validatedInput.targetAudience?.split('、')[0] || 'プログラミング初心者'}向け】${validatedInput.videoTopic}マスター講座`,
                `${validatedInput.videoTopic}入門2025 - 初心者でもわかる基礎から応用まで`,
                `【実践で学ぶ】${validatedInput.videoTopic} - 現役エンジニアが教える基本スキル`,
                `ゼロからはじめる${validatedInput.videoTopic} - 初心者でも挫折しない学習法`
            ];

        const thumbnailTexts = thumbnailMatch
            ? thumbnailMatch[1].split('\n').filter((line: string) => line.trim().startsWith('-')).map((line: string) => line.trim().substring(1).trim())
            : [
                `${validatedInput.videoTopic}【初心者でも分かる】`,
                `【完全保存版】${validatedInput.videoTopic}基礎講座`,
                `0から学ぶ${validatedInput.videoTopic}`,
                `挫折しない${validatedInput.videoTopic}入門`,
                `現役エンジニアが教える${validatedInput.videoTopic}`
            ];

        // 分析プロンプト
        const analysisPrompt = `
あなたはYouTubeマーケティング戦略の専門家です。以下のタイトルとサムネイルテキストを分析し、戦略的な洞察を提供してください。

## 動画トピック
${validatedInput.videoTopic}

## ターゲットオーディエンス
${validatedInput.targetAudience || 'プログラミング初心者、20代〜30代'}

## タイトル
${titles.map((title: string, index: number) => `${index + 1}. ${title}`).join('\n')}

## サムネイルテキスト
${thumbnailTexts.map((text: string, index: number) => `${index + 1}. ${text}`).join('\n')}

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

        // 結果を返す
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

// ストリーミング機能は現在のプロジェクト構成では実装しない

// エクスポート
export const youtubeTitleGeneratorVercelAI = {
    generate: generateTitles,
};

export default youtubeTitleGeneratorVercelAI;
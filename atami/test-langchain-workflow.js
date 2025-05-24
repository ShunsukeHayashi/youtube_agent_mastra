// Langchainワークフローのテストスクリプト
import { youtubeVideoScriptGeneratorChain } from './src/mastra/workflows/videoScriptGeneratorWorkflow.langchain.js';

async function testLangchainWorkflow() {
    try {
        console.log('Langchainワークフローのテストを開始します...');

        // チェーンの作成
        console.log('チェーンを作成中...');
        const chain = await youtubeVideoScriptGeneratorChain.create();

        // 入力データの準備
        const input = {
            topic: "AIの未来と私たちの生活への影響",
            targetAudience: "テクノロジーに興味がある20代〜30代",
            scriptStyle: "教育的",
            scriptTone: "カジュアル",
            scriptLength: "medium",
            includeTimestamps: true,
            usePlanningData: true,
            keywords: ["人工知能", "機械学習", "自動化", "未来技術", "AIと仕事"]
        };

        console.log('入力データ:', JSON.stringify(input, null, 2));

        // チェーンの実行
        console.log('チェーンを実行中...');
        console.time('実行時間');
        const result = await chain.invoke(input);
        console.timeEnd('実行時間');

        // 結果の表示
        console.log('実行結果:');
        console.log(JSON.stringify(result, null, 2));

        console.log('テスト完了');
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// テストの実行
testLangchainWorkflow();
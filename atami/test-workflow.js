/**
 * Vercel AI SDKを使用したワークフローのテスト
 */
import { youtubeTitleGeneratorVercelAI } from './src/mastra/workflows/titleGeneratorWorkflow.vercel-ai.js';

async function testWorkflow() {
    try {
        console.log('Vercel AI SDKを使用したワークフローのテストを開始します...');

        // 入力データの準備
        const input = {
            videoTopic: 'プログラミング初心者向けのJavaScript入門講座',
            targetAudience: 'プログラミング初心者、20代〜30代',
            contentType: '教育',
            keyPoints: ['変数の基本', '関数の使い方', '条件分岐', 'ループ処理'],
            titleCount: 3
        };

        console.log('入力データ:', JSON.stringify(input, null, 2));

        // ワークフローの実行
        console.log('ワークフローを実行中...');
        console.time('実行時間');
        const result = await youtubeTitleGeneratorVercelAI.generate(input);
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
testWorkflow();
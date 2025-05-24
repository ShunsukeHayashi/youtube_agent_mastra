/**
 * YouTubeタイトル生成ワークフロー（Langchain版）のテストスクリプト
 */
import { youtubeTitleGeneratorChain } from './src/mastra/workflows/titleGeneratorWorkflow.langchain';

async function testTitleGeneratorWorkflow() {
    try {
        console.log('YouTubeタイトル生成ワークフロー（Langchain版）のテストを開始します...');

        // チェーンの作成
        console.log('チェーンを作成中...');
        const chain = await youtubeTitleGeneratorChain.create();

        // 入力データの準備
        const input = {
            videoTopic: 'プログラミング初心者向けのJavaScript入門講座',
            targetAudience: 'プログラミング初心者、20代〜30代',
            contentType: '教育',
            keyPoints: ['変数の基本', '関数の使い方', '条件分岐', 'ループ処理'],
            competitorTitles: [
                'JavaScript入門講座 - 初心者でも分かる基礎から応用まで',
                '【初心者向け】JavaScriptの基本を1時間で学ぼう',
                'プログラミング未経験者でも分かるJavaScript入門'
            ],
            titleCount: 5
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
testTitleGeneratorWorkflow();
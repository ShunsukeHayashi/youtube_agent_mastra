/**
 * すべてのワークフローをAPIとしてCLIでテストするスクリプト
 */
import * as workflows from './src/mastra/workflows';
import { performance } from 'perf_hooks';

// テスト用の入力データ
interface TestInputs {
    [key: string]: any;
}

const testInputs: TestInputs = {
    // YouTubeタイトル生成ワークフロー
    youtubeTitleGeneratorWorkflow: {
        videoContent: 'プログラミング初心者向けのJavaScript入門講座。変数の基本、関数の使い方、条件分岐、ループ処理について解説します。',
        seoKeywords: ['JavaScript入門', 'プログラミング初心者', 'JavaScript講座'],
        targetAudience: 'プログラミング初心者、20代〜30代',
        videoCategory: '教育',
        channelTheme: 'プログラミング教育',
    },

    // YouTubeチャンネル分析ワークフロー
    youtubeChannelAnalyticsWorkflow: {
        channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers チャンネル
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        metrics: ['views', 'likes', 'subscribersGained'],
        dimensions: 'day',
    },

    // YouTube動画分析ワークフロー
    youtubeVideoAnalyticsWorkflow: {
        channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers チャンネル
        videoId: 'dQw4w9WgXcQ', // サンプル動画ID
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        metrics: ['views', 'likes', 'comments'],
    },

    // 入力収集ワークフロー
    inputCollectionWorkflow: {
        businessName: 'テックスタートアップ株式会社',
        presenterName: '山田太郎',
        serviceUrl: 'https://example.com',
        youtubeGoal: '認知拡大とファン化',
        presenterBackground: 'IT業界で10年の経験があり、プログラミング教育に情熱を持っています。',
    },

    // YouTubeチャンネルコンセプトワークフロー
    youtubeChannelConceptWorkflow: {
        productInfo: 'プログラミング教育サービス。初心者向けにJavaScript、Python、Reactなどの技術を教えるオンラインコース。',
        targetAudience: '20代〜30代のプログラミング初心者、キャリアチェンジを考えている人',
        serviceUrl: 'https://example.com',
        businessGoals: '認知拡大と見込み顧客の獲得',
        competitorChannels: ['ProgrammingWithMosh', 'Traversy Media', 'The Net Ninja'],
        industryCategory: '教育・テクノロジー',
        brandGuidelines: 'フレンドリーで親しみやすく、専門的な内容をわかりやすく伝える',
    },

    // YouTubeサムネイル・タイトル生成ワークフロー
    youtubeThumbnailTitleGeneratorWorkflow: {
        videoContent: 'ReactとTypeScriptを使った最新のWebアプリケーション開発手法について解説します。Hooksの活用方法、TypeScriptの型定義、パフォーマンス最適化のテクニックを紹介します。',
        seoKeywords: ['React', 'TypeScript', 'Webアプリ開発'],
        targetAudience: 'フロントエンド開発者、Reactに興味のあるエンジニア',
        videoCategory: '教育・テクノロジー',
        channelTheme: 'モダンWeb開発',
    },

    // YouTube動画企画ワークフロー
    youtubeVideoPlanningWorkflow: {
        channelConcept: 'プログラミング教育に特化したチャンネル。初心者向けにわかりやすく技術を解説する。',
        targetAudience: '20代〜30代のプログラミング初心者、キャリアチェンジを考えている人',
        videoTopic: 'ReactとTypeScriptの基本と応用',
        existingKeywords: ['React入門', 'TypeScript基礎', 'Webアプリ開発'],
        competitorChannels: ['ProgrammingWithMosh', 'Traversy Media'],
        videoDuration: '15-20分',
        contentGoal: '視聴者がReactとTypeScriptの基本を理解し、簡単なアプリケーションを作れるようになること',
    },

    // キーワードリサーチワークフロー
    keywordResearchWorkflow: {
        keyword: 'プログラミング学習',
        location: 'jp',
        language: 'ja',
        limit: 20,
        includeRelated: true,
        source: 'youtube',
        businessCategory: '教育・テクノロジー',
        targetAudience: '20代〜30代のプログラミング初心者',
    },

    // YouTubeチャンネルコンセプト設計ワークフロー
    youtubeChannelConceptDesignWorkflow: {
        productInfo: 'プログラミング教育サービス。初心者向けにJavaScript、Python、Reactなどの技術を教えるオンラインコース。',
        targetAudience: '20代〜30代のプログラミング初心者、キャリアチェンジを考えている人',
        serviceUrl: 'https://example.com',
        businessGoals: '認知拡大と見込み顧客の獲得',
        competitorChannels: ['ProgrammingWithMosh', 'Traversy Media', 'The Net Ninja'],
        industryCategory: '教育・テクノロジー',
        brandGuidelines: 'フレンドリーで親しみやすく、専門的な内容をわかりやすく伝える',
    },

    // YouTubeキーワード戦略ワークフロー
    youtubeKeywordStrategyWorkflow: {
        company_url: 'https://example.com',
        target_audience: '20代〜30代のプログラミング初心者、キャリアチェンジを考えている人',
        youtube_purpose: '認知拡大とファン化',
        ng_keywords: '過激な表現、ネガティブな内容',
        preferred_topics: 'JavaScript, React, TypeScript, プログラミング学習法',
    },

    // YouTube動画スクリプト生成ワークフロー
    youtubeVideoScriptGeneratorWorkflow: {
        videoTitle: 'ReactとTypeScriptで作る最新Webアプリ開発入門',
        videoOutline: '1. Reactの基本概念\n2. TypeScriptの導入メリット\n3. 環境構築\n4. コンポーネント設計\n5. 状態管理\n6. APIとの連携\n7. デプロイ方法',
        targetAudience: 'フロントエンド開発者、Reactに興味のあるエンジニア',
        videoDuration: '15-20分',
        tone: '教育的でフレンドリー',
        callToAction: 'コースへの登録を促す',
    },
};

// ワークフローをテストする関数
async function testWorkflow(workflowName: string, workflow: any, input: any): Promise<{ success: boolean, result?: any, error?: any }> {
    console.log(`\n===== ${workflowName} のテスト =====`);
    console.log('入力データ:', JSON.stringify(input, null, 2));

    try {
        console.log('ワークフローを実行中...');
        const startTime = performance.now();

        // ワークフローの実行方法に応じて処理を分岐
        let result;
        if (typeof workflow.generate === 'function') {
            // Vercel AI SDK形式
            result = await workflow.generate(input);
        } else if (typeof workflow.execute === 'function') {
            // 直接execute関数を持つ形式
            result = await workflow.execute(input);
        } else if (typeof workflow.run === 'function') {
            // run関数を持つ形式
            result = await workflow.run(input);
        } else {
            throw new Error('サポートされていないワークフロー形式です');
        }

        const endTime = performance.now();
        console.log(`実行時間: ${(endTime - startTime).toFixed(2)}ms`);

        // 結果の表示（長すぎる場合は省略）
        console.log('実行結果:');
        const resultStr = JSON.stringify(result, null, 2);
        if (resultStr.length > 1000) {
            console.log(resultStr.substring(0, 1000) + '... (省略)');
        } else {
            console.log(resultStr);
        }

        return { success: true, result };
    } catch (error) {
        console.error(`エラーが発生しました: ${error}`);
        return { success: false, error };
    }
}

// メイン関数
async function testAllWorkflows() {
    console.log('すべてのワークフローのテストを開始します...');

    const results: { [key: string]: { success: boolean, result?: any, error?: any } } = {};
    const workflowEntries = Object.entries(workflows);

    // Langchainとダミーワークフローを除外するフィルター
    const filteredWorkflows = workflowEntries.filter(([name, _]) =>
        !name.includes('Chain') &&
        !name.includes('Dummy') &&
        !name.includes('Planner')
    );

    console.log(`テスト対象ワークフロー数: ${filteredWorkflows.length}`);

    for (const [name, workflow] of filteredWorkflows) {
        // テスト用の入力データがある場合のみテスト実行
        if (testInputs[name]) {
            const result = await testWorkflow(name, workflow, testInputs[name]);
            results[name] = result;
        } else {
            console.log(`\n===== ${name} =====`);
            console.log('テスト用の入力データが定義されていないためスキップします');
            results[name] = { success: false, error: 'テスト用の入力データが定義されていません' };
        }
    }

    // 結果のサマリーを表示
    console.log('\n===== テスト結果サマリー =====');
    for (const [name, result] of Object.entries(results)) {
        console.log(`${name}: ${(result as any).success ? '成功' : '失敗'}`);
    }

    const successCount = Object.values(results).filter((r: any) => (r as any).success).length;
    console.log(`\n成功: ${successCount}/${Object.keys(results).length} (${(successCount / Object.keys(results).length * 100).toFixed(2)}%)`);
}

// テストの実行
testAllWorkflows().catch(console.error);
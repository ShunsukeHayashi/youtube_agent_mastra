/**
 * E2Eテスト用のセットアップファイル
 * テスト環境の初期化や共通の設定を行います
 */
import * as dotenv from 'dotenv';

// .envファイルを読み込む
dotenv.config();

// テスト実行前の共通処理
beforeAll(() => {
  console.log('E2Eテスト開始');
  
  // タイムアウトを設定（長時間実行されるワークフローのため）
  jest.setTimeout(30000); // 30秒
  
  // 環境変数の確認
  const requiredEnvVars: string[] = [
    // 必要な環境変数をここに追加
    // 'YOUTUBE_API_KEY',
    // 'KEYWORD_TOOL_API_KEY',
    // 'ANTHROPIC_API_KEY',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`警告: 以下の環境変数が設定されていません: ${missingEnvVars.join(', ')}`);
    console.warn('モックデータが使用される可能性があります');
  }
});

// テスト実行後の共通処理
afterAll(() => {
  console.log('E2Eテスト終了');
});

// テスト用のヘルパー関数
export const waitForWorkflowCompletion = async (promise: Promise<any>, timeout = 30000) => {
  // タイムアウト付きでワークフローの完了を待つ
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('ワークフロー実行がタイムアウトしました')), timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

// テスト用のモックデータ
export const mockInputs = {
  keywordResearch: {
    keyword: 'プログラミング',
    location: 'JP',
    language: 'ja'
  },
  titleGenerator: {
    videoContent: 'プログラミング初心者向けのJavaScript入門講座です。変数、関数、オブジェクトなどの基本概念を解説します。',
    seoKeywords: ['JavaScript', 'プログラミング', '入門', '初心者'],
    targetAudience: 'プログラミングを始めたばかりの20代〜30代',
    videoCategory: 'tutorial'
  },
  videoPlanning: {
    channelConcept: 'プログラミング教育チャンネル',
    targetAudience: 'プログラミングを学びたい初心者から中級者',
    videoTopic: 'JavaScript非同期処理入門',
    videoDuration: '10-15分'
  },
  analytics: {
    channelId: 'UC_test_channel_id',
    startDate: '2025-04-01',
    endDate: '2025-04-30'
  },
  channelConcept: {
    targetAudience: 'プログラミングを学びたい初心者から中級者',
    contentFocus: 'プログラミング教育、チュートリアル、プロジェクト実践',
    channelGoals: '視聴者にプログラミングスキルを身につけてもらい、実践的なプロジェクトを作れるようにする',
    competitorChannels: ['プログラミングチャンネルA', 'コードラボ', 'デベロッパーアカデミー'],
    contentTypes: ['チュートリアル', 'コードレビュー', 'プロジェクト実践']
  },
  inputCollection: {
    projectName: 'JavaScript入門講座',
    projectDescription: '初心者向けのJavaScript基礎講座を作成します',
    targetAudience: 'プログラミング初心者、20代〜30代',
    contentGoals: 'JavaScriptの基本概念を理解し、簡単なWebアプリケーションを作れるようになること'
  },
  thumbnailTitleGenerator: {
    videoContent: 'JavaScriptの非同期処理について解説する動画です。Promise、async/await、コールバックなどの概念を初心者向けに説明します。',
    seoKeywords: ['JavaScript', '非同期処理', 'Promise', 'async/await'],
    targetAudience: 'プログラミング初心者から中級者',
    videoCategory: 'programming',
    channelTheme: 'プログラミング教育'
  }
};
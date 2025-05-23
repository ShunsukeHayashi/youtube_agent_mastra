/**
 * E2Eテスト実行用のエントリーポイント
 * 
 * このファイルは、すべてのE2Eテストを順番に実行するためのスクリプトです。
 * `npx ts-node tests/e2e/index.ts` で実行できます。
 */
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// テスト対象のワークフロー
const workflows = [
  'keywordResearch',
  'titleGenerator',
  'videoPlanning',
  'analytics',
  'channelConcept',
  'inputCollection',
  'thumbnailTitleGenerator'
];

// 色付きログ出力用の関数
const log = {
  info: (message: string) => console.log(`\x1b[36m${message}\x1b[0m`),
  success: (message: string) => console.log(`\x1b[32m${message}\x1b[0m`),
  error: (message: string) => console.log(`\x1b[31m${message}\x1b[0m`),
  warning: (message: string) => console.log(`\x1b[33m${message}\x1b[0m`),
};

/**
 * 指定されたワークフローのE2Eテストを実行する関数
 * @param workflow ワークフロー名
 * @returns テスト結果のPromise
 */
async function runTest(workflow: string): Promise<boolean> {
  return new Promise((resolve) => {
    log.info(`\n========== ${workflow} ワークフローのE2Eテスト開始 ==========`);
    
    const testFile = path.join(__dirname, `${workflow}.e2e.test.ts`);
    
    // テストファイルの存在確認
    if (!fs.existsSync(testFile)) {
      log.warning(`${workflow}.e2e.test.ts が見つかりません。スキップします。`);
      resolve(true);
      return;
    }
    
    // Jestを使用してテストを実行
    const jest = spawn('npx', ['jest', '--testMatch', `**/${workflow}.e2e.test.ts`, '--verbose'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '../..')
    });
    
    jest.on('close', (code) => {
      if (code === 0) {
        log.success(`${workflow} ワークフローのE2Eテスト成功`);
        resolve(true);
      } else {
        log.error(`${workflow} ワークフローのE2Eテスト失敗 (終了コード: ${code})`);
        resolve(false);
      }
    });
  });
}

/**
 * すべてのワークフローのE2Eテストを順番に実行する関数
 */
async function runAllTests() {
  log.info('E2Eテスト開始');
  
  let allPassed = true;
  const results: Record<string, boolean> = {};
  
  for (const workflow of workflows) {
    const passed = await runTest(workflow);
    results[workflow] = passed;
    if (!passed) allPassed = false;
  }
  
  // 結果サマリーを表示
  log.info('\n========== E2Eテスト結果サマリー ==========');
  for (const [workflow, passed] of Object.entries(results)) {
    if (passed) {
      log.success(`✅ ${workflow}: 成功`);
    } else {
      log.error(`❌ ${workflow}: 失敗`);
    }
  }
  
  if (allPassed) {
    log.success('\nすべてのE2Eテストが成功しました！');
    process.exit(0);
  } else {
    log.error('\n一部のE2Eテストが失敗しました。');
    process.exit(1);
  }
}

// テスト実行
runAllTests().catch((error) => {
  log.error(`E2Eテスト実行中にエラーが発生しました: ${error}`);
  process.exit(1);
});
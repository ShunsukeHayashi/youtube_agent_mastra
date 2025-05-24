/**
 * Playwright MCPサーバーを使用したE2Eテスト
 * 
 * このファイルは、Playwrightを使用してブラウザ自動化テストを実行するためのスクリプトです。
 */
import { chromium, firefox, webkit } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function runPlaywrightTests() {
  console.log('Playwright E2Eテスト開始');

  // スクリーンショット保存ディレクトリの作成
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // ブラウザを起動
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Swagger UIページに移動
    await page.goto('http://localhost:4111/swagger-ui');
    console.log('ブラウザ起動成功');
    
    // スクリーンショットを撮影
    await page.screenshot({
      path: path.join(screenshotDir, 'swagger-ui.png'),
      fullPage: true
    });
    console.log('スクリーンショット撮影成功');
    
    // ページのテキストを取得
    const textContent = await page.textContent('body');
    console.log('ページテキスト取得成功');
    if (textContent) {
      console.log('テキスト内容:', textContent.substring(0, 500) + '...');
    }
    
    // APIエンドポイントをクリック
    await page.click('.opblock-tag-section');
    console.log('クリック成功');
    
    // 少し待機
    await page.waitForTimeout(1000);
    
    // 再度スクリーンショットを撮影
    await page.screenshot({
      path: path.join(screenshotDir, 'swagger-ui-expanded.png'),
      fullPage: true
    });
    console.log('2回目のスクリーンショット撮影成功');
    
    // ブラウザを閉じる
    await browser.close();
    
    console.log('ブラウザ終了成功');
    
    console.log('Playwright E2Eテスト成功');
    return true;
  } catch (error) {
    console.error('Playwright E2Eテスト失敗:', error);
    
    // エラーが発生した場合もブラウザを閉じる
    try {
      await browser.close();
    } catch (closeError) {
      console.error('ブラウザ終了中にエラーが発生しました:', closeError);
    }
    
    return false;
  }
}

// テスト実行
runPlaywrightTests().then(success => {
  if (success) {
    console.log('すべてのPlaywright E2Eテストが成功しました！');
    process.exit(0);
  } else {
    console.error('Playwright E2Eテストが失敗しました。');
    process.exit(1);
  }
}).catch(error => {
  console.error('Playwright E2Eテスト実行中にエラーが発生しました:', error);
  process.exit(1);
});
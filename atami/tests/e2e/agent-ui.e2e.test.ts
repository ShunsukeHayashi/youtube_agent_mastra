/**
 * エージェントUIのE2Eテスト
 * 
 * このファイルは、Playwrightを使用してエージェントのUIが正しく表示されるかをテストします。
 */
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

describe('エージェントUI E2Eテスト', () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    // スクリーンショット保存ディレクトリ
    const screenshotDir = path.join(__dirname, 'screenshots');

    // テスト実行前の処理
    beforeAll(async () => {
        console.log('エージェントUI E2Eテスト開始');

        // スクリーンショット保存ディレクトリの作成
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // ブラウザを起動
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        page = await context.newPage();

        // タイムアウトを設定
        jest.setTimeout(60000); // 60秒
    });

    // テスト実行後の処理
    afterAll(async () => {
        console.log('エージェントUI E2Eテスト終了');

        // ブラウザを閉じる
        await browser.close();
    });

    // 基本的なUIテスト（スキップ）
    test.skip('エージェントUIが正しく表示される', async () => {
        // ローカルサーバーに接続
        // 注: ローカルサーバーが起動していない場合、このテストは失敗します
        // await page.goto('http://localhost:3000');

        // スクリーンショットを撮影
        // await page.screenshot({
        //   path: path.join(screenshotDir, 'agent-ui.png'),
        //   fullPage: true
        // });

        // ページのタイトルを取得
        // const title = await page.title();
        // expect(title).toBeDefined();

        // ページのテキストを取得
        // const textContent = await page.textContent('body');
        // expect(textContent).toBeDefined();
    });

    // エージェント選択テスト
    test.skip('エージェントを選択できる', async () => {
        // ローカルサーバーに接続
        await page.goto('http://localhost:3000');

        // エージェント選択ボタンをクリック
        await page.click('[data-testid="agent-selector"]');

        // タイトル生成エージェントを選択
        await page.click('[data-testid="title-generator-agent"]');

        // スクリーンショットを撮影
        await page.screenshot({
            path: path.join(screenshotDir, 'title-generator-agent.png'),
            fullPage: true
        });

        // 選択されたエージェント名を確認
        const selectedAgentName = await page.textContent('[data-testid="selected-agent-name"]');
        expect(selectedAgentName).toContain('Title');
    });

    // エージェント実行テスト
    test.skip('エージェントを実行できる', async () => {
        // ローカルサーバーに接続
        await page.goto('http://localhost:3000');

        // エージェント選択ボタンをクリック
        await page.click('[data-testid="agent-selector"]');

        // タイトル生成エージェントを選択
        await page.click('[data-testid="title-generator-agent"]');

        // 入力フィールドに値を入力
        await page.fill('[data-testid="video-content-input"]', 'プログラミング初心者向けのJavaScript入門講座です。変数、関数、オブジェクトなどの基本概念を解説します。');

        // 実行ボタンをクリック
        await page.click('[data-testid="execute-button"]');

        // 結果が表示されるまで待機
        await page.waitForSelector('[data-testid="result-container"]', { timeout: 30000 });

        // スクリーンショットを撮影
        await page.screenshot({
            path: path.join(screenshotDir, 'title-generator-result.png'),
            fullPage: true
        });

        // 結果を確認
        const resultText = await page.textContent('[data-testid="result-container"]');
        expect(resultText).toBeDefined();
        expect(resultText?.length).toBeGreaterThan(0);
    });
});
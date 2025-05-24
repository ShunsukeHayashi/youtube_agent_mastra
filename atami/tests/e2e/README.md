# E2Eテスト（End-to-End テスト）

このディレクトリには、YouTubeコンテンツ作成ワークフローのEnd-to-Endテストが含まれています。

## 概要

E2Eテストは、実際のワークフローを入力から出力まで完全に実行し、システム全体が期待通りに動作することを確認するためのテストです。ユニットテストとは異なり、モックを最小限に抑え、実際の環境に近い状態でテストを行います。

## テスト構造

```
tests/e2e/
├── setup.ts                        # テスト環境のセットアップと共通関数
├── index.ts                        # すべてのE2Eテストを実行するエントリーポイント
├── keywordResearch.e2e.test.ts     # キーワードリサーチワークフローのテスト
├── titleGenerator.e2e.test.ts      # タイトル生成ワークフローのテスト
├── videoPlanning.e2e.test.ts       # 動画企画ワークフローのテスト
├── agent.e2e.test.ts               # エージェント初期化のテスト
├── agent-ui.e2e.test.ts            # エージェントUIのテスト
├── prompt-template.e2e.test.ts     # プロンプトテンプレートのテスト
├── playwright-test.ts              # Playwrightを使用したブラウザ自動化テスト
├── screenshots/                    # Playwrightテストで生成されるスクリーンショット
└── README.md                       # このファイル
```

## テスト実行方法

### VSCodeでの実行方法（推奨）

1. VSCodeで`.vscode/e2e-test.code-workspace`を開きます
2. F5キーを押すか、「実行とデバッグ」パネルから「Run E2E Tests」を選択します
3. 特定のテストを実行する場合は、対応するテスト設定を選択します

### コマンドラインでの実行方法

#### すべてのE2Eテストを実行

```bash
npm run test:e2e
```

このコマンドは、`tests/e2e/index.ts`を実行し、すべてのE2Eテストを順番に実行します。

#### 特定のワークフローのE2Eテストを実行

```bash
npm run test:e2e:single -- keywordResearch.e2e.test.ts
```

このコマンドは、指定したテストファイルのみを実行します。

#### Playwrightブラウザテストを実行

```bash
npx ts-node tests/e2e/playwright-test.ts
```

このコマンドは、Playwrightを使用してブラウザ自動化テストを実行します。テスト実行中にブラウザが起動し、指定されたページに移動してスクリーンショットを撮影します。

## ディレクトリ設定

E2Eテストを正しく実行するには、正しいディレクトリで作業する必要があります。プロジェクトのルートディレクトリは以下の通りです：

```
C:\Users\shuns\Dev\youtube_agent_mastra\atami
```

VSCodeのワークスペース設定（`.vscode/e2e-test.code-workspace`）を使用すると、正しいディレクトリで作業できます。

## テスト環境の設定

E2Eテストを実行する前に、必要な環境変数を`.env`ファイルに設定してください。

```
# .env ファイルの例
ANTHROPIC_API_KEY=your_anthropic_api_key
KEYWORD_TOOL_API_KEY=your_keyword_tool_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

環境変数が設定されていない場合、テストはモックデータを使用して実行されます。

## 新しく追加されたテスト

### エージェント初期化テスト (`agent.e2e.test.ts`)

このテストは、各エージェント（タイトル生成、サムネイル生成、キーワードリサーチなど）が正しく初期化されるかを確認します。エージェントのインスタンスが正しく作成され、名前やプロパティが期待通りに設定されているかをテストします。

### エージェントUIテスト (`agent-ui.e2e.test.ts`)

このテストは、Playwrightを使用してエージェントのUIが正しく表示されるかをテストします。ブラウザを起動し、ローカルサーバーに接続して、UIの表示を確認します。また、エージェントの選択や実行などの基本的な操作もテストします。

### プロンプトテンプレートテスト (`prompt-template.e2e.test.ts`)

このテストは、`prompt.md`ファイルに記載されているプロンプトテンプレートを使用して、エージェントが正しく動作するかをテストします。プロンプトファイルの存在確認、必要な情報が含まれているかの確認、エージェントのプロンプトとの整合性確認などを行います。

## テストの追加方法

新しいワークフローのE2Eテストを追加するには、以下の手順に従ってください：

1. `tests/e2e/`ディレクトリに新しいテストファイルを作成します（例：`newWorkflow.e2e.test.ts`）
2. `setup.ts`の`mockInputs`オブジェクトに、新しいワークフロー用のモックデータを追加します
3. `index.ts`の`workflows`配列に、新しいワークフロー名を追加します
4. `.vscode/e2e-test.code-workspace`の`launch.configurations`に新しいテスト設定を追加します

## テスト結果の解釈

テスト実行後、コンソールに各ワークフローのテスト結果が表示されます。すべてのテストが成功した場合は緑色で「成功」と表示され、失敗した場合は赤色で「失敗」と表示されます。

テストが失敗した場合は、エラーメッセージを確認して問題を特定し、修正してください。

## トラブルシューティング

### モジュールが見つからないエラー

```
Error: Cannot find module './index.ts'
```

このエラーが発生した場合は、以下を確認してください：

1. 正しいディレクトリで作業しているか
2. `ts-node`がインストールされているか
3. `tsconfig.json`の設定が正しいか

### 環境変数が見つからないエラー

```
Error: Environment variable XXX is not set
```

このエラーが発生した場合は、`.env`ファイルに必要な環境変数が設定されているか確認してください。

### Playwrightテスト関連のエラー

```
Error: browserType.launch: Executable doesn't exist at /path/to/browser
```

このエラーが発生した場合は、Playwrightのブラウザがインストールされていません。以下のコマンドを実行してブラウザをインストールしてください：

```bash
npx playwright install
```

```
Error: page.goto: Navigation failed because page crashed!
```

このエラーが発生した場合は、以下を確認してください：

1. ローカルサーバーが起動しているか
2. 指定したURLが正しいか
3. ブラウザのバージョンが最新か

### スクリーンショットディレクトリが存在しないエラー

```
Error: ENOENT: no such file or directory, mkdir 'screenshots'
```

このエラーが発生した場合は、スクリーンショットディレクトリが存在しないか、アクセス権限がありません。テストコードが自動的にディレクトリを作成するようになっていますが、問題が解決しない場合は手動でディレクトリを作成してください：

```bash
mkdir -p tests/e2e/screenshots
```
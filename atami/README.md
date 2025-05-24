# YouTube Agent Mastra

YouTubeチャンネル運営・分析のためのAIエージェントシステム。Mastraフレームワークを使用して構築されており、YouTubeコンテンツ戦略の立案から分析までをサポートします。

## 機能

- **チャンネルコンセプト設計**: ターゲットオーディエンスとキーワード分析に基づいたチャンネルコンセプトの提案
- **キーワードリサーチ**: 検索ボリュームと競合性を考慮したキーワード分析
- **コンテンツ企画**: SEO最適化されたビデオコンテンツの企画
- **タイトル・サムネイル生成**: 高CTRを実現するタイトルとサムネイルの提案
- **分析レポート**: チャンネルおよび動画のパフォーマンス分析

## プロジェクト構造

```
atami/
├── src/
│   └── mastra/
│       ├── agents/       # AIエージェント定義
│       ├── tools/        # エージェントが使用するツール
│       ├── workflows/    # 複数ステップのワークフロー
│       └── lib/          # 共通ライブラリ
└── tests/                # テストファイル
```

### 主要コンポーネント

#### エージェント (agents/)
- `analyticsAgent`: チャンネル・動画分析を行うエージェント
- `channelConceptAgent`: チャンネルコンセプト設計を行うエージェント
- `inputCollectionAgent`: ユーザー入力を収集するエージェント
- `keywordResearchAgent`: キーワードリサーチを行うエージェント
- `thumbnailTitleGeneratorAgent`: サムネイル・タイトル生成エージェント
- `titleGeneratorAgent`: タイトル生成に特化したエージェント
- `videoPlanningAgent`: 動画企画を行うエージェント

#### ツール (tools/)
- `channelConcept`: チャンネルコンセプト設計ツール
- `inputCollection`: ユーザー入力収集ツール
- `keywordResearch`: キーワードリサーチツール
- `thumbnailTitleGenerator`: サムネイル・タイトル生成ツール
- `titleGenerator`: タイトル生成ツール
- `videoPlanningSeo`: SEO最適化された動画企画ツール
- `youtube-analytics`: YouTube分析ツール

#### ワークフロー (workflows/)
- `analyticsWorkflow`: 分析ワークフロー
- `channelConceptWorkflow`: チャンネルコンセプト設計ワークフロー
- `inputCollectionWorkflow`: 入力収集ワークフロー
- `keywordResearchWorkflow`: キーワードリサーチワークフロー
- `thumbnailTitleGeneratorWorkflow`: サムネイル・タイトル生成ワークフロー
- `titleGeneratorWorkflow`: タイトル生成ワークフロー
- `videoPlanningWorkflow`: 動画企画ワークフロー

## 環境設定

### 必要条件
- Node.js >= 20.9.0
- YouTube API キー

### 環境変数
`.env`ファイルを作成し、以下の環境変数を設定してください：

```
YOUTUBE_API_KEY=your_youtube_api_key
KEYWORD_RESEARCH_API_KEY=your_keyword_research_api_key
```

## 使い方

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# ビルド
npm run build
```

## ワークフローの例

### チャンネルコンセプト設計
```typescript
const result = await youtubeChannelConceptWorkflow.run({
  productDescription: "プログラミング教育サービス",
  targetAudience: "プログラミング初心者、20代〜30代",
  businessGoals: "教育サービスの認知拡大と顧客獲得"
});
```

### 動画企画
```typescript
const result = await youtubeVideoPlanningWorkflow.run({
  topic: "JavaScriptの基礎",
  targetKeywords: ["JavaScript 入門", "JavaScript 初心者"],
  contentType: "チュートリアル"
});
```

### 分析レポート
```typescript
const result = await youtubeChannelAnalyticsWorkflow.run({
  channelId: "UCxxxxxxxxxxxxxxxx",
  startDate: "2025-04-01",
  endDate: "2025-04-30"
});
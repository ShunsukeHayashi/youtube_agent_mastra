# プロジェクト構造ドキュメント

このドキュメントでは、YouTube Agent Mastraプロジェクトの構造と各コンポーネントの関係について説明します。

## アーキテクチャ概要

このプロジェクトは、Mastraフレームワークを使用したエージェントベースのアーキテクチャを採用しています。主要なコンポーネントは以下の通りです：

```
Agents (エージェント) ← Tools (ツール) → External APIs (外部API)
        ↓
Workflows (ワークフロー) → Steps (ステップ)
```

- **エージェント (Agents)**: 特定のタスクを実行するAIエージェント
- **ツール (Tools)**: エージェントが使用する機能を提供するモジュール
- **ワークフロー (Workflows)**: 複数のステップを組み合わせた処理フロー
- **外部API**: YouTube Data API、YouTube Analytics APIなど

## コンポーネント間の関係

### エージェントとツールの関係

各エージェントは、特定のツールを使用して機能を実現します：

| エージェント | 使用するツール | 機能 |
|------------|--------------|------|
| youtubeAgent | youtubeSearchTool | YouTube検索 |
| youtubeTitleGeneratorAgent | youtubeTitleGeneratorTool | タイトル生成 |
| youtubeAnalyticsAgent | getChannelAnalytics, getVideoAnalytics, getAudienceGeographics | 分析データ取得 |
| inputCollectionAgent | youtubeInputCollectionTool | ユーザー入力収集 |
| channelConceptAgent | youtubeChannelConceptTool | チャンネルコンセプト設計 |
| youtubeThumbnailTitleGeneratorAgent | youtubeThumbnailTitleGeneratorTool | サムネイル・タイトル生成 |
| youtubeVideoPlanningAgent | youtubeVideoPlanningTool | 動画企画 |
| keywordResearchAgent | keywordResearchTool | キーワードリサーチ |

### ワークフローとエージェントの関係

各ワークフローは、対応するエージェントを使用してタスクを実行します：

| ワークフロー | 使用するエージェント | 機能 |
|------------|-------------------|------|
| youtubeSearchWorkflow | youtubeAgent | YouTube検索 |
| youtubeTitleGeneratorWorkflow | youtubeTitleGeneratorAgent | タイトル生成 |
| youtubeChannelAnalyticsWorkflow | youtubeAnalyticsAgent | チャンネル分析 |
| youtubeVideoAnalyticsWorkflow | youtubeAnalyticsAgent | 動画分析 |
| inputCollectionWorkflow | inputCollectionAgent | ユーザー入力収集 |
| youtubeChannelConceptWorkflow | channelConceptAgent | チャンネルコンセプト設計 |
| youtubeThumbnailTitleGeneratorWorkflow | youtubeThumbnailTitleGeneratorAgent | サムネイル・タイトル生成 |
| youtubeVideoPlanningWorkflow | youtubeVideoPlanningAgent | 動画企画 |
| keywordResearchWorkflow | keywordResearchAgent | キーワードリサーチ |

## データフロー

1. **ユーザー入力収集**:
   - ユーザーからの入力を `inputCollectionWorkflow` で収集
   - 収集した情報を後続のワークフローで利用

2. **チャンネル設計**:
   - `keywordResearchWorkflow` でキーワード分析
   - `youtubeChannelConceptWorkflow` でチャンネルコンセプト設計

3. **コンテンツ企画**:
   - `youtubeVideoPlanningWorkflow` で動画企画
   - `youtubeTitleGeneratorWorkflow` でタイトル生成
   - `youtubeThumbnailTitleGeneratorWorkflow` でサムネイル・タイトル生成

4. **分析**:
   - `youtubeChannelAnalyticsWorkflow` でチャンネル分析
   - `youtubeVideoAnalyticsWorkflow` で動画分析

## 外部依存関係

- **YouTube Data API**: 動画検索、チャンネル情報取得
- **YouTube Analytics API**: 分析データ取得
- **Anthropic Claude API**: AIモデル（claude-3-7-sonnet-20250219）

## メモリ管理

エージェントは `@mastra/memory` と `@mastra/libsql` を使用して会話履歴を保存します：

```typescript
memory: new Memory({
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  options: {
    lastMessages: 10,
    semanticRecall: false,
    threads: {
      generateTitle: false,
    },
  },
}),
```

## 拡張方法

新しい機能を追加する場合は、以下の手順に従ってください：

1. `tools/` ディレクトリに新しいツールを作成
2. `agents/` ディレクトリに新しいエージェントを作成
3. `workflows/` ディレクトリに新しいワークフローを作成
4. 各インデックスファイルからエクスポート
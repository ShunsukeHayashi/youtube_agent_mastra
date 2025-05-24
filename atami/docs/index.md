# YouTube Agent Mastra ドキュメント

YouTube Agent Mastraプロジェクトの公式ドキュメントへようこそ。このドキュメントでは、プロジェクトの構造、設定方法、使用方法について説明します。

## ドキュメント一覧

### 概要と設定

- [プロジェクト概要](../README.md) - プロジェクトの目的と主要機能の概要
- [環境設定ガイド](./setup-guide.md) - インストール手順とAPIキーの設定方法

### アーキテクチャと設計

- [プロジェクト構造](./project-structure.md) - プロジェクトの構造と各コンポーネントの関係
- [コーディング規約](./coding-standards.md) - コーディング規約とベストプラクティス

### 使用方法

- [ワークフロー使用ガイド](./workflows-guide.md) - 各ワークフローの使用方法と入出力例

## クイックスタート

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
```bash
# .envファイルを作成
cp .env.example .env

# 必要な環境変数を設定
# YOUTUBE_API_KEY=your_youtube_api_key
# KEYWORD_RESEARCH_API_KEY=your_keyword_research_api_key
```

3. 開発サーバーの起動
```bash
npm run dev
```

## 主要コンポーネント

### エージェント

エージェントは特定のタスクを実行するAIアシスタントです。

- `youtubeAgent` - YouTube検索エージェント
- `youtubeTitleGeneratorAgent` - タイトル生成エージェント
- `youtubeAnalyticsAgent` - 分析エージェント
- その他のエージェント

### ツール

ツールはエージェントが使用する機能を提供するモジュールです。

- `youtubeSearchTool` - YouTube検索ツール
- `youtubeTitleGeneratorTool` - タイトル生成ツール
- `getChannelAnalytics` - チャンネル分析ツール
- その他のツール

### ワークフロー

ワークフローは複数のステップを組み合わせた処理フローです。

- `youtubeSearchWorkflow` - YouTube検索ワークフロー
- `youtubeTitleGeneratorWorkflow` - タイトル生成ワークフロー
- `youtubeChannelAnalyticsWorkflow` - チャンネル分析ワークフロー
- その他のワークフロー

## 貢献ガイド

プロジェクトへの貢献を歓迎します。貢献する前に以下のガイドラインを確認してください：

1. [コーディング規約](./coding-standards.md)に従ってコードを作成
2. 新機能には適切なテストを追加
3. ドキュメントを更新
4. プルリクエストを作成

## トラブルシューティング

よくある問題と解決策については、[環境設定ガイド](./setup-guide.md)のトラブルシューティングセクションを参照してください。

## ライセンス

このプロジェクトはISCライセンスの下で公開されています。詳細については、[LICENSE](../LICENSE)ファイルを参照してください。
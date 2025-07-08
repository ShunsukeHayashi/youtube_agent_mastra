# 環境設定ガイド

このドキュメントでは、YouTube Agent Mastraの環境設定とAPIキーの取得方法について説明します。

## 目次

1. [前提条件](#1-前提条件)
2. [インストール手順](#2-インストール手順)
3. [APIキーの取得](#3-apiキーの取得)
4. [環境変数の設定](#4-環境変数の設定)
5. [開発サーバーの起動](#5-開発サーバーの起動)
6. [トラブルシューティング](#6-トラブルシューティング)

## 1. 前提条件

- Node.js (バージョン 20.9.0 以上)
- npm または yarn
- Google アカウント (YouTube API用)

## 2. インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/youtube_agent_mastra.git
cd youtube_agent_mastra/atami
```

2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

## 3. APIキーの取得

### YouTube Data API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
4. 「YouTube Data API v3」を検索して有効化
5. 「認証情報」タブに移動
6. 「認証情報を作成」→「APIキー」を選択
7. 作成されたAPIキーをコピー

### YouTube Analytics API の設定

1. 同じGoogle Cloud Consoleプロジェクトで「YouTube Analytics API」を検索して有効化
2. OAuth同意画面を設定
   - 「APIとサービス」→「OAuth同意画面」を選択
   - ユーザータイプを選択（内部または外部）
   - アプリ名、ユーザーサポートメール、デベロッパーの連絡先情報を入力
   - 必要なスコープを追加（`https://www.googleapis.com/auth/youtube.readonly`、`https://www.googleapis.com/auth/yt-analytics.readonly`）
   - テストユーザーを追加
3. OAuth 2.0 クライアントIDを作成
   - 「認証情報」→「認証情報を作成」→「OAuth クライアントID」を選択
   - アプリケーションの種類を選択（ウェブアプリケーション）
   - 承認済みのリダイレクトURIを追加（例：`http://localhost:3000/auth/callback`）
   - クライアントIDとクライアントシークレットをコピー

## 4. 環境変数の設定

1. プロジェクトのルートディレクトリに `.env` ファイルを作成

```bash
touch .env
```

2. 以下の環境変数を設定

```
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# OAuth 2.0 認証情報（YouTube Analytics API用）
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# キーワードリサーチAPI（オプション）
KEYWORD_RESEARCH_API_KEY=your_keyword_research_api_key

# データベース設定
DATABASE_URL=file:../mastra.db
```

## 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

サーバーが起動したら、ブラウザで `http://localhost:3000` にアクセスできます。

## 6. トラブルシューティング

### YouTube API クォータの制限

YouTube Data APIには1日あたりのクォータ制限があります。制限を超えると、以下のようなエラーが発生します：

```
YouTube API error: Status 403 - { "error": { "code": 403, "message": "Quota exceeded" } }
```

**解決策**:
- APIリクエストの頻度を減らす
- Google Cloud Consoleでクォータの増加をリクエスト

### 認証エラー

```
Error: No refresh token is set. - OAuth 2.0 認証に失敗しました
```

**解決策**:
1. `.env` ファイルの認証情報が正しいか確認
2. 認証フローを再実行
   ```bash
   npm run auth
   # または
   yarn auth
   ```

### データベース接続エラー

```
Error: Database file not found or permission denied
```

**解決策**:
1. データベースファイルのパスが正しいか確認
2. ディレクトリのアクセス権を確認
3. 必要に応じてデータベースファイルを初期化
   ```bash
   npm run init-db
   # または
   yarn init-db
   ```

### Node.jsバージョンの互換性

エラー: `Error: The module requires Node.js version >=20.9.0`

**解決策**:
1. Node.jsのバージョンを確認
   ```bash
   node -v
   ```
2. 必要に応じてNode.jsをアップデート
   - [Node.js公式サイト](https://nodejs.org/)からダウンロード
   - または、nvmを使用してバージョンを管理
     ```bash
     nvm install 20.9.0
     nvm use 20.9.0
     ```

## 追加リソース

- [YouTube Data API ドキュメント](https://developers.google.com/youtube/v3/docs)
- [YouTube Analytics API ドキュメント](https://developers.google.com/youtube/analytics)
- [Mastraフレームワーク ドキュメント](https://docs.mastra.ai)
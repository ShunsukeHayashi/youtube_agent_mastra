# リファクタリング概要：命名規則の統一

## 概要

このリファクタリングでは、YouTube Mastraプロジェクト全体の命名規則を統一しました。主な目的は、コードの可読性と保守性を向上させ、新規開発者のオンボーディングを容易にすることです。

## 変更点

### 1. テストファイルの更新

以下のテストファイルを更新し、一貫した命名規則を適用しました：

- `title-generator.test.ts`
  - `youtubeTitleGeneratorTool` の命名規則に合わせてモックとインポートを更新
  - テスト説明を最新の機能に合わせて更新（サムネイルテキスト生成機能の追加）
  - モックデータの構造を最新の実装に合わせて更新

- `input-collection.test.ts`
  - `inputCollectionAgent` → `youtubeInputCollectionAgent` に変更
  - `inputCollectionWorkflow` → `youtubeInputCollectionWorkflow` に変更

- `tests/e2e/inputCollection.e2e.test.ts`
  - `inputCollectionWorkflow` → `youtubeInputCollectionWorkflow` に変更（実行部分）

### 2. ドキュメント作成

命名規則を明確にするために、以下のドキュメントを作成しました：

- `docs/naming-conventions.md`: プロジェクト全体の命名規則ガイドライン
  - コンポーネントタイプ別の命名パターン
  - 例外的なケースの説明
  - モック化のガイドライン

### 3. 問題解決

以下の問題を特定し解決しました：

- テストのタイムアウト問題
  - Jest のモック実装の問題を特定し修正
  - `mockExecute` 関数を使用した適切なモック化手法の適用

## 命名規則の要約

プロジェクト全体で採用されている命名規則は以下の通りです：

1. **ツール**: `youtube{機能名}Tool`
   - 例: `youtubeTitleGeneratorTool`, `youtubeSearchTool`

2. **エージェント**: `youtube{機能名}Agent`
   - 例: `youtubeTitleGeneratorAgent`, `youtubeInputCollectionAgent`

3. **ワークフロー**: `youtube{機能名}Workflow`
   - 例: `youtubeTitleGeneratorWorkflow`, `youtubeInputCollectionWorkflow`

詳細な命名規則ガイドラインは `docs/naming-conventions.md` を参照してください。

## 今後の課題

1. 残りのテストファイルについても、命名規則の統一を進める
2. 依存関係のモック化手法を統一し、テストの安定性を向上させる
3. 例外的な命名のコンポーネント（アナリティクス関連等）の扱いについて検討する
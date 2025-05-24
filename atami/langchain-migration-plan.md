# Mastraワークフローのlangchain移行計画

## 1. 全体的な実装計画

### 目標
Mastraの全ワークフローをLangchainベースに移行し、ステップの可視性問題を解決しつつ、より柔軟で拡張性の高いエージェンティックワークフローを実現する。

### 移行対象ワークフロー（優先順）
1. **youtubeVideoScriptGeneratorWorkflow** (✅ 完了)
2. **youtubeTitleGeneratorWorkflow** (高優先度)
3. **youtubeVideoPlanningWorkflow** (高優先度)
4. **keywordResearchWorkflow** (高優先度)
5. **youtubeChannelConceptWorkflow** (中優先度)
6. **youtubeThumbnailTitleGeneratorWorkflow** (中優先度)
7. **youtubeChannelAnalyticsWorkflow** (中優先度)
8. **youtubeVideoAnalyticsWorkflow** (中優先度)
9. **inputCollectionWorkflow** (低優先度)
10. **youtubeChannelConceptDesignWorkflow** (低優先度)
11. **youtubeKeywordStrategyWorkflow** (低優先度)

### 技術スタック
- **Langchain**: エージェントとツールの実装
- **Zod**: スキーマ検証
- **TypeScript**: 型安全な実装
- **Jest**: テスト自動化

## 2. 実行計画（フェーズ別）

### フェーズ1: 基盤構築（1-2日）
- ✅ Langchainワークフローテンプレート作成
- ✅ 最初のワークフロー移行（youtubeVideoScriptGeneratorWorkflow）
- ✅ テスト環境構築
- ⬜ Mastraバイパス用のAPIエンドポイント設計

### フェーズ2: 高優先度ワークフロー移行（3-5日）
- ⬜ youtubeTitleGeneratorWorkflow移行
- ⬜ youtubeVideoPlanningWorkflow移行
- ⬜ keywordResearchWorkflow移行
- ⬜ 統合テスト実施

### フェーズ3: 中優先度ワークフロー移行（5-7日）
- ⬜ youtubeChannelConceptWorkflow移行
- ⬜ youtubeThumbnailTitleGeneratorWorkflow移行
- ⬜ youtubeChannelAnalyticsWorkflow移行
- ⬜ youtubeVideoAnalyticsWorkflow移行
- ⬜ 統合テスト実施

### フェーズ4: 低優先度ワークフロー移行（3-4日）
- ⬜ inputCollectionWorkflow移行
- ⬜ youtubeChannelConceptDesignWorkflow移行
- ⬜ youtubeKeywordStrategyWorkflow移行
- ⬜ 統合テスト実施

### フェーズ5: 本番環境への移行（2-3日）
- ⬜ パフォーマンス最適化
- ⬜ エラーハンドリング強化
- ⬜ ドキュメント作成
- ⬜ 本番環境デプロイ

## 3. テストドリブン開発アプローチ

### テスト戦略
1. **ユニットテスト**: 各ツールの個別テスト
2. **統合テスト**: ワークフロー全体の動作テスト
3. **エンドツーエンドテスト**: 実際のユースケースでのテスト

### テスト実装手順
1. テストケース定義（入力と期待される出力）
2. テストコード実装
3. 最小限の実装でテストを通過させる
4. リファクタリング
5. 機能追加と繰り返し

### テストファイル構造
```
tests/
  unit/
    tools/
      titleGenerator.test.ts
      videoPlanning.test.ts
      ...
  integration/
    workflows/
      titleGenerator.test.ts
      videoPlanning.test.ts
      ...
  e2e/
    scenarios/
      createVideoScript.test.ts
      analyzeChannel.test.ts
      ...
```

## 4. Mastraバイパス戦略

### 問題点
Mastraワークフローは「0 step」問題があり、ステップが表示されない。また、LangchainのチェーンはMastraに直接登録できない。

### バイパス方法
1. **APIエンドポイント作成**
   - Express.jsを使用してAPIサーバーを構築
   - 各Langchainワークフローに対応するエンドポイントを作成
   - Mastraからこれらのエンドポイントを呼び出す

2. **ブリッジワークフロー**
   - Mastra内に最小限のワークフローを作成
   - このワークフローからLangchainのAPIエンドポイントを呼び出す
   - 結果をMastraに戻す

### APIサーバー構造
```typescript
// server.ts
import express from 'express';
import { youtubeVideoScriptGeneratorChain } from './workflows/videoScriptGeneratorWorkflow.langchain';
import { youtubeTitleGeneratorChain } from './workflows/titleGeneratorWorkflow.langchain';
// ... 他のワークフロー

const app = express();
app.use(express.json());

// 動画スクリプト生成エンドポイント
app.post('/api/workflows/video-script-generator', async (req, res) => {
  try {
    const chain = await youtubeVideoScriptGeneratorChain.create();
    const result = await chain.invoke(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// タイトル生成エンドポイント
app.post('/api/workflows/title-generator', async (req, res) => {
  try {
    const chain = await youtubeTitleGeneratorChain.create();
    const result = await chain.invoke(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... 他のエンドポイント

app.listen(3000, () => {
  console.log('Langchain API server running on port 3000');
});
```

## 5. 各ワークフロー移行の詳細計画

### 1. youtubeTitleGeneratorWorkflow

**テストケース**:
- 基本的なタイトル生成
- キーワードを含むタイトル生成
- 特定のスタイルでのタイトル生成

**実装ステップ**:
1. テストファイル作成
2. ツール定義（TitleGeneratorTool）
3. エージェントプロンプト定義
4. チェーン実装
5. APIエンドポイント作成

### 2. youtubeVideoPlanningWorkflow

**テストケース**:
- 基本的な動画計画生成
- キーワードリサーチを含む計画
- 競合分析を含む計画

**実装ステップ**:
1. テストファイル作成
2. ツール定義（VideoPlanningTool, KeywordResearchTool, CompetitorAnalysisTool）
3. エージェントプロンプト定義
4. チェーン実装
5. APIエンドポイント作成

### 3. keywordResearchWorkflow

**テストケース**:
- 基本的なキーワードリサーチ
- 特定のニッチ向けキーワード
- 競合性の低いキーワード探索

**実装ステップ**:
1. テストファイル作成
2. ツール定義（KeywordResearchTool, KeywordAnalysisTool）
3. エージェントプロンプト定義
4. チェーン実装
5. APIエンドポイント作成

## 6. 完全な動作環境への移行手順

### 1. 開発環境での検証
- すべてのワークフローの統合テスト
- パフォーマンステスト
- エラーケースのテスト

### 2. ステージング環境への展開
- APIサーバーのデプロイ
- Mastraブリッジワークフローの設定
- エンドツーエンドテスト

### 3. 本番環境への展開
- APIサーバーのスケーリング設定
- モニタリングとロギングの設定
- バックアップと復旧手順の確立

### 4. 運用とメンテナンス
- パフォーマンスモニタリング
- エラー追跡と修正
- 定期的な機能拡張

## 7. 次のステップ（今日から開始）

1. **youtubeTitleGeneratorWorkflow移行開始**
   - テストケース作成
   - Langchainベースの実装
   - テスト実行と検証

2. **APIサーバー基盤構築**
   - Express.jsプロジェクト設定
   - 最初のエンドポイント実装
   - 基本的なエラーハンドリング

3. **Mastraブリッジワークフロー作成**
   - 最小限のワークフロー定義
   - APIエンドポイント呼び出し実装
   - 結果処理と表示

この計画に従って順次実装を進め、テストドリブン開発のアプローチでLangchainベースのエージェンティックワークフローシステムを構築します。
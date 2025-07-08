# 命名規則ガイド

このドキュメントは、YouTube Mastraプロジェクトにおけるコード命名規則についてのガイドラインを提供します。一貫性のある命名パターンを使用することで、コードの可読性と保守性を向上させることを目的としています。

## 基本原則

YouTube Mastraプロジェクトでは、以下の基本原則に従った命名規則を採用しています：

1. **プレフィックスの一貫性**: YouTubeに関連するすべてのコンポーネントには `youtube` プレフィックスを使用します
2. **タイプサフィックス**: コンポーネントのタイプを示すサフィックスを使用します（例: `Agent`, `Tool`, `Workflow`）
3. **機能名の明確さ**: 機能を明確に表す名前を使用し、略語は避けます

## コンポーネント別の命名規則

### ツール（Tools）

ツールには `youtube{機能名}Tool` の形式を使用します。

**例:**
- `youtubeTitleGeneratorTool`
- `youtubeInputCollectionTool`
- `youtubeSearchTool`
- `youtubeChannelConceptTool`
- `youtubeThumbnailTitleGeneratorTool`
- `youtubeVideoPlanningTool`
- `youtubeKeywordResearchTool`
- `youtubeVideoScriptGeneratorTool`

例外的に、特定のアナリティクス機能については、より具体的な命名を使用します：
- `getChannelAnalytics`
- `getVideoAnalytics`
- `getAudienceGeographics`

### エージェント（Agents）

エージェントには `youtube{機能名}Agent` の形式を使用します。

**例:**
- `youtubeTitleGeneratorAgent`
- `youtubeAnalyticsAgent`
- `youtubeInputCollectionAgent`
- `youtubeChannelConceptAgent`
- `youtubeThumbnailTitleGeneratorAgent`
- `youtubeVideoPlanningAgent`
- `youtubeKeywordResearchAgent`
- `youtubeOrchestratorAgent`

### ワークフロー（Workflows）

ワークフローには `youtube{機能名}Workflow` の形式を使用します。

**例:**
- `youtubeTitleGeneratorWorkflow`
- `youtubeChannelAnalyticsWorkflow`
- `youtubeVideoAnalyticsWorkflow`
- `youtubeInputCollectionWorkflow`
- `youtubeChannelConceptWorkflow`
- `youtubeThumbnailTitleGeneratorWorkflow`
- `youtubeVideoPlanningWorkflow`
- `youtubeKeywordResearchWorkflow`

## テストファイルの命名規則

テストファイルについては、テスト対象のコンポーネントに対応した命名を使用します。

**例:**
- `youtube-search.test.ts`: `youtubeSearchTool` のテスト
- `title-generator.test.ts`: `youtubeTitleGeneratorTool` のテスト
- `input-collection.test.ts`: `youtubeInputCollectionTool`, `youtubeInputCollectionAgent`, `youtubeInputCollectionWorkflow` のテスト

E2Eテストファイルは、`.e2e.test.ts` 拡張子を使用します。

**例:**
- `inputCollection.e2e.test.ts`
- `titleGenerator.e2e.test.ts`
- `videoPlanning.e2e.test.ts`

## モック化のガイドライン

テスト内でコンポーネントをモック化する際は、以下のガイドラインに従います：

1. 適切な命名規則を保持する
2. 一貫したインターフェースを維持する
3. 適切なインポート/エクスポートパターンを使用する

**例:**
```typescript
// 正しいモック化の例
jest.mock('../src/mastra/tools/titleGenerator', () => ({
  youtubeTitleGeneratorTool: {
    id: 'youtube-title-generator',
    description: 'Generate engaging YouTube thumbnail text and titles based on video content',
    execute: mockExecute
  }
}));

import { youtubeTitleGeneratorTool } from '../src/mastra/tools/titleGenerator';
```

## 結論

一貫した命名規則を採用することで、コードの可読性、保守性、および新規開発者のオンボーディングを改善します。このガイドラインに従って、コンポーネントの命名および関連する参照を更新してください。
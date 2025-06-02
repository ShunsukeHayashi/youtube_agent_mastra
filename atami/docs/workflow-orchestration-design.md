# MASTRA ワークフロー オーケストレーション設計

## 概要

YouTube MASTRAプロジェクトのワークフロー間連携を強化するための「ワークフロー オーケストレーション」機能の設計ドキュメントです。この機能により、複数のワークフローを連携させて実行し、YouTubeコンテンツ作成のエンドツーエンドプロセスを実現します。

## 設計目標

1. **シームレスなワークフロー連携**: 各ワークフローの出力を次のワークフローの入力として使用できるよう、データの受け渡しを自動化する
2. **柔軟なワークフロー組み合わせ**: ユーザーのニーズに応じて様々なワークフローの組み合わせを可能にする
3. **状態管理**: ワークフロー実行の状態を追跡し、必要に応じて再開・リトライできるようにする
4. **エラーハンドリング**: ワークフロー連携時のエラーを適切に処理し、ユーザーに通知する
5. **拡張性**: 新しいワークフローの追加や既存ワークフローの変更に柔軟に対応できる設計

## アーキテクチャ

ワークフローオーケストレーション機能は、以下の3つの主要コンポーネントで構成されます：

1. **WorkflowChain**: 複数のワークフローを連鎖的に実行するためのクラス
2. **DataMapper**: ワークフロー間のデータマッピングを行うユーティリティ
3. **ChainExecutor**: ワークフローチェーンの実行を制御するエンジン

### 1. WorkflowChain

```typescript
interface WorkflowChainConfig {
  id: string;
  description: string;
  workflows: Array<{
    workflow: any; // ワークフロー
    inputMapping?: Record<string, string>; // 入力マッピング定義
    outputMapping?: Record<string, string>; // 出力マッピング定義
    optional?: boolean; // このワークフローがオプションかどうか
    condition?: (data: any) => boolean; // 実行条件
  }>;
}

class WorkflowChain {
  constructor(config: WorkflowChainConfig);
  
  // ワークフローチェーンを実行する
  async execute(initialInput: any): Promise<any>;
  
  // 特定のインデックスからワークフローチェーンを再開する
  async resumeFrom(index: number, contextData: any): Promise<any>;
  
  // ワークフローチェーンの実行状態を取得する
  getStatus(): WorkflowChainStatus;
}
```

### 2. DataMapper

```typescript
class DataMapper {
  // 入力マッピングを適用する
  static applyInputMapping(
    input: any,
    mapping: Record<string, string>
  ): any;
  
  // 出力マッピングを適用する
  static applyOutputMapping(
    output: any,
    mapping: Record<string, string>
  ): any;
  
  // コンテキストデータに出力を統合する
  static mergeOutputToContext(
    context: any,
    output: any,
    prefix?: string
  ): any;
}
```

### 3. ChainExecutor

```typescript
interface ChainExecutorConfig {
  onStepStart?: (stepIndex: number, workflowId: string) => void;
  onStepComplete?: (stepIndex: number, result: any) => void;
  onStepError?: (stepIndex: number, error: Error) => void;
  onChainComplete?: (result: any) => void;
}

class ChainExecutor {
  constructor(chain: WorkflowChain, config?: ChainExecutorConfig);
  
  // チェーンを実行する
  async execute(input: any): Promise<any>;
  
  // 実行を一時停止する
  pause(): void;
  
  // 実行を再開する
  resume(): void;
  
  // 実行をキャンセルする
  cancel(): void;
}
```

## ワークフロー連携パターン

### 1. シーケンシャルチェーン

最も基本的な連携パターンで、ワークフローを順番に実行します。

```typescript
const youtubeContentCreationChain = new WorkflowChain({
  id: 'youtube-content-creation-chain',
  description: 'YouTubeコンテンツ作成の一連のプロセスを実行する',
  workflows: [
    {
      workflow: youtubeInputCollectionWorkflow,
      outputMapping: {
        businessName: 'businessInfo.name',
        presenterName: 'presenter.name',
        serviceUrl: 'businessInfo.url',
      },
    },
    {
      workflow: youtubeChannelConceptWorkflow,
      inputMapping: {
        productInfo: 'businessInfo.name',
        targetAudience: 'targetAudience',
      },
      outputMapping: {
        channelConceptProposals: 'channelConcept',
      },
    },
    // 他のワークフローも同様に連鎖
  ],
});
```

### 2. 条件分岐チェーン

条件に基づいて異なるワークフローを実行します。

```typescript
const youtubeContentTypeChain = new WorkflowChain({
  id: 'youtube-content-type-chain',
  description: 'コンテンツタイプに基づいて適切なワークフローを実行する',
  workflows: [
    {
      workflow: youtubeInputCollectionWorkflow,
      outputMapping: {
        contentType: 'contentType',
        // 他のマッピング...
      },
    },
    {
      workflow: youtubeVideoPlanningWorkflow,
      condition: (data) => data.contentType === 'long-form',
      inputMapping: {
        // マッピング...
      },
    },
    {
      workflow: youtubeShortsIdeationWorkflow,
      condition: (data) => data.contentType === 'shorts',
      inputMapping: {
        // マッピング...
      },
    },
  ],
});
```

### 3. パラレルチェーン

複数のワークフローを並行して実行し、結果を集約します。

```typescript
const youtubeResearchChain = new WorkflowChain({
  id: 'youtube-research-chain',
  description: '複数のリサーチワークフローを並行して実行する',
  workflows: [
    {
      workflow: youtubeKeywordResearchWorkflow,
      parallel: true,
      inputMapping: {
        // マッピング...
      },
      outputMapping: {
        result: 'keywordResearch',
      },
    },
    {
      workflow: youtubeChannelAnalyticsWorkflow,
      parallel: true,
      inputMapping: {
        // マッピング...
      },
      outputMapping: {
        result: 'channelAnalytics',
      },
    },
    {
      workflow: youtubeVideoAnalyticsWorkflow,
      parallel: true,
      inputMapping: {
        // マッピング...
      },
      outputMapping: {
        result: 'videoAnalytics',
      },
    },
    {
      workflow: youtubeContentPlanningWorkflow,
      inputMapping: {
        keywordResearch: 'keywordResearch',
        channelAnalytics: 'channelAnalytics',
        videoAnalytics: 'videoAnalytics',
      },
    },
  ],
});
```

## 実装例：エンドツーエンドのYouTubeコンテンツ作成

長尺動画コンテンツの作成を行うエンドツーエンドのワークフローチェーンの例：

```typescript
const youtubeLongFormContentChain = new WorkflowChain({
  id: 'youtube-long-form-content-chain',
  description: '長尺動画コンテンツの作成を行うエンドツーエンドのプロセス',
  workflows: [
    // 1. 入力収集
    {
      workflow: youtubeInputCollectionWorkflow,
      outputMapping: {
        businessName: 'business.name',
        presenterName: 'presenter.name',
        youtubeGoal: 'goals.primary',
        targetAudience: 'audience.primary',
      },
    },
    
    // 2. キーワードリサーチ
    {
      workflow: youtubeKeywordResearchWorkflow,
      inputMapping: {
        keyword: 'business.topic',
        targetAudience: 'audience.primary',
      },
      outputMapping: {
        mainKeyword: 'keywords.main',
        relatedKeywords: 'keywords.related',
      },
    },
    
    // 3. 動画企画
    {
      workflow: youtubeVideoPlanningWorkflow,
      inputMapping: {
        topicKeywords: 'keywords.main.keyword',
        supportingKeywords: 'keywords.related[0].keyword',
        targetAudience: 'audience.primary',
        contentGoals: 'goals.primary',
      },
      outputMapping: {
        videoPlan: 'content.plan',
        videoOutline: 'content.outline',
      },
    },
    
    // 4. 台本生成
    {
      workflow: youtubeLongFormRoadmapWorkflow, // ロードマップ形式の台本
      inputMapping: {
        topicTitle: 'content.plan.title',
        topicDescription: 'content.plan.description',
        targetAudience: 'audience.primary',
        goalState: 'content.plan.goal',
      },
      outputMapping: {
        script: 'content.script',
      },
    },
    
    // 5. タイトル・サムネイル生成
    {
      workflow: youtubeThumbnailTitleGeneratorWorkflow,
      inputMapping: {
        videoContent: 'content.script.sections',
        seoKeywords: ['keywords.main.keyword', 'keywords.related[0].keyword'],
        targetAudience: 'audience.primary',
      },
      outputMapping: {
        thumbnailTextOptions: 'publishing.thumbnailOptions',
        titleOptions: 'publishing.titleOptions',
      },
    },
    
    // 6. コンテンツスコアリング
    {
      workflow: youtubeContentScoringWorkflow,
      optional: true, // オプショナルとして設定
      inputMapping: {
        contentType: '"long-form"',
        targetAudience: 'audience.primary',
        contentGoals: 'goals.primary',
        contentScript: 'content.script',
      },
      outputMapping: {
        overallScore: 'quality.score',
        improvementSuggestions: 'quality.improvements',
      },
    },
  ],
});
```

## データストレージ

ワークフローチェーンの状態とデータを永続化するために、以下のストレージオプションを検討します：

1. **SQLite**: 軽量で組み込み可能なデータベース
2. **JSON ファイル**: シンプルなファイルベースのストレージ
3. **Redis**: 高速なインメモリデータストア

状態管理のスキーマ例：

```typescript
interface ChainExecutionState {
  chainId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepIndex: number;
  startTime: string;
  lastUpdateTime: string;
  endTime?: string;
  contextData: any;
  results: Array<{
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
    result?: any;
    error?: string;
  }>;
}
```

## エラーハンドリング

ワークフローチェーン実行時のエラーハンドリング戦略：

1. **リトライメカニズム**: 一時的なエラーに対するリトライ
2. **フォールバック**: エラー時の代替ワークフロー実行
3. **部分的実行**: エラーが発生した場合でも可能な限り続行
4. **手動介入**: 複雑なエラーに対するユーザー介入ポイント

```typescript
interface ErrorHandlingConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackWorkflow?: any;
  continueOnError?: boolean;
  errorCallback?: (error: Error, context: any) => Promise<any>;
}
```

## UIインテグレーション

ワークフローチェーンのUIインテグレーションのアイデア：

1. **プログレスビジュアライゼーション**: チェーン実行の進捗状況を視覚化
2. **インタラクティブチェーンビルダー**: ドラッグ＆ドロップでチェーンを構築
3. **実行結果ビューア**: 各ワークフロー実行結果の詳細表示
4. **デバッグツール**: 実行中のデータ状態の検査

## 次のステップ

1. **基本実装**: WorkflowChain、DataMapper、ChainExecutorの基本実装
2. **テスト作成**: 単体テストと統合テスト
3. **例示的チェーン**: 一般的なユースケースに対するサンプルチェーン
4. **ドキュメント**: 使用方法と拡張方法のドキュメント
5. **UIコンポーネント**: 管理UIの開発

## 技術的考慮事項

1. **TypeScript型安全性**: ワークフロー間のデータ受け渡しでの型安全性確保
2. **パフォーマンス最適化**: 長時間実行ワークフローの最適化
3. **デバッグ機能**: ロギングとトレーシング機能
4. **テスト容易性**: モック可能な設計
5. **セキュリティ**: ユーザーデータの安全な処理
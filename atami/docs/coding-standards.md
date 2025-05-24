# コーディング規約とベストプラクティス

このドキュメントでは、YouTube Agent Mastraプロジェクトのコーディング規約とベストプラクティスについて説明します。

## 目次

1. [TypeScript コーディング規約](#1-typescript-コーディング規約)
2. [Mastraフレームワークのベストプラクティス](#2-mastraフレームワークのベストプラクティス)
3. [プロジェクト固有のガイドライン](#3-プロジェクト固有のガイドライン)
4. [テスト規約](#4-テスト規約)
5. [ドキュメント規約](#5-ドキュメント規約)
6. [Git ワークフロー](#6-git-ワークフロー)

## 1. TypeScript コーディング規約

### 命名規則

- **変数・関数**: キャメルケース（例: `videoTitle`, `getChannelAnalytics`）
- **クラス・インターフェース**: パスカルケース（例: `YouTubeAnalytics`, `ChannelConcept`）
- **定数**: 大文字のスネークケース（例: `MAX_RESULTS`, `DEFAULT_TIMEOUT`）
- **ファイル名**: ケバブケース（例: `youtube-analytics.ts`, `channel-concept.ts`）

### 型定義

- 明示的な型定義を使用する
- `any` 型の使用を避ける
- 複雑なオブジェクトには `interface` または `type` を定義する
- Zodスキーマを使用して入出力の型を定義する

```typescript
// 良い例
interface ChannelAnalytics {
  views: number;
  watchTime: number;
  subscribers: {
    gained: number;
    lost: number;
    total: number;
  };
}

// 避けるべき例
const getAnalytics = (channelId: string): any => {
  // ...
};
```

### エラーハンドリング

- 適切な try-catch ブロックを使用する
- エラーメッセージは具体的かつ有用な情報を含める
- エラーをコンソールに記録し、適切に上位レイヤーに伝播させる

```typescript
try {
  const result = await youtubeAnalytics.reports.query({
    // ...
  });
  return processAnalyticsResponse(result);
} catch (error) {
  console.error('Error fetching YouTube Analytics data:', error);
  throw new Error(`Failed to fetch YouTube Analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### 非同期処理

- `async/await` を一貫して使用する
- Promise チェーンよりも `async/await` を優先する
- 非同期関数は名前に `async` プレフィックスを付けない

## 2. Mastraフレームワークのベストプラクティス

### エージェント定義

- 各エージェントは明確な単一の責任を持つ
- 指示（instructions）は具体的かつ詳細に記述する
- 適切なツールを提供する
- メモリ設定を適切に構成する

```typescript
export const youtubeAnalyticsAgent = new Agent({
  name: 'YouTube Analytics Agent',
  instructions: `
    あなたはYouTubeチャンネルと動画の分析を専門とするエージェントです。
    
    主な役割:
    - チャンネルの視聴データ分析
    - 動画のパフォーマンス評価
    - 視聴者層の分析
    - 改善提案の提示
    
    分析結果は常に以下の形式で提示してください:
    1. 概要サマリー
    2. 主要KPI分析
    3. トレンド分析
    4. アクションアイテム
  `,
  model: anthropic('claude-3-7-sonnet-20250219'),
  tools: { getChannelAnalytics, getVideoAnalytics, getAudienceGeographics },
  memory: new Memory({
    // メモリ設定
  }),
});
```

### ツール定義

- 入力と出力のスキーマを明確に定義する
- 説明的な説明文を提供する
- エラーハンドリングを適切に実装する
- 再利用可能なヘルパー関数を分離する

```typescript
export const getChannelAnalytics = createTool({
  id: 'getChannelAnalytics',
  description: 'チャンネルの視聴回数・視聴維持率・CTRなどのKPIを取得',
  inputSchema: z.object({
    channelId: z.string().describe('取得対象のチャンネルID'),
    // その他のパラメータ
  }),
  outputSchema: z.object({
    // 出力スキーマ
  }),
  execute: async ({ context }) => {
    // 実装
  },
});
```

### ワークフロー定義

- ステップを論理的に分割する
- 各ステップに明確な説明を付ける
- 入力と出力のスキーマを定義する
- エラーハンドリングを組み込む

```typescript
const videoSearch = createStep({
  id: 'video-search',
  description: 'キーワードに基づいてYouTube動画を検索',
  inputSchema: z.object({
    query: z.string().describe('検索クエリ'),
    maxResults: z.number().min(1).max(50).default(10).describe('取得する結果の最大数'),
  }),
  outputSchema: z.object({
    // 出力スキーマ
  }),
  execute: async (params) => {
    // 実装
  },
});

const youtubeSearchWorkflow = new Workflow({
  name: 'youtube-search-workflow',
  triggerSchema: z.object({
    // トリガースキーマ
  }),
})
  .step(videoSearch)
  .then(curateSuggestions);
```

## 3. プロジェクト固有のガイドライン

### ディレクトリ構造

- 関連するコンポーネントは同じディレクトリに配置する
- 共通のユーティリティは `lib` ディレクトリに配置する
- テストは対応するソースファイルと同じ構造で `tests` ディレクトリに配置する

```
atami/
├── src/
│   └── mastra/
│       ├── agents/       # エージェント定義
│       ├── tools/        # ツール定義
│       ├── workflows/    # ワークフロー定義
│       └── lib/          # 共通ライブラリ
└── tests/                # テストファイル
```

### 環境変数

- 環境変数は `.env` ファイルで管理する
- 環境変数の型定義を提供する
- デフォルト値を適切に設定する
- 必須の環境変数が設定されているか確認する

```typescript
// src/mastra/lib/env.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  KEYWORD_RESEARCH_API_KEY: process.env.KEYWORD_RESEARCH_API_KEY || '',
  // その他の環境変数
};

export function validateEnv() {
  const requiredVars = ['YOUTUBE_API_KEY'];
  const missingVars = requiredVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
```

### エラーメッセージ

- エラーメッセージは日本語で統一する
- エラーコードを含める
- 解決方法のヒントを提供する

```typescript
throw new Error(`[E001] YouTube API キーが設定されていません。.envファイルにYOUTUBE_API_KEYを設定してください。`);
```

## 4. テスト規約

### テストの構造

- 各テストファイルは対応するソースファイルと同じ名前にする（例: `youtube-analytics.ts` → `youtube-analytics.test.ts`）
- テストは `describe` と `test` ブロックで論理的に構造化する
- テスト名は「何をテストするか」を明確に示す

```typescript
describe('YouTube Analytics Tools', () => {
  describe('getChannelAnalytics', () => {
    test('should be properly initialized', () => {
      // ...
    });
    
    test('should successfully get channel analytics', async () => {
      // ...
    });
    
    test('should handle errors', async () => {
      // ...
    });
  });
});
```

### モック

- 外部依存関係は適切にモック化する
- モックは各テストの前にリセットする
- 複雑なモックは専用のヘルパー関数に分離する

```typescript
jest.mock('../src/mastra/lib/google', () => ({
  getYoutubeAnalytics: jest.fn().mockReturnValue({
    reports: {
      query: jest.fn(),
    },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
```

### カバレッジ

- 単体テストは80%以上のカバレッジを目指す
- 重要なビジネスロジックは100%のカバレッジを目指す
- エッジケースと異常系のテストを含める

## 5. ドキュメント規約

### コードコメント

- 複雑なロジックには説明コメントを追加する
- 関数には JSDoc コメントを使用する
- TODO コメントには担当者と期限を含める

```typescript
/**
 * YouTube Analytics APIからのレスポンスを処理し、構造化されたデータに変換する
 * @param res API レスポンス
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 処理済みの分析データ
 */
function processAnalyticsResponse(
  res: any,
  startDate: string,
  endDate: string
): {
  rows: Record<string, string | number>[];
  summary: {
    totalViews?: number;
    avgViewDuration?: number;
    totalWatchTime?: number;
    avgCtr?: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
} {
  // 実装
}
```

### ドキュメントファイル

- 各機能には対応するMarkdownドキュメントを作成する
- ドキュメントは `docs` ディレクトリに配置する
- 図表やコード例を含める
- 定期的に更新する

## 6. Git ワークフロー

### ブランチ戦略

- `main`: 安定版のコード
- `develop`: 開発中のコード
- 機能ブランチ: `feature/機能名`
- バグ修正ブランチ: `fix/バグ名`

### コミットメッセージ

- コミットメッセージは日本語で統一する
- プレフィックスを使用する（例: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`）
- 簡潔かつ具体的な説明を含める

```
feat: チャンネル分析ツールに視聴者層分析機能を追加
fix: YouTube API認証エラーを修正
docs: セットアップガイドを更新
test: チャンネルコンセプトツールのテストを追加
refactor: ワークフローのエラーハンドリングを改善
```

### プルリクエスト

- プルリクエストには明確な説明を含める
- レビュアーを指定する
- 関連するイシューをリンクする
- テストが通過していることを確認する
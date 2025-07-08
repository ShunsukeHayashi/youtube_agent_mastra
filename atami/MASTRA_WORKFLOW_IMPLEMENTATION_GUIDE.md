# Mastra YouTubeワークフロー実装ガイド

## 概要

このドキュメントは、`prompt.md`に記載されているYouTubeワークフロー仕様に基づいて、Mastraフレームワークでの実装方法を説明します。vNext構文への更新が完了した現在のワークフローを、仕様に合わせてさらにブラッシュアップするためのガイドラインを提供します。

## ワークフロー構造

`prompt.md`に基づくと、以下の13種類のワークフローが定義されています：

1. **WORKFLOW-13**: プロジェクト初期インプット収集
2. **WORKFLOW-1**: Channel Concept Design
3. **WORKFLOW-12**: YouTubeキーワード戦略シミュレーション
4. **WORKFLOW-3**: 動画企画生成＆SEO最適化
5. **WORKFLOW-2**: YouTube動画マーケティング支援（サムネ・タイトル生成）
6. **WORKFLOW-7**: 長尺TAIKI
7. **WORKFLOW-8**: 長尺ロードマップ
8. **WORKFLOW-9**: 長尺おさる
9. **WORKFLOW-10**: 長尺もえぞう
10. **WORKFLOW-11**: 長尺掛け合い
11. **WORKFLOW-6**: コンテンツスコアリング＆フィードバック
12. **WORKFLOW-4**: YouTube Shorts企画生成
13. **WORKFLOW-5**: Shorts台本リサーチ＆生成

これらのワークフローは相互に関連しており、一連のプロセスとして機能します。

## 現在の実装状況

現在、以下のワークフローがMastraフレームワークで実装されています：

1. `inputCollectionWorkflow` (WORKFLOW-13)
2. `youtubeChannelConceptWorkflow` (WORKFLOW-1)
3. `youtubeKeywordStrategyWorkflow` (WORKFLOW-12)
4. `youtubeVideoPlanningWorkflow` (WORKFLOW-3)
5. `youtubeThumbnailTitleGeneratorWorkflow` (WORKFLOW-2)
6. `youtubeVideoScriptGeneratorWorkflow` (WORKFLOW-7)
7. `keywordResearchWorkflow` (関連ワークフロー)
8. `youtubeChannelAnalyticsWorkflow` (関連ワークフロー)
9. `youtubeVideoAnalyticsWorkflow` (関連ワークフロー)

未実装のワークフローは以下の通りです：

1. 長尺ロードマップ (WORKFLOW-8)
2. 長尺おさる (WORKFLOW-9)
3. 長尺もえぞう (WORKFLOW-10)
4. 長尺掛け合い (WORKFLOW-11)
5. コンテンツスコアリング＆フィードバック (WORKFLOW-6)
6. YouTube Shorts企画生成 (WORKFLOW-4)
7. Shorts台本リサーチ＆生成 (WORKFLOW-5)

## vNext構文への更新

すべての既存ワークフローは、`steps`配列から`.then()`メソッドを使用する方式に更新され、`workflow.commit()`が追加されました。これにより、Mastraフレームワークの最新の構文に準拠しています。

## ワークフロー実行方法

ワークフローは以下の方法で実行できます：

1. **Mastra Playground**: `http://localhost:4111/`にアクセスし、Webインターフェースからワークフローを実行
2. **API**: RESTful APIを使用してワークフローを実行
3. **CLI**: コマンドラインからワークフローを実行

## ワークフローのブラッシュアップ方針

各ワークフローを`prompt.md`の仕様に合わせてブラッシュアップするための方針を以下に示します：

### 1. WORKFLOW-13: プロジェクト初期インプット収集 (`inputCollectionWorkflow`)

**現状**: 基本的な入力収集機能は実装済み
**改善点**:
- 入力項目を仕様に合わせて調整（事業者名、演者の名前、サービスURL、YouTube運用の目的、演者のバックボーンと経歴）
- 収集した情報を他のワークフローで利用しやすい形式で保存
- ワークフロー推奨機能の強化

```typescript
// 入力スキーマの例
inputSchema: z.object({
  businessName: z.string().describe('事業者名'),
  presenterName: z.string().describe('演者の名前'),
  serviceUrl: z.string().optional().describe('サービスURL（あれば）'),
  youtubeGoal: z.string().describe('YouTube運用の目的（例：集客・認知拡大・ファン化など）'),
  presenterBackground: z.string().describe('演者のバックボーンと経歴'),
})
```

### 2. WORKFLOW-1: Channel Concept Design (`youtubeChannelConceptWorkflow`)

**現状**: 基本的なチャンネルコンセプト設計機能は実装済み
**改善点**:
- TASK_EXECUTION、INTENT_UNDERSTANDING、EXECUTION_STRATEGY、OUTPUT_TAILORING、GPT_OPTIMIZATIONの各セクションを仕様に合わせて実装
- ペルソナ設計、ポジショニング、コンテンツレーン設計の強化
- 30件のコンセプト案生成機能の確認

```typescript
// エージェント指示の例
const instructions = `
## INTENT_UNDERSTANDING
@TASK_ANALYSIS: [
EXPLICIT_REQUEST: "YouTubeチャンネルのコンセプト設計を行いたい",
IMPLICIT_NEEDS: "販売商品と関連性のあるSEOキーワード調査、ペルソナ設計、コンセプトの明文化",
SUCCESS_CRITERIA: "検索需要のあるキーワードに基づいた、的確で魅力的なチャンネルコンセプト案の生成（30案）"
]
@CONTEXT_MAPPING: [
DOMAIN_KNOWLEDGE: "YouTube SEO、マーケティング戦略、コンテンツ企画",
USER_PERSPECTIVE: "販売商品の認知向上と売上増加につながるチャンネル設計を目指す",
USAGE_SCENARIO: "マーケティング施策としてYouTubeチャンネルを立ち上げ、視聴者を顧客化する"
]

## EXECUTION_STRATEGY
@APPROACH_DESIGN: [
METHODOLOGY: "段階的な絞り込みと戦略設計によって、データと仮説に基づいたコンセプト立案を行う",
PROCESS_STEPS: "
Step1: ユーザー入力から販売商品情報を収集する。そのために、必ずサービスサイトのURLを優先的に聞くようにして、サービスサイトのURLが無ければ、詳細をヒアリングしてください。
Step2: 商品と関連性があり、検索ボリュームが高いYouTube SEOキーワードを30個抽出し、ボリューム順にランキング
Step3: 上位3キーワードに対して、それぞれユーザーペルソナ像を3つずつ抽出
Step4: 合計9ペルソナから最も相関性の高い3ペルソナを選定
Step5: 3ペルソナが達成したい未来像（ゴールイメージ）を3つ作成
Step6: 3つのゴールイメージとTOP3キーワードに基づいて、チャンネルコンセプト案を30個生成（タイトルは13文字以内、コンセプト名にはYouTube SEOキーワードを入れるようにしてください）。
"
]
`;
```

### 3. WORKFLOW-12: YouTubeキーワード戦略シミュレーション (`youtubeKeywordStrategyWorkflow`)

**現状**: 基本的なキーワード戦略機能は実装済み
**改善点**:
- Procedure (1〜9)の実装確認
- Agent Stack（初期情報→Web検索→各評価→総合スコア）の実装確認
- キーワード評価の5つの観点（検索ボリューム特性、関連性、ビジネス価値、競合性、トレンド成長性）の実装
- 総合推奨スコアの算出方法（関連性40%、ビジネス価値40%、競合性10%、トレンド10%）の確認

```typescript
// キーワード評価ステップの例
const evaluateKeywords = createStep({
  id: 'evaluate-keywords',
  description: 'Evaluate keywords based on 5 criteria',
  inputSchema: z.object({
    keywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number().nullable(),
    })),
  }),
  outputSchema: z.object({
    evaluatedKeywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number().nullable(),
      relevanceScore: z.number(), // 40%
      businessValueScore: z.number(), // 40%
      competitionScore: z.number(), // 10%
      trendScore: z.number(), // 10%
      totalScore: z.number(),
      tags: z.array(z.string()),
    })),
  }),
  execute: async ({ context }) => {
    // 実装
  }
});
```

### 4. WORKFLOW-3: 動画企画生成＆SEO最適化 (`youtubeVideoPlanningWorkflow`)

**現状**: 基本的な動画企画生成機能は実装済み
**改善点**:
- INTENT_UNDERSTANDING、EXECUTION_STRATEGY、OUTPUT_TAILORING、GPT_OPTIMIZATIONの各セクションを仕様に合わせて実装
- 実行用プロンプト（Step-1〜Step-4）の実装確認

### 5. WORKFLOW-2: YouTube動画マーケティング支援 (`youtubeThumbnailTitleGeneratorWorkflow`)

**現状**: 基本的なサムネイル・タイトル生成機能は実装済み
**改善点**:
- INTENT_UNDERSTANDING、EXECUTION_STRATEGY、OUTPUT_TAILORING、GPT_OPTIMIZATIONの各セクションを仕様に合わせて実装
- PROMPT_BODY（Step-1〜Step-8 + 使用ヒント）の実装確認

### 6. 長尺動画台本生成ワークフロー

**現状**: 基本的な動画スクリプト生成機能は実装済み（`youtubeVideoScriptGeneratorWorkflow`）
**改善点**:
- 各タイプ（TAIKI、ロードマップ、おさる、もえぞう、掛け合い）に対応するワークフローの実装
- 各タイプの特性に合わせたプロンプトの実装

#### 6.1 WORKFLOW-7: 長尺TAIKI

```typescript
// 長尺TAIKIワークフローの例
const youtubeLongFormTaikiWorkflow = createWorkflow({
  id: 'youtube-long-form-taiki-workflow',
  description: '長尺TAIKI形式の動画台本を生成するワークフロー',
  inputSchema: z.object({
    videoTitle: z.string().describe('動画のタイトル'),
    videoOutline: z.string().describe('動画の概要'),
    targetAudience: z.string().describe('ターゲットオーディエンス'),
    videoDuration: z.string().describe('動画の長さ'),
    tone: z.string().describe('トーンと話し方'),
    callToAction: z.string().describe('コールトゥアクション'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      script: z.string(),
      metadata: z.object({
        estimatedDuration: z.string(),
        targetKeywords: z.array(z.string()),
        scriptStructure: z.array(z.object({
          section: z.string(),
          duration: z.string(),
          purpose: z.string(),
        })),
      }),
    }).optional(),
  }),
})
  .then(validateScriptInputStep)
  .then(researchContentStep)
  .then(generateTaikiScriptStep);

// ワークフローをコミット
youtubeLongFormTaikiWorkflow.commit();
```

### 7. WORKFLOW-6: コンテンツスコアリング＆フィードバック

**現状**: 未実装
**改善点**:
- 評価ステップ（Step-1〜Step-4）の実装
- スコアリング項目一覧の実装

```typescript
// コンテンツスコアリングワークフローの例
const youtubeContentScoringWorkflow = createWorkflow({
  id: 'youtube-content-scoring-workflow',
  description: 'YouTubeコンテンツのスコアリングとフィードバックを行うワークフロー',
  inputSchema: z.object({
    videoUrl: z.string().describe('評価対象の動画URL'),
    contentType: z.string().describe('コンテンツタイプ'),
    targetAudience: z.string().describe('ターゲットオーディエンス'),
    contentGoals: z.string().describe('コンテンツの目標'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      overallScore: z.number(),
      categoryScores: z.object({
        engagement: z.number(),
        retention: z.number(),
        seo: z.number(),
        production: z.number(),
        storytelling: z.number(),
      }),
      feedback: z.string(),
      improvementSuggestions: z.array(z.object({
        category: z.string(),
        suggestion: z.string(),
        priority: z.string(),
      })),
    }).optional(),
  }),
})
  .then(validateContentScoringInputStep)
  .then(analyzeContentStep)
  .then(generateScoringReportStep);

// ワークフローをコミット
youtubeContentScoringWorkflow.commit();
```

### 8. WORKFLOW-4: YouTube Shorts企画生成

**現状**: 未実装
**改善点**:
- INTENT_UNDERSTANDING、EXECUTION_STRATEGY、OUTPUT_TAILORING、GPT_OPTIMIZATIONの各セクションを実装
- 実行用プロンプト（Step-1〜Step-6）の実装

```typescript
// YouTube Shorts企画生成ワークフローの例
const youtubeShortsIdeationWorkflow = createWorkflow({
  id: 'youtube-shorts-ideation-workflow',
  description: 'YouTube Shorts企画を生成するワークフロー',
  inputSchema: z.object({
    channelConcept: z.string().describe('チャンネルのコンセプト'),
    targetAudience: z.string().describe('ターゲットオーディエンス'),
    mainKeywords: z.array(z.string()).describe('メインキーワード'),
    contentGoals: z.string().describe('コンテンツの目標'),
    trendTopics: z.array(z.string()).optional().describe('トレンドトピック'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      shortsIdeas: z.array(z.object({
        title: z.string(),
        concept: z.string(),
        hook: z.string(),
        structure: z.string(),
        duration: z.string(),
        visualElements: z.array(z.string()),
        callToAction: z.string(),
        keywords: z.array(z.string()),
        trendRelevance: z.string(),
      })),
      recommendedSeries: z.array(z.object({
        seriesName: z.string(),
        videos: z.array(z.number()),
        strategy: z.string(),
      })),
    }).optional(),
  }),
})
  .then(validateShortsIdeationInputStep)
  .then(researchTrendsStep)
  .then(generateShortsIdeasStep)
  .then(createSeriesRecommendationsStep);

// ワークフローをコミット
youtubeShortsIdeationWorkflow.commit();
```

### 9. WORKFLOW-5: Shorts台本リサーチ＆生成

**現状**: 未実装
**改善点**:
- 検索キーワード/企画タイトル/目的の実装
- 台本出力フォーマット（1〜4）の実装

```typescript
// Shorts台本生成ワークフローの例
const youtubeShortsScriptWorkflow = createWorkflow({
  id: 'youtube-shorts-script-workflow',
  description: 'YouTube Shorts台本を生成するワークフロー',
  inputSchema: z.object({
    shortsTitle: z.string().describe('Shortsのタイトル'),
    searchKeywords: z.array(z.string()).describe('検索キーワード'),
    contentPurpose: z.string().describe('コンテンツの目的'),
    targetAudience: z.string().describe('ターゲットオーディエンス'),
    duration: z.string().describe('動画の長さ（秒）'),
    visualStyle: z.string().optional().describe('ビジュアルスタイル'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    result: z.object({
      script: z.string(),
      metadata: z.object({
        estimatedDuration: z.string(),
        targetKeywords: z.array(z.string()),
        visualNotes: z.string(),
        audioNotes: z.string(),
      }),
    }).optional(),
  }),
})
  .then(validateShortsScriptInputStep)
  .then(researchShortsContentStep)
  .then(generateShortsScriptStep);

// ワークフローをコミット
youtubeShortsScriptWorkflow.commit();
```

## ワークフロー間の連携

ワークフロー間の連携を強化するために、以下の方法を検討します：

1. **共通データストア**: ワークフロー間でデータを共有するための共通データストアの実装
2. **ワークフローチェーン**: 複数のワークフローを連鎖させて実行するためのメカニズムの実装
3. **イベント駆動型アーキテクチャ**: ワークフロー間でイベントを発行・購読するためのメカニズムの実装

```typescript
// ワークフローチェーンの例
const youtubeContentCreationChain = createWorkflowChain({
  id: 'youtube-content-creation-chain',
  description: 'YouTubeコンテンツ作成の一連のプロセスを実行するワークフローチェーン',
  workflows: [
    {
      workflow: inputCollectionWorkflow,
      outputMapping: {
        businessName: 'businessName',
        presenterName: 'presenterName',
        serviceUrl: 'serviceUrl',
        youtubeGoal: 'youtubeGoal',
        presenterBackground: 'presenterBackground',
      },
    },
    {
      workflow: youtubeChannelConceptWorkflow,
      inputMapping: {
        productInfo: 'businessName',
        targetAudience: 'targetAudience',
        serviceUrl: 'serviceUrl',
        businessGoals: 'youtubeGoal',
      },
      outputMapping: {
        channelConceptProposals: 'channelConcept',
      },
    },
    {
      workflow: youtubeKeywordStrategyWorkflow,
      inputMapping: {
        company_url: 'serviceUrl',
        target_audience: 'targetAudience',
        youtube_purpose: 'youtubeGoal',
      },
      outputMapping: {
        keywordStrategy: 'keywordStrategy',
      },
    },
    // 他のワークフローも同様に連鎖
  ],
});
```

## テスト方法

各ワークフローのテスト方法を以下に示します：

1. **単体テスト**: 各ワークフローの個別テスト
2. **統合テスト**: ワークフロー間の連携テスト
3. **エンドツーエンドテスト**: ユーザーシナリオに基づくテスト

```typescript
// 単体テストの例
describe('youtubeChannelConceptWorkflow', () => {
  it('should generate channel concept proposals', async () => {
    const input = {
      productInfo: 'テスト商品',
      targetAudience: 'テストユーザー',
      serviceUrl: 'https://example.com',
      businessGoals: 'テスト目標',
    };
    
    const result = await youtubeChannelConceptWorkflow.execute(input);
    
    expect(result.success).toBe(true);
    expect(result.result?.channelConceptProposals).toBeDefined();
  });
});
```

## 今後の課題

1. **未実装ワークフローの実装**: 残りのワークフローを実装する
2. **ワークフロー間の連携強化**: ワークフロー間のデータ連携を強化する
3. **UIの改善**: ユーザーインターフェースを改善し、ワークフローの使いやすさを向上させる
4. **パフォーマンスの最適化**: ワークフローの実行パフォーマンスを最適化する
5. **エラーハンドリングの強化**: エラーハンドリングを強化し、ユーザーに適切なフィードバックを提供する
6. **ドキュメントの充実**: ワークフローの使用方法や設定方法に関するドキュメントを充実させる

## まとめ

Mastra YouTubeワークフローは、`prompt.md`に記載されている仕様に基づいて実装されています。vNext構文への更新が完了し、ワークフローの基本構造は整っていますが、さらに仕様に合わせたブラッシュアップが必要です。

このガイドに従って、各ワークフローを仕様に合わせて改善し、ワークフロー間の連携を強化することで、YouTubeコンテンツ作成の一連のプロセスをサポートする強力なツールセットを構築できます。
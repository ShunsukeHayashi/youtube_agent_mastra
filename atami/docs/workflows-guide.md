# ワークフロー使用ガイド

このドキュメントでは、YouTube Agent Mastraの各ワークフローの使用方法について説明します。

## 目次

1. [キーワードリサーチワークフロー](#1-キーワードリサーチワークフロー)
2. [チャンネルコンセプトワークフロー](#2-チャンネルコンセプトワークフロー)
3. [動画企画ワークフロー](#3-動画企画ワークフロー)
4. [タイトル生成ワークフロー](#4-タイトル生成ワークフロー)
5. [サムネイル・タイトル生成ワークフロー](#5-サムネイルタイトル生成ワークフロー)
6. [分析ワークフロー](#6-分析ワークフロー)
7. [入力収集ワークフロー](#7-入力収集ワークフロー)

## 1. キーワードリサーチワークフロー

YouTubeでのキーワードリサーチを行い、検索ボリュームと競合性を分析します。

### 入力パラメータ

```typescript
{
  topic: string;           // リサーチするトピック
  maxResults?: number;     // 取得する結果の最大数（デフォルト: 10）
  includeCompetition?: boolean; // 競合性分析を含めるか（デフォルト: true）
}
```

### 使用例

```typescript
import { keywordResearchWorkflow } from './src/mastra/workflows';

const result = await keywordResearchWorkflow.run({
  topic: "プログラミング学習",
  maxResults: 20,
  includeCompetition: true
});

console.log(result);
```

### 出力例

```json
{
  "keywords": [
    {
      "keyword": "プログラミング 独学",
      "searchVolume": 12000,
      "competition": "高",
      "relevance": 0.95
    },
    {
      "keyword": "プログラミング 初心者",
      "searchVolume": 8500,
      "competition": "中",
      "relevance": 0.92
    }
  ],
  "relatedTopics": ["Python 入門", "JavaScript 学習"],
  "recommendations": "「プログラミング 独学」は検索ボリュームが高いですが、競合も多いです。「プログラミング 初心者 Python」のように特化したキーワードも検討してください。"
}
```

## 2. チャンネルコンセプトワークフロー

ターゲットオーディエンスとキーワード分析に基づいたYouTubeチャンネルのコンセプトを提案します。

### 入力パラメータ

```typescript
{
  productDescription: string;    // 製品・サービスの説明
  targetAudience?: string;       // ターゲットオーディエンスの説明
  businessGoals?: string;        // ビジネス目標
  industryCategory?: string;     // 業界カテゴリ
  websiteUrl?: string;           // ウェブサイトURL
}
```

### 使用例

```typescript
import { youtubeChannelConceptWorkflow } from './src/mastra/workflows';

const result = await youtubeChannelConceptWorkflow.run({
  productDescription: "オンラインプログラミングスクール",
  targetAudience: "プログラミング初心者、キャリアチェンジを考えている20代〜30代",
  businessGoals: "リード獲得と認知度向上",
  industryCategory: "教育・テクノロジー"
});

console.log(result);
```

### 出力例

```json
{
  "channelConcepts": [
    {
      "title": "コードキャリア",
      "description": "未経験からプログラマーへのキャリアチェンジを支援するチャンネル",
      "targetKeywords": ["プログラミング 独学", "プログラミング 転職"],
      "targetPersonas": ["キャリアチェンジ希望者", "プログラミング初心者"],
      "contentThemes": ["言語別入門講座", "転職成功事例", "業界動向解説"],
      "uniqueSellingPoint": "実際の転職成功者が講師として登場し、リアルな体験を共有"
    }
  ],
  "keywordAnalysis": { /* キーワード分析結果 */ },
  "personaAnalysis": { /* ペルソナ分析結果 */ }
}
```

## 3. 動画企画ワークフロー

SEO最適化された動画コンテンツの企画を提案します。

### 入力パラメータ

```typescript
{
  topic: string;              // 動画のトピック
  targetKeywords?: string[];  // ターゲットキーワード
  contentType?: string;       // コンテンツタイプ（チュートリアル、解説、レビューなど）
  duration?: string;          // 想定動画時間（短尺、中尺、長尺）
  channelConcept?: string;    // チャンネルコンセプト
}
```

### 使用例

```typescript
import { youtubeVideoPlanningWorkflow } from './src/mastra/workflows';

const result = await youtubeVideoPlanningWorkflow.run({
  topic: "React Hooks入門",
  targetKeywords: ["React Hooks 使い方", "React useState", "React useEffect"],
  contentType: "チュートリアル",
  duration: "中尺（15-20分）"
});

console.log(result);
```

### 出力例

```json
{
  "videoTitle": "【React入門】useState/useEffectの使い方を徹底解説！初心者でもわかるHooks入門",
  "description": "Reactの基本的なHooksであるuseStateとuseEffectの使い方を初心者向けに解説します...",
  "outline": [
    {
      "section": "イントロダクション",
      "content": "Reactの関数コンポーネントとHooksの概要",
      "duration": "2分"
    },
    {
      "section": "useState Hookの基本",
      "content": "状態管理の基本とuseStateの使い方",
      "duration": "5分"
    }
  ],
  "keyPoints": ["Hooksが導入された背景", "クラスコンポーネントとの違い"],
  "callToAction": "コメント欄に質問や次に見たい内容を書いてください",
  "seoRecommendations": {
    "tags": ["React", "useState", "useEffect", "React Hooks", "JavaScript"],
    "description": "タグにキーワードを含め、説明文の最初の2行に主要キーワードを入れることで検索表示の最適化ができます"
  }
}
```

## 4. タイトル生成ワークフロー

高CTRを実現するYouTube動画タイトルを生成します。

### 入力パラメータ

```typescript
{
  topic: string;              // 動画のトピック
  targetKeywords?: string[];  // ターゲットキーワード
  contentType?: string;       // コンテンツタイプ
  style?: string;             // タイトルのスタイル（質問形式、ハウツー、リスト形式など）
  maxLength?: number;         // タイトルの最大文字数
}
```

### 使用例

```typescript
import { youtubeTitleGeneratorWorkflow } from './src/mastra/workflows';

const result = await youtubeTitleGeneratorWorkflow.run({
  topic: "Pythonでデータ分析",
  targetKeywords: ["Python データ分析", "pandas 使い方"],
  contentType: "チュートリアル",
  style: "ハウツー"
});

console.log(result);
```

### 出力例

```json
{
  "titles": [
    {
      "title": "【Python入門】30分で始めるデータ分析！pandasの使い方を徹底解説",
      "ctrPrediction": "高",
      "strengths": "数字（30分）の使用、「徹底解説」という価値提案",
      "weaknesses": "やや長い"
    },
    {
      "title": "初心者でもできる！Pythonデータ分析の始め方【pandas実践】",
      "ctrPrediction": "中〜高",
      "strengths": "「初心者でもできる」という安心感、実践的な内容を示唆",
      "weaknesses": "具体性がやや不足"
    }
  ],
  "recommendations": "キーワード「Python データ分析」と「pandas」を前半に配置し、視聴者のメリットを明確に示すタイトルが効果的です。"
}
```

## 5. サムネイル・タイトル生成ワークフロー

高CTRを実現するYouTube動画のタイトルとサムネイルのコンセプトを生成します。

### 入力パラメータ

```typescript
{
  topic: string;              // 動画のトピック
  targetKeywords?: string[];  // ターゲットキーワード
  contentType?: string;       // コンテンツタイプ
  channelStyle?: string;      // チャンネルのスタイル・トーン
  competitorUrls?: string[];  // 競合動画のURL
}
```

### 使用例

```typescript
import { youtubeThumbnailTitleGeneratorWorkflow } from './src/mastra/workflows';

const result = await youtubeThumbnailTitleGeneratorWorkflow.run({
  topic: "iPhone 15 レビュー",
  targetKeywords: ["iPhone 15 特徴", "iPhone 15 カメラ"],
  contentType: "レビュー",
  channelStyle: "テクノロジー系、プロフェッショナル"
});

console.log(result);
```

### 出力例

```json
{
  "titleSuggestions": [
    "iPhone 15レビュー：買うべき3つの理由と避けるべき2つの理由",
    "【本音レビュー】iPhone 15は買いなのか？プロが教える全特徴"
  ],
  "thumbnailConcepts": [
    {
      "concept": "iPhone 15を手に持ち、カメラ部分を強調した構図",
      "elements": ["iPhone 15本体", "「買い？待ち？」のテキスト", "評価スコア"],
      "colorScheme": "Appleのブランドカラーに合わせた白と青",
      "focusPoint": "カメラ部分と評価スコア"
    }
  ],
  "combinationRecommendations": "タイトルで数字を使い（3つの理由、2つの理由）、サムネイルでは製品の特徴的な部分（カメラ）を強調することで高CTRが期待できます。"
}
```

## 6. 分析ワークフロー

YouTubeチャンネルや動画のパフォーマンスを分析します。

### チャンネル分析

#### 入力パラメータ

```typescript
{
  channelId: string;          // チャンネルID
  startDate?: string;         // 開始日（YYYY-MM-DD形式）
  endDate?: string;           // 終了日（YYYY-MM-DD形式）
  metrics?: string[];         // 取得するメトリクス
  dimensions?: string;        // 分析の次元（日、週、月など）
}
```

#### 使用例

```typescript
import { youtubeChannelAnalyticsWorkflow } from './src/mastra/workflows';

const result = await youtubeChannelAnalyticsWorkflow.run({
  channelId: "UCxxxxxxxxxxxxxxxx",
  startDate: "2025-04-01",
  endDate: "2025-04-30",
  metrics: ["views", "averageViewDuration", "estimatedMinutesWatched"]
});

console.log(result);
```

### 動画分析

#### 入力パラメータ

```typescript
{
  channelId: string;          // チャンネルID
  videoId: string;            // 動画ID
  startDate?: string;         // 開始日
  endDate?: string;           // 終了日
  metrics?: string[];         // 取得するメトリクス
}
```

#### 使用例

```typescript
import { youtubeVideoAnalyticsWorkflow } from './src/mastra/workflows';

const result = await youtubeVideoAnalyticsWorkflow.run({
  channelId: "UCxxxxxxxxxxxxxxxx",
  videoId: "xxxxxxxxxxx",
  metrics: ["views", "averageViewDuration", "averageViewPercentage"]
});

console.log(result);
```

## 7. 入力収集ワークフロー

ユーザーから必要な情報を対話形式で収集します。

### 入力パラメータ

```typescript
{
  workflowType: string;       // 実行するワークフローのタイプ
  initialData?: Record<string, any>; // 初期データ
}
```

### 使用例

```typescript
import { inputCollectionWorkflow } from './src/mastra/workflows';

const result = await inputCollectionWorkflow.run({
  workflowType: "videoPlanning",
  initialData: {
    topic: "プログラミング入門"
  }
});

console.log(result);
```

### 出力例

```json
{
  "collectedData": {
    "topic": "プログラミング入門",
    "targetKeywords": ["プログラミング 初心者", "プログラミング 始め方"],
    "contentType": "チュートリアル",
    "duration": "15-20分"
  },
  "workflowType": "videoPlanning",
  "isComplete": true
}
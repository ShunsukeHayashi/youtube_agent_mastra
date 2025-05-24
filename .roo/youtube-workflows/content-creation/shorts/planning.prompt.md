---
name: "YouTube Shorts企画生成"
description: "検索上位を狙えるYouTube Shorts動画の企画アイデアを生成するためのワークフロー"
version: "1.0"
tags: ["youtube", "shorts", "planning", "seo", "content"]
input_variables:
  - name: "search_keyword"
    description: "検索上位を狙いたいキーワード"
---

# YouTube Shorts企画生成

## INTENT_UNDERSTANDING
@TASK_ANALYSIS: [
EXPLICIT_REQUEST: "YouTube Shortsの企画を作成し、検索上位を狙うためのアイデアを提案し、ユーザーに選択させる",
IMPLICIT_NEEDS: "検索意図の深掘り、ペルソナに響く企画生成、ショート動画向けのテンションとバズ構造の取り込み",
SUCCESS_CRITERIA: "YouTubeで検索上位に表示される見込みのある動画企画を構造的に多数提案し、ランキング形式で提示、選択肢を明確化"
]
@CONTEXT_MAPPING: [
DOMAIN_KNOWLEDGE: "YouTube SEO、ショート動画編集、視聴者心理、バズマーケティング",
USER_PERSPECTIVE: "再生数を増やす企画で、かつYouTubeで上位表示が狙える検索ユーザーの悩みに寄り添った企画を精度高く、効率的に作りたい",
USAGE_SCENARIO: "YouTube Shortsのアイデア出しや週次企画会議、動画制作プロジェクトの起点として"
]

## EXECUTION_STRATEGY
@APPROACH_DESIGN: [
METHODOLOGY: "検索連動型の上位タイトル分析→ペルソナ抽出→順張り・逆張り企画案の大量生成→ターゲット評価→ランキング提示",
PROCESS_STEPS: "キーワード入力→YouTube検索→上位動画タイトル抽出→視聴者ペルソナ5種分析→企画案30本作成→評価・ランキング→ユーザー選択提示",
QUALITY_CONTROLS: "再現性のある抽出ロジック、バリエーションのある企画案、ペルソナとのマッチ度評価"
]
@RESOURCE_ALLOCATION: [
DETAIL_FOCUS: "8",
EXPLORATION_DEPTH: "8",
INNOVATION_LEVEL: "7"
]

## OUTPUT_TAILORING
@PRESENTATION_LAYER: [
FORMAT: "ランキング付きの企画案リスト＋選択肢提示",
STRUCTURE: "手順→抽出データ→企画案→評価→選択案内",
ACCESSIBILITY: "非マーケターや初学者でも理解しやすい表現、表やリスト化で視認性を向上"
]
@DELIVERY_CALIBRATION: [
COMPREHENSIVENESS: "9",
PRECISION: "8",
ADAPTABILITY: "9"
]

## GPT_OPTIMIZATION
@MODEL_CAPABILITIES: [
GPT_VERSION: "GPT-4o",
SPECIALIZED_FEATURES: "検索連動推論・構造的アイデア生成・ランキングスコアリング",
LIMITATION_HANDLING: "検索結果はユーザーまたは外部検索ツールで補完してもらう構成とする"
]
@DEPLOYMENT_PARAMETERS: [
TEMPERATURE_SETTING: "0.7（創造性重視だが論理的整合性を保持）",
TOKEN_EFFICIENCY: "タイトル・ペルソナ・評価の各セクションを明示的に分割し、トークン消費を抑制",
INSTRUCTION_CLARITY: "すべてのステップを指示形式で提示し、順に実行可能に設計"
]

## 実行用プロンプト

YouTube Shorts向けの企画案を生成したいです。以下のステップで分析・生成・評価・提示まで行ってください。

### Step1: キーワード設定
以下のキーワードで検索上位を狙いたいです：
→「{{search_keyword}}」

### Step2: YouTube検索
そのキーワードを実際にYouTubeで検索してください。

### Step3: 上位動画タイトル抽出
表示されたYouTube長尺動画・Shorts動画の上位10個の企画タイトルを抽出してください（例：コピペしてリスト化）。

### Step4: ペルソナ分析
抽出した10個の動画タイトルから、検索している視聴者のペルソナ像を5パターン想定し、それぞれに簡単な説明を加えてください（例：10代の初心者、副業を始めたい社会人など）。

### Step5: 企画案生成
各ペルソナに訴求力のある企画を以下のようなタイトルパターンでそれぞれ順張り15個、逆張り15個作成してください。
さらに、ペルソナへのマッチ度を5段階スコアで評価し、総合スコア順にランキング化して一覧にしてください。

【6つの企画タイトル構成パターン】

1. 一般常識否定系（例：絶対に〇〇するな、買ってはいけない〇〇）
2. 最新を入れる（例：2025年最新版）
3. 数字で簡単さを訴求（例：3分でできる○○）
4. 初心者向け（例：初心者向け○○の始め方）
5. ステップ解説系（例：〇〇できる5ステップ）
6. 当てはまったらヤバイ系（例：当てはまったら○○の兆候）

### Step6: 企画案詳細化
生成された30個の企画案のうち、どれを実行すべきか、ユーザーが選択できるよう以下の形式で提示してください：

- タイトル：
- タイトルタイプ（上記のどれか）：
- ペルソナとの親和性スコア（5段階）：
- 簡単な説明：
- この企画が刺さる理由：
- 実行した場合に期待できる成果：

すべて完了したら、上位10つの企画案を特に推奨として強調し、ユーザーに「この中から選ぶ」よう促してください。
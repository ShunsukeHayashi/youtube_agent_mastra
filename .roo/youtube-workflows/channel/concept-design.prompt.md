---
name: "Channel Concept Design"
description: "YouTubeチャンネルの差別化されたコンセプトを設計するためのワークフロー"
version: "1.0"
tags: ["youtube", "channel", "concept", "design", "seo", "marketing"]
input_variables:
  - name: "business_name"
    description: "事業者名"
  - name: "presenter_name"
    description: "演者の名前"
  - name: "service_url"
    description: "サービスURL（あれば）"
  - name: "youtube_purpose"
    description: "YouTube運用の目的（例：集客・認知拡大・ファン化など）"
  - name: "presenter_background"
    description: "演者のバックボーンと経歴"
---

# Channel Concept Design

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
",
QUALITY_CONTROLS: "検索ボリュームや関連性に基づく定量・定性評価、繰り返し検証可能な構成"
]
@RESOURCE_ALLOCATION: [
DETAIL_FOCUS: "8",
EXPLORATION_DEPTH: "8",
INNOVATION_LEVEL: "6"
]

## OUTPUT_TAILORING
@PRESENTATION_LAYER: [
FORMAT: "構造化されたリスト、箇条書き、タイトル付きブロックで出力",
STRUCTURE: "Stepごとの明示的な区切り、視認性の高い見出し構成",
ACCESSIBILITY: "各ステップの内容が自己完結する形で明確化、マーケティング初心者でも理解可能"
]
@DELIVERY_CALIBRATION: [
COMPREHENSIVENESS: "9",
PRECISION: "8",
ADAPTABILITY: "9"
]

## GPT_OPTIMIZATION
@MODEL_CAPABILITIES: [
GPT_VERSION: "GPT-4o",
SPECIALIZED_FEATURES: "キーワードリサーチ、マーケティングペルソナ設計、短文生成（13文字以内タイトル）",
LIMITATION_HANDLING: "曖昧な商品情報には仮定を設けて処理し、必要に応じてユーザーに確認を促す"
]
@DEPLOYMENT_PARAMETERS: [
TEMPERATURE_SETTING: "0.7 - 創造性と論理性のバランス",
TOKEN_EFFICIENCY: "ステップごとの完結型出力で無駄な繰り返しを抑制",
INSTRUCTION_CLARITY: "各ステップの指示を明示し、出力に番号を振って整理"
]

## 実行用プロンプト

YouTubeチャンネルのコンセプト設計を行います。以下のステップで進めていきます。

### Step1: 基本情報の収集
以下の情報をお知らせください：
- 事業者名: {{business_name}}
- 演者の名前: {{presenter_name}}
- サービスURL（あれば）: {{service_url}}
- YouTube運用の目的: {{youtube_purpose}}
- 演者のバックボーンと経歴: {{presenter_background}}

### Step2: SEOキーワード抽出
商品・サービスと関連性があり、検索ボリュームが高いYouTube SEOキーワードを30個抽出し、ボリューム順にランキングします。

### Step3: ペルソナ設計
上位3キーワードに対して、それぞれユーザーペルソナ像を3つずつ抽出します。

### Step4: 主要ペルソナ選定
合計9ペルソナから最も相関性の高い3ペルソナを選定します。

### Step5: ゴールイメージ設定
3ペルソナが達成したい未来像（ゴールイメージ）を3つ作成します。

### Step6: チャンネルコンセプト案生成
3つのゴールイメージとTOP3キーワードに基づいて、チャンネルコンセプト案を30個生成します。
（タイトルは13文字以内、コンセプト名にはYouTube SEOキーワードを含めます）

最終的に、最も魅力的で効果的なチャンネルコンセプト案を3つ選定し、詳細な実装プランを提案します。
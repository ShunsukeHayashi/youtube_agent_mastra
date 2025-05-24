---
name: "長尺掛け合い"
description: "専門家と対話者による対話形式の台本を生成するワークフロー"
version: "1.0"
tags: ["youtube", "long-form", "script", "dialogue", "conversation"]
input_variables:
  - name: "video_primary_theme_universal"
    description: "動画の主要テーマ"
  - name: "dialogue_central_topic_short"
    description: "対話の中心トピック"
  - name: "focus_keyword_universal"
    description: "フォーカスキーワード"
  - name: "main_viewer_pain_point_or_desire"
    description: "視聴者の主な悩みや欲求"
  - name: "specific_viewer_questions_related_to_pain"
    description: "視聴者の悩みに関連する具体的な質問"
  - name: "primary_expert_name"
    description: "専門家の名前"
  - name: "primary_expert_descriptor"
    description: "専門家の説明"
  - name: "primary_expert_catchphrase_or_style"
    description: "専門家のキャッチフレーズやスタイル"
  - name: "interlocutor_name"
    description: "対話者の名前"
  - name: "interlocutor_style_or_role"
    description: "対話者のスタイルや役割"
  - name: "conversation_setting_hint"
    description: "会話の設定ヒント"
  - name: "discussion_segment_1_title"
    description: "議論セグメント1のタイトル"
  - name: "discussion_segment_1_title_short"
    description: "議論セグメント1の短いタイトル"
  - name: "discussion_segment_1_points_detailed_list"
    description: "議論セグメント1の詳細ポイントリスト"
  - name: "discussion_segment_2_title"
    description: "議論セグメント2のタイトル"
  - name: "discussion_segment_2_title_short"
    description: "議論セグメント2の短いタイトル"
  - name: "discussion_segment_2_points_detailed_list"
    description: "議論セグメント2の詳細ポイントリスト"
  - name: "discussion_segment_3_title"
    description: "議論セグメント3のタイトル"
  - name: "discussion_segment_3_title_short"
    description: "議論セグメント3の短いタイトル"
  - name: "discussion_segment_3_points_detailed_list"
    description: "議論セグメント3の詳細ポイントリスト"
  - name: "supplementary_topic_exists_universal"
    description: "補足トピックが存在するか"
  - name: "supplementary_topic_details_expanded_universal"
    description: "補足トピックの詳細"
  - name: "bonus_segment_exists_universal"
    description: "ボーナスセグメントが存在するか"
  - name: "bonus_segment_topic_universal"
    description: "ボーナスセグメントのトピック"
  - name: "cta_benefit_A_name_universal"
    description: "CTA特典Aの名前"
  - name: "cta_benefit_A_description_universal"
    description: "CTA特典Aの説明"
  - name: "cta_benefit_A_keyword_universal"
    description: "CTA特典Aのキーワード"
  - name: "cta_benefit_B_name_universal"
    description: "CTA特典Bの名前"
  - name: "cta_benefit_B_description_universal"
    description: "CTA特典Bの説明"
  - name: "cta_benefit_B_keyword_universal"
    description: "CTA特典Bのキーワード"
  - name: "cta_benefit_C_or_comprehensive_name_universal"
    description: "CTA特典Cまたは包括的特典の名前"
  - name: "cta_benefit_C_or_comprehensive_description_universal"
    description: "CTA特典Cまたは包括的特典の説明"
  - name: "cta_benefit_C_or_comprehensive_keyword_universal"
    description: "CTA特典Cまたは包括的特典のキーワード"
  - name: "expert_value_proposition_universal_expanded"
    description: "専門家の価値提案"
  - name: "video_length_minutes_range_universal"
    description: "動画の長さ（分）の範囲"
  - name: "technical_casual_ratio_universal"
    description: "専門的/カジュアルの比率"
---

# 長尺掛け合い

## 概要
このプロンプトは、専門家と対話者による対話形式の台本を生成するためのものです。視聴者の悩みや欲求に対応する内容を、自然な会話形式で展開します。各対話者の発言には名前プレフィックスを付け、3つのセグメント構造で情報を提供し、LINE特典の提供も含めた構成になっています。

## ユニバーサル・エキスパート会話DNAブループリント

このワークフローは、以下の構造に基づいて台本を生成します：

### 1. 導入部
- 対話者による最初の「ラフな質問」から開始（挨拶や紹介なし）
- 専門家の回答
- 視聴者の悩みへの橋渡し
- 専門家による視聴者の悩みへのフック

### 2. メインコンテンツ（3つのセグメント）
#### セグメント1
- 視聴者の悩みの本当の原因と落とし穴
- 対話者の質問と専門家の回答
- 具体的な事例や説明

#### セグメント2
- 現状を打破するための具体的な秘策
- 対話者の質問と専門家の回答
- 実践的なアドバイスと方法

#### セグメント3
- 真の解決とその先の未来
- 対話者の質問と専門家の回答
- 長期的な展望と今日からできること

### 3. 補足セクション（オプション）
- 補足トピックの議論
- ボーナスセグメントの提供

### 4. CTA（Call-to-Action）
- LINE特典Aの提供
- LINE特典Bの提供
- 包括的LINE特典Cの提供

### 5. 結論
- 対話のまとめ
- 視聴者への励まし
- チャンネル登録・高評価・コメントの呼びかけ

## 対話スタイル

### 専門家の特徴
- 専門分野における深い知見
- 難しいことを分かりやすく説明
- 情熱と誠実さ、時にユーモアを交える
- 視聴者の悩みに共感し、具体的な解決策を提供

### 対話者の特徴
- 視聴者の代弁者として機能
- 素朴な疑問から核心的な質問へと発展
- 共感力が高く、会話を自然に導く
- 専門家の説明を視聴者にとって理解しやすくするための質問

### 会話の流れ
- 自然で流動的
- 専門的な内容をカジュアルに
- 視聴者の悩みに焦点を当てる
- 具体的な例や事例を交えて説明

## 実行用プロンプト

専門家と対話者による対話形式の台本を作成します。以下の情報に基づいて、視聴者の悩みや欲求に対応する、自然な会話形式の台本を生成します。

### 基本情報
- 主要テーマ: {{video_primary_theme_universal}}
- 中心トピック: {{dialogue_central_topic_short}}
- フォーカスキーワード: {{focus_keyword_universal}}
- 視聴者の悩み/欲求: {{main_viewer_pain_point_or_desire}}

### 対話者情報
#### 専門家
- 名前: {{primary_expert_name}}
- 説明: {{primary_expert_descriptor}}
- スタイル: {{primary_expert_catchphrase_or_style}}

#### 対話者
- 名前: {{interlocutor_name}}
- 役割: {{interlocutor_style_or_role}}

### 議論セグメント
#### セグメント1
- タイトル: {{discussion_segment_1_title}}
- 短いタイトル: {{discussion_segment_1_title_short}}
- 詳細ポイント: {{discussion_segment_1_points_detailed_list}}

#### セグメント2
- タイトル: {{discussion_segment_2_title}}
- 短いタイトル: {{discussion_segment_2_title_short}}
- 詳細ポイント: {{discussion_segment_2_points_detailed_list}}

#### セグメント3
- タイトル: {{discussion_segment_3_title}}
- 短いタイトル: {{discussion_segment_3_title_short}}
- 詳細ポイント: {{discussion_segment_3_points_detailed_list}}

### オプションセクション
- 補足トピックあり: {{supplementary_topic_exists_universal}}
- 補足トピック詳細: {{supplementary_topic_details_expanded_universal}}
- ボーナスセグメントあり: {{bonus_segment_exists_universal}}
- ボーナストピック: {{bonus_segment_topic_universal}}

### CTA特典
#### 特典A
- 名前: {{cta_benefit_A_name_universal}}
- 説明: {{cta_benefit_A_description_universal}}
- キーワード: {{cta_benefit_A_keyword_universal}}

#### 特典B
- 名前: {{cta_benefit_B_name_universal}}
- 説明: {{cta_benefit_B_description_universal}}
- キーワード: {{cta_benefit_B_keyword_universal}}

#### 特典C（包括的）
- 名前: {{cta_benefit_C_or_comprehensive_name_universal}}
- 説明: {{cta_benefit_C_or_comprehensive_description_universal}}
- キーワード: {{cta_benefit_C_or_comprehensive_keyword_universal}}

### 出力要件
- 対話のみのテキスト
- 各発言の前に話者の名前とコロン（例：「田中：」「ミナミ：」）を付ける
- 動画は対話者の「ラフな質問」から始める（挨拶や紹介なし）
- 自然な会話の流れを維持
- 視聴者の悩みに焦点を当てた内容
- 専門的な内容を分かりやすく説明
- 各セグメントで具体的な例や事例を交える
- CTAを自然に組み込む

最終的に、視聴者が{{main_viewer_pain_point_or_desire}}を解決するための具体的な情報と洞察を得られる、専門家と対話者による自然で魅力的な対話形式の台本を提供します。
---
name: "長尺もえぞう"
description: "キュレーション/ランキング形式の台本を生成するワークフロー"
version: "1.0"
tags: ["youtube", "long-form", "script", "ranking", "curation"]
input_variables:
  - name: "focus_keyword"
    description: "動画内で強調するキーワード"
  - name: "video_target_theme_curation"
    description: "動画のテーマ"
  - name: "primary_goal_curation"
    description: "動画の主要目標"
  - name: "emotional_impact_level_curation"
    description: "感情的インパクトのレベル"
  - name: "target_audience_gender"
    description: "ターゲット視聴者の性別"
  - name: "target_audience_age_group"
    description: "ターゲット視聴者の年齢層"
  - name: "target_audience_specific_attribute"
    description: "ターゲット視聴者の特定の属性"
  - name: "target_audience_specific_problem_or_desire"
    description: "ターゲット視聴者の特定の問題や欲求"
  - name: "ranking_count"
    description: "ランキングの数"
  - name: "item_category_plural"
    description: "ランキング対象アイテムのカテゴリ（複数形）"
  - name: "item_category_singular"
    description: "ランキング対象アイテムのカテゴリ（単数形）"
  - name: "life_aspect_to_improve"
    description: "改善する生活の側面"
  - name: "desired_outcome_long"
    description: "望ましい結果（詳細）"
  - name: "premise_knowledge_needed"
    description: "前提知識が必要かどうか"
  - name: "premise_knowledge_topic"
    description: "前提知識のトピック"
  - name: "mid_content_section_exists"
    description: "中間コンテンツセクションが存在するかどうか"
  - name: "mid_content_topic"
    description: "中間コンテンツのトピック"
  - name: "item_name_top1_curation"
    description: "ランキング1位のアイテム名"
  - name: "line_reward_mid_name_curation"
    description: "中間LINE特典の名前"
  - name: "line_reward_final_name_curation"
    description: "最終LINE特典の名前"
  - name: "line_reward_final_keyword_curation"
    description: "最終LINE特典のキーワード"
  - name: "target_audience_persona_curation_v2"
    description: "ターゲット視聴者のペルソナ"
  - name: "target_audience_knowledge_level_curation_v2"
    description: "ターゲット視聴者の知識レベル"
  - name: "voice_style_curator"
    description: "ナレーションの声のスタイル"
  - name: "formality_level_curation"
    description: "フォーマリティレベル"
  - name: "speaker_name"
    description: "話者の名前"
  - name: "speaker_qualification"
    description: "話者の資格"
---

# 長尺もえぞう

## 概要
このプロンプトは、キュレーション/ランキング形式の台本を生成するためのものです。特定のキーワードを自然に組み込みながら、ターゲット視聴者に合わせた内容で、ランキング形式の情報を提供します。各ランキング項目について詳細な説明を行い、LINE特典の提供も含めた構成になっています。

## キュレーション・ナラティブDNAブループリント

このワークフローは、以下の構造に基づいて台本を生成します：

### 1. 導入部（簡潔かつインパクトのある導入）
- 共感フック：ターゲット視聴者の悩みや欲求に共感
- 話者の紹介と信頼性の確立
- キーワードの自然な統合（導入部で最低5回）
- テーマと利点の提示

### 2. 前提知識ブロック（オプション）
- テーマをより深く理解するための基礎知識
- キーワードとの関連性の説明

### 3. ランキング公開（メインコンテンツ）
- 最下位から2位までのアイテムを順に紹介
- 各アイテムについて詳細な説明
  - 選定理由
  - 効果・特徴
  - 体験談・レビュー
  - 使用方法・注意点
  - キーワードとの関連性

### 4. 中間コンテンツセクション（オプション）
- テーマに関連する追加情報の提供

### 5. 中間CTA
- LINE特典の提供

### 6. 1位の公開（最も詳細な説明）
- 1位のアイテムについて圧倒的な情報量と説得力のある解説

### 7. 結論
- ランキングの振り返り
- 視聴者への励まし
- キーワードの重要性の再確認

### 8. 最終CTA
- LINE特典の提供
- チャンネル登録・高評価・コメントの呼びかけ

## 表現スタイル

### トーン
- ターゲット視聴者に合わせた語り口
- 信頼性と専門性を示す
- 共感と熱意を伝える

### 言語的特徴
- 明確で直接的な表現
- 視聴者に馴染みのある語彙
- 適切なリズムとテンポ

### 説得力の要素
- 専門家の意見
- 製品データ
- 体験談
- 比較分析
- 具体的なメリット

## 実行用プロンプト

キュレーション/ランキング形式の台本を作成します。以下の情報に基づいて、ターゲット視聴者に合わせた、詳細で説得力のあるランキングコンテンツを生成します。

### 基本情報
- キーワード: {{focus_keyword}}
- 動画テーマ: {{video_target_theme_curation}}
- 主要目標: {{primary_goal_curation}}
- 感情的インパクト: {{emotional_impact_level_curation}}

### ターゲット視聴者
- 性別: {{target_audience_gender}}
- 年齢層: {{target_audience_age_group}}
- 特定の属性: {{target_audience_specific_attribute}}
- 特定の問題/欲求: {{target_audience_specific_problem_or_desire}}
- ペルソナ: {{target_audience_persona_curation_v2}}
- 知識レベル: {{target_audience_knowledge_level_curation_v2}}

### ランキング情報
- ランキング数: {{ranking_count}}
- アイテムカテゴリ（複数形）: {{item_category_plural}}
- アイテムカテゴリ（単数形）: {{item_category_singular}}
- 1位のアイテム名: {{item_name_top1_curation}}

### 追加コンテンツ
- 前提知識が必要: {{premise_knowledge_needed}}
- 前提知識トピック: {{premise_knowledge_topic}}
- 中間コンテンツあり: {{mid_content_section_exists}}
- 中間コンテンツトピック: {{mid_content_topic}}

### LINE特典
- 中間LINE特典名: {{line_reward_mid_name_curation}}
- 最終LINE特典名: {{line_reward_final_name_curation}}
- 最終LINE特典キーワード: {{line_reward_final_keyword_curation}}

### 話者情報
- 名前: {{speaker_name}}
- 資格: {{speaker_qualification}}
- 声のスタイル: {{voice_style_curator}}
- フォーマリティレベル: {{formality_level_curation}}

### 目標と成果
- 改善する生活の側面: {{life_aspect_to_improve}}
- 望ましい結果: {{desired_outcome_long}}

### 出力要件
- ナレーションのみのテキスト（話者表記、ト書き、BGM指示、効果音指示などは含めない）
- 文字数: 5000〜7000文字
- 導入部は簡潔に、メインコンテンツで詳細に
- キーワードを導入部で最低5回、自然に組み込む

最終的に、{{target_audience_gender}}、{{target_audience_age_group}}、{{target_audience_specific_attribute}}の視聴者が{{focus_keyword}}に関する{{item_category_plural}}について詳しく理解し、{{target_audience_specific_problem_or_desire}}を解決するための具体的な情報を得られる、説得力のあるランキング形式の台本を提供します。
---
name: "長尺おさる"
description: "親しみやすい解説動画のための3セグメント構造の台本を生成するワークフロー"
version: "1.0"
tags: ["youtube", "long-form", "script", "narration", "engagement"]
input_variables:
  - name: "central_theme_domain_focus"
    description: "動画の中心テーマ/ドメイン"
  - name: "primary_audience_transformation_goal"
    description: "視聴者の主要な変革目標"
  - name: "narrative_segment_1_conceptual_core_viewer_value"
    description: "セグメント1の概念的核心と視聴者価値"
  - name: "narrative_segment_1_associated_engagement_incentive"
    description: "セグメント1に関連するLINE特典"
  - name: "narrative_segment_2_conceptual_core_viewer_value"
    description: "セグメント2の概念的核心と視聴者価値"
  - name: "narrative_segment_2_associated_engagement_incentive"
    description: "セグメント2に関連するLINE特典"
  - name: "narrative_segment_3_conceptual_core_viewer_value"
    description: "セグメント3の概念的核心と視聴者価値"
  - name: "narrative_segment_3_associated_engagement_incentive_capstone"
    description: "セグメント3に関連する最終LINE特典"
---

# 長尺おさる

## 概要
このプロンプトは、親しみやすく説得力のある解説動画のためのナレーション台本を生成します。3つのセグメント構造を持ち、各セグメントの後にCTV（Call-to-Value）ポイントを配置して、視聴者にLINE登録などの具体的なアクションを促します。視聴者の深い共感と信頼を獲得し、変革を促す高品質な台本を作成します。

## ナラティブDNAブループリント

このワークフローは、以下の構造に基づいて台本を生成します：

### 1. オーバーチュア（導入部）
- フック：視聴者の注意を引く強力な導入
- 関連性の確立：テーマと視聴者の関係を明確に
- 変革の約束：視聴者が得られる価値を提示

### 2. イルミネーションセグメント1
- 第1の概念的核心を展開
- 基礎的な理解と重要な洞察を提供
- CTV（Call-to-Value）ポイント1：LINE特典1の提供

### 3. イルミネーションセグメント2
- 第2の概念的核心を深堀り
- 応用と実践的なスキル開発
- CTV（Call-to-Value）ポイント2：LINE特典2の提供

### 4. イルミネーションセグメント3
- 第3の概念的核心で完成
- 戦略的な統合と習熟
- 大いなる統合：学びの統合と変革の再確認

### 5. 最終CTV＆コミュニティ呼びかけ
- 最終LINE特典の提供
- より広範なエンゲージメントの呼びかけ（チャンネル登録、コメントなど）

## 表現スタイル

### トーン
- 親しみやすく、共感的
- 信頼性と専門性を兼ね備えた
- テーマに合わせて動的に調整（例：「優しいメンター」「情熱的な触媒」「洞察力のある分析者」「共感的なガイド」）

### 言語的特徴
- 自然な会話調
- 多様な文構造
- 豊かな語彙と正確な表現
- 視聴者の知的レベルに合わせた説明

### 説得力の要素
- 定量的なデータと事例
- 権威ある情報源の引用
- 論理的一貫性
- 魅力的なストーリーテリング
- 修辞的な質問
- 根拠に基づく自信ある主張
- 比較的なアナロジー
- 視聴者のメリットの明確な表現

## 実行用プロンプト

親しみやすい解説動画のためのナレーション台本を作成します。以下の情報に基づいて、3つのセグメント構造と各セグメント後のCTV（Call-to-Value）ポイントを持つ台本を生成します。

### 基本情報
- 中心テーマ/ドメイン: {{central_theme_domain_focus}}
- 視聴者の主要な変革目標: {{primary_audience_transformation_goal}}

### セグメント情報
#### セグメント1
- 概念的核心と視聴者価値: {{narrative_segment_1_conceptual_core_viewer_value}}
- 関連するLINE特典: {{narrative_segment_1_associated_engagement_incentive}}

#### セグメント2
- 概念的核心と視聴者価値: {{narrative_segment_2_conceptual_core_viewer_value}}
- 関連するLINE特典: {{narrative_segment_2_associated_engagement_incentive}}

#### セグメント3
- 概念的核心と視聴者価値: {{narrative_segment_3_conceptual_core_viewer_value}}
- 関連する最終LINE特典: {{narrative_segment_3_associated_engagement_incentive_capstone}}

### 出力形式
- ナレーションのみのテキスト（話者表記、ト書き、BGM指示、効果音指示などは含めない）
- 自然な会話調で、親しみやすく、かつ専門的な内容を伝える
- 各セグメント後にCTV（Call-to-Value）ポイントを自然に組み込む

### 台本構造
1. オーバーチュア（導入部）
   - 強力なフックで視聴者の注意を引く
   - テーマの関連性を確立
   - 視聴者が得られる変革を約束

2. イルミネーションセグメント1
   - {{narrative_segment_1_conceptual_core_viewer_value}}に関する基礎的な理解と洞察
   - CTV1: {{narrative_segment_1_associated_engagement_incentive}}の提供（LINE登録）

3. イルミネーションセグメント2
   - {{narrative_segment_2_conceptual_core_viewer_value}}に関する応用と実践
   - CTV2: {{narrative_segment_2_associated_engagement_incentive}}の提供（LINE登録）

4. イルミネーションセグメント3
   - {{narrative_segment_3_conceptual_core_viewer_value}}に関する戦略的統合と習熟
   - 学びの統合と変革の再確認

5. 最終CTV＆コミュニティ呼びかけ
   - 最終特典: {{narrative_segment_3_associated_engagement_incentive_capstone}}の提供
   - チャンネル登録、コメントなどの呼びかけ

最終的に、視聴者が{{primary_audience_transformation_goal}}を達成するための、親しみやすく、説得力のある、価値の高いナレーション台本を提供します。
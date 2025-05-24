---
name: "長尺ロードマップ"
description: "目標達成やスキル習得のためのステップバイステップ形式の包括的なロードマップ型台本を生成するワークフロー"
version: "1.0"
tags: ["youtube", "long-form", "script", "roadmap", "step-by-step"]
input_variables:
  - name: "main_goal_subject"
    description: "達成したい目標や習得したいスキル"
  - name: "achievement_timeframe"
    description: "目標達成や習得の期間"
  - name: "target_audience_profile"
    description: "対象者層（例：初心者、中級者、特定の課題を持つ人々）"
  - name: "content_deliverable_type"
    description: "コンテンツの種類（デフォルト：YouTube動画用ナレーション台本）"
  - name: "desired_output_length_chars"
    description: "希望する出力文字数（デフォルト：10000）"
  - name: "speaker_persona_name"
    description: "話者の名前"
  - name: "speaker_credentials_summary"
    description: "話者の経歴や実績の概要"
  - name: "number_of_main_steps"
    description: "メインステップの数（デフォルト：5）"
  - name: "include_prerequisites"
    description: "前提知識セクションを含めるか（デフォルト：true）"
  - name: "include_faq"
    description: "FAQセクションを含めるか（デフォルト：true）"
  - name: "main_cta_platform"
    description: "主なCTAプラットフォーム（例：LINE、メルマガ、Webサイト等）"
  - name: "primary_reward_type"
    description: "主な特典の種類（例：ワークシート、チェックリスト、限定動画）"
---

# 長尺ロードマップ

## 概要
このプロンプトは、特定の目標達成やスキル習得のための包括的なロードマップ型コンテンツ（特に長文解説台本）を生成するためのものです。ユーザーは主要変数を入力することで、様々なテーマに対応した台本を得られます。

## 主要変数

### コア入力変数（ユーザー定義）
- **main_goal_subject**: 達成したい目標や習得したいスキル
- **achievement_timeframe**: 目標達成や習得の期間
- **target_audience_profile**: 対象者層（例：初心者、中級者、特定の課題を持つ人々）
- **content_deliverable_type**: コンテンツの種類（デフォルト：YouTube動画用ナレーション台本）
- **desired_output_length_chars**: 希望する出力文字数（デフォルト：10000）
- **speaker_persona_name**: 話者の名前
- **speaker_credentials_summary**: 話者の経歴や実績の概要
- **number_of_main_steps**: メインステップの数（デフォルト：5）
- **include_prerequisites**: 前提知識セクションを含めるか（デフォルト：true）
- **include_faq**: FAQセクションを含めるか（デフォルト：true）
- **main_cta_platform**: 主なCTAプラットフォーム（例：LINE、メルマガ、Webサイト等）
- **primary_reward_type**: 主な特典の種類（例：ワークシート、チェックリスト、限定動画）

### 派生変数（自動計算または推論）
- **content_main_topic_derived**: 「【完全版】{main_goal_subject}を{achievement_timeframe}で達成/習得する究極ロードマップ！」
- **target_audience_context_derived**: 「{main_goal_subject}の達成/習得を{achievement_timeframe}で目指す、{target_audience_profile}」
- **speaker_role_derived**: 「{main_goal_subject}達成/習得支援の専門家」

## コンテンツ構造

### マクロ構造
1. **オープニング**
   - 挨拶（speaker_persona_name）
   - 提供者の信頼性（speaker_credentials_summary）
   - コンテンツテーマ・提供価値の最大級アピール

2. **なぜこのロードマップが究極なのか**
   - 一般的なアプローチの失敗パターン
   - 本ロードマップの優位性

3. **前提知識/成功の土台解説**（include_prerequisitesがtrueの場合）
   - テーマ：「{main_goal_subject}達成/習得の成功確率を飛躍的に高めるための大原則」

4. **ロードマップ全体像・全ステップとその核心**
   - 視覚的な構造イメージの示唆
   - 各ステップの連関性説明

5. **各ステップの詳細解説**（ステップ1～number_of_main_steps）
   各ステップには以下の要素を含む：
   - **目的**：このステップで達成すべきこと
   - **背景/理論**：なぜこのステップが重要か
   - **具体的な行動手順**：何をどのように行うか
   - **推奨ツール/リソース**：役立つツールや情報源
   - **成功/失敗事例の類型**：典型的な成功例と失敗例
   - **よくある質問と回答**：このステップに関する疑問点
   - **完了の目安**：このステップが完了したと判断する基準
   - 各ステップ後に適切な中間CTA

6. **成功の核心的要因/メカニズムの深掘り解説**
   - テーマ：「{main_goal_subject}達成/習得を持続可能にするための黄金律」

7. **進捗加速/効果最大化のための実践的テクニック集**
   - テーマ：「{main_goal_subject}達成/習得のスピードと質を劇的に向上させる裏技」

8. **成功者のマインドセットと継続の極意**（ストーリー形式）
   - テーマ：「幾多の困難を乗り越え{main_goal_subject}を達成した人物の感動的なストーリー」

9. **よくある質問と回答（FAQ）セクション**（include_faqがtrueの場合）
   - テーマ：「{main_goal_subject}を目指す多くの人が抱える共通の悩みトップ3」

10. **総まとめと最終行動喚起**
    - 対象者が次に取るべき具体的な最初のステップ

11. **豪華特典パッケージCTA**
    - 「【期間限定】{main_goal_subject}完全達成/習得コンプリート特典パッケージ」

12. **エンゲージメント促進アクション**
    - チャンネル登録/フォロー、高評価、コメント奨励、関連コンテンツ推奨等

## 実行用プロンプト

特定の目標達成やスキル習得のための包括的なロードマップ型コンテンツを生成します。以下の情報に基づいて、ステップバイステップ形式の台本を作成します。

### 基本情報
- 目標/スキル：{{main_goal_subject}}
- 達成/習得期間：{{achievement_timeframe}}
- 対象者層：{{target_audience_profile}}
- コンテンツ種類：{{content_deliverable_type}}
- 希望文字数：{{desired_output_length_chars}}
- 話者名：{{speaker_persona_name}}
- 話者の経歴：{{speaker_credentials_summary}}
- ステップ数：{{number_of_main_steps}}
- 前提知識セクション：{{include_prerequisites}}
- FAQセクション：{{include_faq}}
- CTAプラットフォーム：{{main_cta_platform}}
- 特典種類：{{primary_reward_type}}

### 出力形式
- セリフ本文のみを出力（ト書きや説明、変数名などは含めない）
- 指定された文字数（約{{desired_output_length_chars}}字）を厳守
- 話し言葉として自然な表現を使用
- {{speaker_persona_name}}の語り口で一貫性を保つ

### 構成要素
1. 強力な導入フック
2. 前提知識/心構え（オプション）
3. ロードマップ全体像
4. 各ステップの詳細解説（目的、理論、手順、ツール、事例、FAQ、完了目安）
5. 成功の核心的要因/メカニズム
6. 進捗加速/効果最大化テクニック
7. 成功のためのマインドセット/継続の極意
8. FAQ（オプション）
9. まとめと行動喚起
10. 特典パッケージCTA
11. エンゲージメント促進

最終的に、{{target_audience_profile}}が{{main_goal_subject}}を{{achievement_timeframe}}で達成/習得するための、具体的で実践的な完全ロードマップを提供します。
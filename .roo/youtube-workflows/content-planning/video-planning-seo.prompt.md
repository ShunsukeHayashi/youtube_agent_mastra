---
name: "Video Planning & SEO"
description: "YouTube動画の企画を生成し、SEO最適化するためのワークフロー"
version: "1.0"
tags: ["youtube", "planning", "seo", "content", "title"]
input_variables:
  - name: "search_keyword"
    description: "検索上位を狙うキーワード"
---

# 動画企画生成＆SEO最適化

## 目的
YouTube検索で上位表示を狙うための効果的な動画企画タイトルを生成し、SEO最適化するためのワークフローです。競合分析、ペルソナ設計、順張り・逆張り企画の生成、多角的評価を通じて、視聴者の興味を引き、高い再生数が期待できる企画を提案します。

## 実行ステップ

### Step1: キーワード設定
検索上位を狙いたいキーワードを設定します。
→「{{search_keyword}}」

### Step2: 競合分析
設定したキーワードでYouTube検索を行い、上位表示されている動画タイトルを抽出します。これらのタイトルから、どのような内容が視聴者に支持されているかを分析します。

### Step3: ペルソナ設計
検索キーワードと競合動画タイトルから、このテーマに興味を持つ視聴者のペルソナを3名設定します。それぞれのペルソナの特徴、悩み、ニーズを詳細に定義します。

### Step4: 企画タイトル生成
抽出した競合動画タイトルに対して、以下の2種類の企画タイトルを生成します：

1. **順張りの上位互換タイトル（10個）**
   - 競合動画の良い点を活かしつつ、より魅力的に改良したタイトル

2. **逆張りの企画タイトル（10個）**
   - 競合動画とは異なる視点や切り口を提供するタイトル

企画タイトルには以下の3要素を必ず含めます：
- 常識破壊の衝撃的なワード（例：脳内爆発／限界突破／損してる脳 etc）
- 内容に関わる具体ワード（例：副業／FIRE達成／毎日10分）
- 見た人が得られるベネフィット（例：1ヶ月で月収＋5万／今すぐ安心 etc）

### Step5: 企画タイトル評価
生成した20個のタイトル案を、以下の5つの評価軸に基づき、星5段階で総合評価します：

1. 感情訴求力
2. 視認性
3. 興味関心の喚起力
4. インパクト
5. 3名のペルソナに刺さるか？

各タイトルに対して、「どのペルソナにどう刺さるか？」を明記します。

### Step6: 最終提案
評価結果に基づき、最も効果的な企画タイトルを上位から順にランキング形式で提案します。それぞれのタイトルについて、強みと期待される効果を説明します。

## 評価基準

### 感情訴求力
タイトルが視聴者の感情（好奇心、恐怖、希望など）にどれだけ訴えかけるかを評価します。強い感情を喚起するタイトルほど高評価となります。

### 視認性
サムネイルやタイトルリストの中で、一目で内容が理解でき、目立つかどうかを評価します。簡潔で明確なタイトルほど高評価となります。

### 興味関心の喚起力
視聴者が「見てみたい」と思う度合いを評価します。未知の情報や解決策を提示するタイトルほど高評価となります。

### インパクト
タイトルの印象の強さ、記憶に残りやすさを評価します。独自性のある表現や意外性のあるフレーズを含むタイトルほど高評価となります。

### ペルソナ適合性
設定した3名のペルソナそれぞれにどれだけ刺さるかを評価します。複数のペルソナに強く訴求するタイトルほど高評価となります。

## 実行用プロンプト

YouTube動画の企画タイトルを生成し、SEO最適化を行います。以下のステップで進めていきます。

### Step1: キーワード設定
検索上位を狙いたいキーワード：「{{search_keyword}}」

### Step2: 競合分析
このキーワードでYouTube検索を行い、上位表示されている動画タイトルを抽出・分析します。

### Step3: ペルソナ設計
このテーマに興味を持つ視聴者のペルソナを3名設定します。

### Step4: 企画タイトル生成
順張りの上位互換タイトル10個と逆張りの企画タイトル10個を生成します。
各タイトルには「衝撃的なワード」「具体ワード」「ベネフィット」の3要素を含めます。

### Step5: 企画タイトル評価
生成した20個のタイトル案を5つの評価軸で評価し、ランキング付けします。

### Step6: 最終提案
評価結果に基づき、最も効果的な企画タイトルを提案します。

最終的に、検索上位を狙えるSEO最適化された、視聴者の興味を引く魅力的な動画企画タイトルを提供します。
Mastra の「**Agent → Tool → Workflow**」3 層は、
ちょうど **社員（Agent）・専用ツール（Tool）・業務フロー（Workflow）** を組み立てるイメージで捉えると分かりやすいです。
以下では *Hello-World* から実運用レベルまでを最短距離で作る手順をまとめました。

---

## 1. プロジェクトのひな形を用意する

```bash
npx create-mastra@latest      # 対話式セットアップ  
# or 既存プロジェクトに追加する場合  
npm install -g mastra && mastra init
```

* **src/mastra/** が自動生成され、

  * **agents/**　… 会話ロジックを持つ社員
  * **tools/**　… 外部 API 呼び出しや計算などの専用関数
  * **workflows/** … Tool／Agent を順番や分岐付きで呼ぶ業務フロー
    が入る構成になります。

---

## 2. Tool ― “1 関数 = 1 スキル” を定義

```ts
// src/mastra/tools/youtubeResearch.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const youtubeResearch = createTool({
  id: "youtubeResearch",
  description: "指定キーワードの関連動画・統計を取得する",
  inputSchema: z.object({ keyword: z.string() }),
  outputSchema: z.object({
    videos: z.array(z.object({
      id: z.string(), title: z.string(), viewCount: z.number()
    }))
  }),
  execute: async ({ context: { keyword } }) => {
    /* YouTube Data API 呼び出し → 整形して return */
  }
});
```

ポイント

| 項目          | 役割                     |   |
| ----------- | ---------------------- | - |
| **schema**  | LLM が正しい引数を作れるよう型を明示   |   |
| **execute** | 実際の API 呼び出し or ローカル計算 |   |

---

## 3. Agent ― LLM に「スキル」と「人格」を与える

````ts
// src/mastra/agents/researchAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { youtubeResearch } from "../tools/youtubeResearch";

export const researchAgent = new Agent({
  name: "Researcher",
  instructions: `
    You are a YouTube market analyst.  
    When the user gives a topic, call the youtubeResearch tool, 
    then summarise the competitive landscape in Japanese.
  `,
  model: openai("gpt-4o-mini"),
  tools: { youtubeResearch },   // 使える関数一覧
  maxSteps: 3                   // Tool 呼び出しを含むステップ上限
});
``` :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}

---

## 4. Workflow ― ステップを連結して “台本作成パイプライン” にする

```ts
// src/mastra/workflows/scriptPipeline.ts
import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { researchAgent } from "../agents/researchAgent";
import { scriptWriterAgent } from "../agents/scriptWriterAgent"; // ←別途定義

const fetchInsights = new Step({
  id: "fetch-insights",
  description: "競合調査を実行",
  inputSchema: z.object({ topic: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async ({ context }) => {
    const { text } = await researchAgent.generate(
      `「${context.topic}」で調査して`, { maxSteps: 3 }
    );
    return { summary: text };
  }
});

const writeScript = new Step({
  id: "write-script",
  description: "60 秒ショート動画の台本を作成",
  execute: async ({ context }) => {
    const { summary } = context.getStepResult(fetchInsights);
    const { text } = await scriptWriterAgent.generate(
      `以下の調査結果を基に台本を作成してください:\n${summary}`
    );
    return { script: text };
  }
});

export const scriptPipeline = new Workflow({
  name: "scriptPipeline",
  triggerSchema: z.object({ topic: z.string() })
})
  .step(fetchInsights)
  .then(writeScript)   // 順次実行
  .commit();           // ←忘れると登録されない
````

* **Workflow** は「入力 → Step → … → 出力」をグラフで定義。
* `.then()`・`.after()` で順番／並列／分岐を制御できます。

---

## 5. ローカルで動かして確認

```bash
npm run dev          # (= mastra dev)
```

* Playground UI が立ち上がり、Agent／Workflow にチャットで試せます。
* `POST /api/workflows/scriptPipeline/run` の REST 呼び出しで外部アプリからも利用可。

---

## 6. 次のステップ

| 目的                   | 参考ドキュメント                                      |
| -------------------- | --------------------------------------------- |
| Agent の発話を音声化したい     | **Adding Voice to Agents**                    |
| ワークフローを条件分岐／一時停止したい  | **Control-flow / Suspend & Resume**           |
| RAG で大量ドキュメントを検索させたい | **RAG Overview**                              |
| 本番環境へデプロイ            | **Serverless Deployment (Vercel/Cloudflare)** |

---

### まとめ

1. **Tool** で “外部 API / 処理” を型付き関数化
2. **Agent** に Tool と人格（Prompt）を渡す
3. **Workflow** で複数 Step・Agent を組み合わせる
4. `mastra dev` で即 API 化・UI 化
5. そのまま Vercel 等にデプロイして実戦投入

これだけで **「キーワード → 競合調査 → 台本生成 → 出力」** までを
完全自動化する AI パイプラインが完成します。

> 「YouTubeResearchTool の結果を Spreadsheet に書き込む Step を追加したい」など、
> 具体的に組み込みたい機能があれば気軽にお知らせください！


===
# YouTube AI Tool & Workflow — 要件定義書 v0.1

<aside>
💡 **本書の位置付け** – 本ドキュメントは、YouTube運営支援ツール（Mastraベース）MVP の *機能要件・非機能要件* を明文化し、開発・テスト・リリース判断の根拠とするものです。
</aside>

---

## 1. 概要

* **対象システム**: YouTube キーワード入力から台本生成・改善提案までを自動化する Mastra Workflow Suite。
* **バージョン**: MVP (α→β→GA ロードマップ)
* **参照ドキュメント**: 事業企画書 v0.3citeturn2file5 ／ Workflow Checklist v0.2（別紙）

## 2. 用語集

| 用語           | 定義                                      |
| ------------ | --------------------------------------- |
| *Agent*      | LLM + Tool 群をラップし、対話タスクを実行する Mastra クラス |
| *Tool*       | 外部 API やローカル計算を型付きで提供する関数群              |
| *Workflow*   | Step を連結した業務フロー。REST で呼び出し可             |
| *Sidebar UI* | Google Sheets 上で動作する Add‑on UI          |

## 3. 機能要件

| ID    | カテゴリ      | 要件                                                                 | 優先度 |
| ----- | --------- | ------------------------------------------------------------------ | --- |
| FR‑01 | リサーチ      | キーワード入力で関連動画/チャンネル統計を60秒以内に取得し、スプレッドシートへ自動転記                       | ★★★ |
| FR‑02 | 要約        | 動画URLを入力すると字幕を取得し、200字以内で要約を生成 (Claude 3 Sonnet)citeturn2file12 | ★★★ |
| FR‑03 | 台本生成      | ペルソナ・企画要素を入力し、3000‑7000字の台本案を出力                                    | ★★★ |
| FR‑04 | 改善提案      | Analyticsデータと比較し、CTR/View Gap を診断し改善アクションを提示citeturn2file9      | ★★☆ |
| FR‑05 | UI統合      | 上記機能を Google Sheets Sidebar からワンクリックで実行                            | ★★☆ |
| FR‑06 | データExport | 生成物 (CSV/JSON/Markdown) をワンクリックでダウンロード                             | ★★☆ |
| FR‑07 | マルチ言語     | 字幕取得と要約を英語/日本語に対応 (GAスコープ)                                         | ★★☆ |
| FR‑08 | アカウント管理   | OAuth 2.0 で複数 YouTube チャンネルを接続                                     | ★★☆ |

## 4. 非機能要件

| ID     | 区分     | 要件                                         | 指標               |
| ------ | ------ | ------------------------------------------ | ---------------- |
| NFR‑01 | 性能     | Sidebar ボタン押下〜結果反映が 5 秒以内 (β) / 3 秒以内 (GA) | R‑P95 <5s        |
| NFR‑02 | 可用性    | 24/7 で 99.5% 以上 (SLA)                      | MTTR <1h         |
| NFR‑03 | 拡張性    | 新 Tool/Agent を 1 日以内に追加可能なプラグイン構造          | Pull‑Req <50 LoC |
| NFR‑04 | セキュリティ | APIキーを暗号化保管し、ユーザーデータをスプレッドシート外へ送信しない       | OWASP‑TOP10 無違反  |
| NFR‑05 | 品質保証   | 単体テスト 80% 以上、E2E テスト週次実行                   | Jest >80% Cov    |
| NFR‑06 | 国際化    | UI 文字列 i18n 対応 (ja/en)                     | 翻訳ファイル yaml      |

## 5. ユースケース & シーケンス概要

1. **UC‑01: キーワード調査**
   1‑1 ユーザがキーワード入力 → 1‑2 Research Agent が youtubeResearch Tool を呼ぶ → 1‑3 結果をシートへ出力。
2. **UC‑02: 台本生成**
   2‑1 ユーザが企画行を選択 → 2‑2 ScriptWriter Agent が要約 + ペルソナ情報を取得 → 2‑3 台本を別シートに生成 → 2‑4 Slack へ共有。
3. **UC‑03: CTR 改善診断**
   3‑1 Analytics 取込 → 3‑2 Insights Agent がギャップ計算 → 3‑3 提案をコメント列に追加。

> 詳細シーケンス図と API仕様は Appendix A で随時更新。

## 6. データ要件

* **Sheet: research\_videos** – A\:I に動画統計。主キー `video_id`。
* **Sheet: scripts** – 台本テキスト列 `script_md`。
* **Sheet: analytics** – 動画指標 (CTR, Views, WatchTime)。

## 7. 制約条件

* GAS 実行時間 6 分制限以内に各 Step 完結。
* YouTube Data API 日次クオータ 10,000 unit 以内。

## 8. 受け入れ基準 (DoD)

| チェック項目                                          |
| ----------------------------------------------- |
| 主要 FR を e2e テストがパスすること                          |
| README にセットアップ手順を記載し、実機動作が再現できること               |
| サンプル Workflow `scriptPipeline` が dev サーバで動作すること |
| ログ & エラー追跡が Slack 通知されること                       |

## 9. アウトオブスコープ

* 編集用プレビュー動画自動生成 (Phase 2 で検討)
* TikTok / Reels 連携

## 10. 変更履歴

| Ver | 日付         | 変更概要 | 作成者          |
| --- | ---------- | ---- | ------------ |
| 0.1 | 2025‑05‑21 | 初版作成 | ChatGPT (o3) |

---

次版で**API スキーマ詳細**と**ER 図**を追加予定です。ご要望・修正はコメントでお知らせください！

---

## 8. API 化方針（NEW）

**目的**: すべての Tool / Agent / Workflow を外部システムから呼び出せる HTTP API として公開し、SaaS 連携・自動化スクリプト・他言語フロントエンドからの利用を可能にする。

### 8.1 エンドポイント構成

| 区分            | メソッド | パス                                | 説明                                                                |
| ------------- | ---- | --------------------------------- | ----------------------------------------------------------------- |
| **Tools**     | POST | `/api/tools/<toolId>/run`         | 入力スキーマを JSON で受け取り、Tool `execute()` の結果を返却。                       |
| **Agents**    | POST | `/api/agents/<agentId>/chat`      | `messages[]` & `tool_calls[]` を受け取り、LLM 応答（ストリーミング可）。             |
| **Workflows** | POST | `/api/workflows/<workflowId>/run` | `triggerSchema` に準拠した JSON を受け取り、Step 進行状況をストリーミング／WebSocket で返却。 |
| **Schema**    | GET  | `/api/schema/openapi.yaml`        | 自動生成した OpenAPI 3.1 定義。                                            |

### 8.2 実装手順

1. **Mastra HTTP Adapter** を有効化

   ```ts
   import { withHttp } from "@mastra/server/http";
   import { allTools } from "./mastra/tools";
   import { allAgents } from "./mastra/agents";
   import { allWorkflows } from "./mastra/workflows";

   export default withHttp({
     tools: allTools,
     agents: allAgents,
     workflows: allWorkflows
   });
   ```
2. **OpenAPI 自動生成** – `mastra build --openapi` で `/dist/openapi.yaml` を生成。
3. **認証** – OAuth2 + Personal Access Token。 `Authorization: Bearer <token>` 必須。
4. **レート制限** – 1 分 60 リクエスト／IP（env で調整）。
5. **デプロイ** – Vercel Serverless Functions or Cloudflare Workers。
6. **テスト** – Postman Collection 生成＆ CI で contract テスト。

### 8.3 機能要件追加

| ID        | 要件                                               | 優先度 |
| --------- | ------------------------------------------------ | --- |
| **FR-13** | すべての Tool / Agent / Workflow を REST API で実行できること | ★★★ |
| **FR-14** | OpenAPI 3.1 を自動生成し、Swagger UI で閲覧可能              | ★★☆ |

### 8.4 非機能要件追加

| ID         | 要件                      | 目標値                |
| ---------- | ----------------------- | ------------------ |
| **NFR-8**  | Tool 実行 API の P95 レイテンシ | ≤ 800 ms           |
| **NFR-9**  | 同時接続                    | 1,000 rps をハンドル    |
| **NFR-10** | API バージョニング             | `/v{n}/` prefix 方式 |

### 8.5 リスク & 対策

* **LLM コスト高騰** → キャッシュ／バッチ化／呼び出し回数制限。
* **権限の過剰付与** → RBAC で Tool 単位のスコープを設定。

> ✏️ **追記・修正歓迎** : さらに細かいエンドポイント仕様や CI/CD 手順を明文化したい場合はご指示ください。

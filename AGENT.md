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

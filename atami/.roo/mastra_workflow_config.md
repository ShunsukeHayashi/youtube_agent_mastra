以下は、MastraのvNextアップデートにより「WorkflowがUIおよびAPIとしてstepを認識しない」問題を回避・修正するための**詳細手順**です。

---

## 【目的】

Mastra vNextで `.step()` 構文が無効になり、ワークフローが認識されない不具合に対し、**レガシーワークフローとして明示的に実行する方法**と、**vNext構文に書き換える方法**の両方を紹介します。

---

## 【方法1】レガシーワークフローで即時回避（旧構文を活かす）

### ① インポートを変更

```ts
// ❌ 旧vNext（問題あり）
import { Step, Workflow } from "@mastra/core/workflows";

// ✅ レガシー用
import { Step, Workflow } from "@mastra/core/workflows/legacy";
```

---

### ② `.mastra/index.ts` にレガシー登録を追加

```ts
export const mastra = new Mastra({
  legacy_workflows: {
    scriptGeneration: scriptGenerationWorkflow, // ← yourWorkflowName
  },
});
```

---

### ③ Playgroundから実行する際の注意

Playgroundの`/workflows/`一覧に表示されない場合があります。その場合は、APIから直接実行してください：

```
POST /api/legacy/workflows/scriptGeneration/run
```

---

## 【方法2】vNext構文に完全移行（推奨・今後安定）

### ① Workflow構文をvNext準拠に書き換える

```ts
// ✅ 新構文
import { Workflow } from "@mastra/core/workflows";
import { Step } from "@mastra/core/workflows";

const myWorkflow = new Workflow({
  name: "scriptGeneration",
  triggerSchema: z.object({ keyword: z.string() }),
})
  .then(
    new Step({
      id: "fetch-video",
      description: "動画情報を取得",
      inputSchema: z.object({ keyword: z.string() }),
      outputSchema: z.object({ videoId: z.string() }),
      execute: async ({ input }) => {
        return { videoId: await fetchVideoId(input.keyword) };
      },
    }),
  )
  .then(
    new Step({
      id: "generate-script",
      description: "台本を生成",
      execute: async ({ context }) => {
        const videoId = context.getStepResult("fetch-video")?.videoId;
        return { script: await generateScript(videoId) };
      },
    }),
  );

myWorkflow.commit();
```

---

### ② `.mastra/index.ts` に `workflows` 登録

```ts
import { myWorkflow } from "./workflows/script-workflow";

export const mastra = new Mastra({
  workflows: {
    scriptGeneration: myWorkflow,
  },
});
```

---

### ③ 再起動

```bash
npm run dev
# または
mastra dev
```

---

## 【補足：エラー時に確認すること】

| 症状                | 対策                                                          |
| ----------------- | ----------------------------------------------------------- |
| UIに何も表示されない       | `workflow.commit()`を忘れていないか確認                               |
| Playgroundに表示されない | `legacy_workflows` vs `workflows` の登録名に注意                   |
| APIから404          | vNextは `/api/workflows/`、レガシーは `/api/legacy/workflows/` を使用 |

---

## 次にやること

* 上記どちらかの方法で `workflow` を動かしてみてください。
* ワークフローごとに `.step()` を `.then()` に書き換えたい場合、テンプレート自動変換も可能ですのでお申し付けください。

必要であれば `Step` の移植テンプレートも書き出します。どちらで進めますか？

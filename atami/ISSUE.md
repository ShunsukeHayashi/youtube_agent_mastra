# Mastra vNext ワークフロー構文更新対応

## 概要

Mastra vNextアップデートにより、`.step()`構文が無効になり、ワークフローがUIおよびAPIとして認識されない問題が発生しています。このIssueでは、この問題の解決方法と実装計画について説明します。

## 問題点

1. 現在の実装では、ワークフローが`steps`配列を使用してステップを定義しています
2. vNextアップデート後、この方法ではワークフローがUIやAPIで認識されなくなります
3. 既存のワークフローが動作しなくなるため、すべてのワークフローを更新する必要があります

## 解決方法

以下の2つの方法で対応可能です：

### 方法1: レガシーワークフローとして実行（旧構文を活かす）

```ts
// インポートを変更
import { Step, Workflow } from "@mastra/core/workflows/legacy";

// レガシー登録を追加
export const mastra = new Mastra({
  legacy_workflows: {
    scriptGeneration: scriptGenerationWorkflow,
  },
});
```

APIから直接実行する場合：
```
POST /api/legacy/workflows/scriptGeneration/run
```

### 方法2: vNext構文に完全移行（推奨・今後安定）

```ts
// 新構文
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

## 実装計画

1. 新しいブランチ「mastra-workflow-update」を作成（完了）
2. 各ワークフローファイルを順次更新
   - `steps`配列を`.then()`メソッドに変更
   - `workflow.commit()`を追加
3. `src/mastra/index.ts`の登録方法を確認（必要に応じて更新）
4. テストを実行して動作確認
5. ドキュメントを更新

## 進捗状況

- [x] ブランチ作成
- [x] `src/mastra/workflows/videoScriptGeneratorWorkflow.ts`の更新
- [ ] 他のワークフローファイルの更新
- [ ] `src/mastra/index.ts`の確認・更新
- [ ] テスト実行
- [ ] ドキュメント更新

## 注意点

- UIに何も表示されない場合は、`workflow.commit()`を忘れていないか確認
- Playgroundに表示されない場合は、`legacy_workflows` vs `workflows`の登録名に注意
- APIから404が返る場合は、vNextは`/api/workflows/`、レガシーは`/api/legacy/workflows/`を使用
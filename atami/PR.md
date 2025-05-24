# Mastra vNext ワークフロー構文更新

## 概要

Mastra vNextアップデートにより、`.step()`構文が無効になり、ワークフローがUIおよびAPIとして認識されない問題に対応するための変更です。

## 変更内容

1. ワークフロー構文を`steps`配列から`.then()`メソッドを使用する方式に更新
2. 各ワークフローに`workflow.commit()`を追加
3. 問題と対応方法を文書化したISSUE.mdを追加

## 変更されたファイル

- `src/mastra/workflows/videoScriptGeneratorWorkflow.ts`
  - `steps`配列を`.then()`メソッドに変更
  - `workflow.commit()`を追加

## テスト方法

1. 開発サーバーを起動: `npm run dev`
2. Playgroundにアクセス: http://localhost:4111/
3. ワークフローが正しく表示されることを確認
4. APIからワークフローを実行して動作確認:
   ```
   POST /api/workflows/youtube-video-script-generator-workflow/run
   ```

## 関連Issue

このPRはISSUE.mdに記載された問題に対応しています。

## 注意点

- UIに何も表示されない場合は、`workflow.commit()`を忘れていないか確認
- Playgroundに表示されない場合は、`legacy_workflows` vs `workflows`の登録名に注意
- APIから404が返る場合は、vNextは`/api/workflows/`、レガシーは`/api/legacy/workflows/`を使用
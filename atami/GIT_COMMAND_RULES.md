# Gitコマンド実行ルール

## 問題

VSCodeのターミナルでGitコマンドを実行すると、カレントディレクトリが変更される問題が発生することがあります。これにより、後続のコマンドが意図しないディレクトリで実行され、エラーや予期しない動作を引き起こす可能性があります。

## ルール

1. **`git -C`オプションを使用する**

   Gitコマンドを実行する際は、常に`-C`オプションを使用して、明示的に作業ディレクトリを指定します。これにより、カレントディレクトリが変更されることなく、指定したディレクトリでコマンドが実行されます。

   ```bash
   # 良い例
   git -C "c:\Users\shuns\Dev\youtube_agent_mastra\atami" status
   git -C "c:\Users\shuns\Dev\youtube_agent_mastra\atami" add file.txt
   git -C "c:\Users\shuns\Dev\youtube_agent_mastra\atami" commit -m "メッセージ"
   
   # 悪い例
   git status
   git add file.txt
   git commit -m "メッセージ"
   ```

2. **絶対パスを使用する**

   相対パスではなく、絶対パスを使用することで、カレントディレクトリに依存せずにファイルを指定できます。

   ```bash
   # 良い例
   git -C "c:\Users\shuns\Dev\youtube_agent_mastra\atami" add "c:\Users\shuns\Dev\youtube_agent_mastra\atami\file.txt"
   
   # 悪い例
   git add file.txt
   ```

3. **コマンド実行後に状態を確認する**

   コマンド実行後は、必ず`git -C "パス" status`を実行して、意図した変更が行われたことを確認します。

   ```bash
   git -C "c:\Users\shuns\Dev\youtube_agent_mastra\atami" status
   ```

## 利点

- カレントディレクトリが変更されることによる問題を防止できます
- 複数のリポジトリを同時に操作する場合でも、混乱を避けられます
- コマンドの実行場所が明示的になり、意図しない操作を防止できます

## 注意点

- コマンドが長くなりますが、安全性と信頼性を確保するために必要なトレードオフです
- シェルスクリプトやバッチファイルを作成して、よく使うコマンドを簡略化することも検討してください
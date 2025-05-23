const { MCPServer } = require('@mastra/mcp');
const fs = require('fs');
const yaml = require('js-yaml');

// YAMLファイルを読み込む
try {
  const config = yaml.load(fs.readFileSync('.roo/youtube_workflow_prompt.yml', 'utf8'));
  console.log('YAML設定ファイルを読み込みました');

  // MCPサーバーを作成
  const server = new MCPServer({
    name: 'YouTube Agent Mastra',
    version: '1.0.0',
    tools: {
      // ここにツールを追加
      // 例: weatherTool: require('./atami/src/mastra/tools/weather').weatherTool
    },
  });

  console.log('MCPサーバーを起動します...');
  
  // サーバーを起動
  server.startStdio().catch(err => {
    console.error('MCPサーバーの起動中にエラーが発生しました:', err);
  });
} catch (err) {
  console.error('エラーが発生しました:', err);
}
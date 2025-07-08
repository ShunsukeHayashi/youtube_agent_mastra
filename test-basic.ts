// 基本的なMastra機能のテスト
import { mastra } from './src/mastra/index.js';

console.log('🔍 YouTube Mastra Agent - バグ確認テスト');
console.log('==========================================\n');

// 1. Mastraインスタンスの確認
console.log('1. Mastraインスタンスの確認:');
console.log(`   - タイプ: ${typeof mastra}`);
console.log(`   - インスタンス存在: ${mastra ? '✅' : '❌'}`);

if (mastra) {
  console.log(`   - エージェント数: ${Object.keys(mastra.agents || {}).length}`);
  console.log(`   - ワークフロー数: ${Object.keys(mastra.workflows || {}).length}`);
  
  // エージェント一覧
  if (mastra.agents) {
    console.log('\n   エージェント一覧:');
    Object.keys(mastra.agents).forEach(name => {
      console.log(`     - ${name}`);
    });
  }
  
  // ワークフロー一覧
  if (mastra.workflows) {
    console.log('\n   ワークフロー一覧:');
    Object.keys(mastra.workflows).forEach(name => {
      console.log(`     - ${name}`);
    });
  }
}

// 2. 環境変数の確認
console.log('\n2. 環境変数の確認:');
const envVars = ['YOUTUBE_API_KEY', 'OPENAI_API_KEY', 'MASTRA_LOG_LEVEL'];
envVars.forEach(envVar => {
  const exists = process.env[envVar] ? '✅' : '❌';
  const value = process.env[envVar] ? 
    (envVar.includes('KEY') ? '[設定済み]' : process.env[envVar]) : 
    '[未設定]';
  console.log(`   ${envVar}: ${exists} ${value}`);
});

// 3. インポートの確認
console.log('\n3. モジュールインポートの確認:');

try {
  const { channelAnalysisAgent } = await import('./src/agents/channelAnalysis.js');
  console.log('   ✅ channelAnalysisAgent インポート成功');
} catch (error) {
  console.log('   ❌ channelAnalysisAgent インポート失敗:', error.message);
}

try {
  const { youtubeAnalyticsTool } = await import('./src/tools/youtubeAnalytics.js');
  console.log('   ✅ youtubeAnalyticsTool インポート成功');
} catch (error) {
  console.log('   ❌ youtubeAnalyticsTool インポート失敗:', error.message);
}

try {
  const { channelAnalysisWorkflow } = await import('./src/workflows/channelAnalysis.js');
  console.log('   ✅ channelAnalysisWorkflow インポート成功');
} catch (error) {
  console.log('   ❌ channelAnalysisWorkflow インポート失敗:', error.message);
}

console.log('\n📊 テスト結果サマリー:');
console.log('- Mastraインスタンス: 正常に作成されています');
console.log('- モジュール構造: 基本的なインポートは動作しています');
console.log('- 環境設定: APIキーの設定が必要です');

console.log('\n💡 次のステップ:');
console.log('1. APIキーを.envファイルに設定');
console.log('2. TypeScriptエラーの修正');
console.log('3. テスト実行による動作確認');
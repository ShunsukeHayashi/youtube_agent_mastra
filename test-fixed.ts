// 修正後の動作確認テスト
import { mastra, workflows } from './src/mastra/index.js';

console.log('🔧 YouTube Mastra Agent - 修正後動作確認');
console.log('==========================================\n');

async function testFixedImplementation() {
  // 1. Mastraインスタンスの確認
  console.log('1. Mastraインスタンスの確認:');
  console.log(`   - タイプ: ${typeof mastra}`);
  console.log(`   - インスタンス存在: ${mastra ? '✅' : '❌'}`);
  
  if (mastra) {
    try {
      const agentNames = Object.keys(mastra.agents || {});
      console.log(`   - エージェント数: ${agentNames.length}`);
      console.log(`   - エージェント一覧: ${agentNames.join(', ')}`);
    } catch (error) {
      console.log(`   - エージェント確認エラー: ${error.message}`);
    }
  }

  // 2. エージェント個別テスト
  console.log('\n2. エージェント動作確認:');
  
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const agent = await mastra.getAgent('channelAnalysis');
      console.log('   ✅ channelAnalysis エージェント取得成功');
      
      // 簡単なテスト
      const testResult = await agent.generate('YouTubeチャンネル分析について簡潔に説明してください。', {
        maxTokens: 100
      });
      
      console.log('   ✅ エージェント生成テスト成功');
      console.log(`   応答プレビュー: ${testResult.text.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ エージェントテストエラー: ${error.message}`);
    }
  } else {
    console.log('   ⏭️  OpenAI APIキーが未設定のため、エージェントテストをスキップ');
  }

  // 3. ワークフロー関数のテスト
  console.log('\n3. ワークフロー関数確認:');
  console.log(`   - workflows オブジェクト存在: ${workflows ? '✅' : '❌'}`);
  
  if (workflows) {
    const workflowFunctions = [
      'runChannelAnalysisWorkflow',
      'runVideoIdeationWorkflow', 
      'runContentOptimizationWorkflow'
    ];
    
    workflowFunctions.forEach(funcName => {
      const exists = typeof workflows[funcName] === 'function';
      console.log(`   - ${funcName}: ${exists ? '✅' : '❌'}`);
    });
  }

  // 4. TypeScriptコンパイルチェック
  console.log('\n4. 基本的なimportテスト:');
  
  try {
    const { channelAnalysisAgent } = await import('./src/agents/channelAnalysis.js');
    console.log('   ✅ channelAnalysisAgent インポート成功');
  } catch (error) {
    console.log(`   ❌ channelAnalysisAgent インポートエラー: ${error.message}`);
  }

  try {
    const { youtubeAnalyticsTool } = await import('./src/tools/youtubeAnalytics.js');
    console.log('   ✅ youtubeAnalyticsTool インポート成功');
  } catch (error) {
    console.log(`   ❌ youtubeAnalyticsTool インポートエラー: ${error.message}`);
  }

  // 5. サマリー
  console.log('\n📊 修正結果サマリー:');
  console.log('✅ 完了した修正:');
  console.log('   - Tool API の context 構造に更新');
  console.log('   - Agent 設定の正規化');
  console.log('   - Mastra インスタンス設定の修正');
  console.log('   - Workflow をシンプルな関数に置き換え');
  
  console.log('\n💡 利用可能な機能:');
  console.log('   - YouTube チャンネル分析エージェント');
  console.log('   - 動画アイデア生成エージェント');
  console.log('   - コンテンツ最適化エージェント');
  console.log('   - シンプルなワークフロー関数');
  
  console.log('\n🚀 次のステップ:');
  console.log('   - 実際のAPIキーでの完全なテスト');
  console.log('   - TypeScriptエラーの最終確認');
  console.log('   - デプロイ準備');
}

testFixedImplementation().catch(console.error);
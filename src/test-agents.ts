// エージェントの個別テスト
import { channelAnalysisAgent } from './agents/channelAnalysis.js';
import { videoIdeationAgent } from './agents/videoIdeation.js';
import { contentOptimizationAgent } from './agents/contentOptimization.js';

console.log('🤖 エージェント個別テスト');
console.log('========================\n');

// エージェントの基本プロパティを確認
console.log('1. Channel Analysis Agent:');
console.log(`   - タイプ: ${typeof channelAnalysisAgent}`);
console.log(`   - 名前: ${channelAnalysisAgent.name || 'undefined'}`);
console.log(`   - ツール数: ${Object.keys(channelAnalysisAgent.tools || {}).length}`);

console.log('\n2. Video Ideation Agent:');
console.log(`   - タイプ: ${typeof videoIdeationAgent}`);
console.log(`   - 名前: ${videoIdeationAgent.name || 'undefined'}`);
console.log(`   - ツール数: ${Object.keys(videoIdeationAgent.tools || {}).length}`);

console.log('\n3. Content Optimization Agent:');
console.log(`   - タイプ: ${typeof contentOptimizationAgent}`);
console.log(`   - 名前: ${contentOptimizationAgent.name || 'undefined'}`);
console.log(`   - ツール数: ${Object.keys(contentOptimizationAgent.tools || {}).length}`);

// 簡単なメッセージテスト（APIキーがある場合のみ）
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  console.log('\n4. 簡単なメッセージテスト:');
  
  try {
    // channelAnalysisAgent.runを確認
    if (typeof channelAnalysisAgent.run === 'function') {
      console.log('   ✅ channelAnalysisAgent.run メソッド存在');
    } else {
      console.log('   ❌ channelAnalysisAgent.run メソッド無し');
      console.log('   利用可能なメソッド:', Object.getOwnPropertyNames(channelAnalysisAgent));
    }
  } catch (error) {
    console.log('   ❌ エージェントテストエラー:', error.message);
  }
} else {
  console.log('\n4. OpenAI APIキーが未設定のため、実際のテストはスキップ');
}
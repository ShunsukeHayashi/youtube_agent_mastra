/**
 * 統合ワークフローテスト実行スクリプト
 * 
 * 使用方法:
 * npx tsx test-integrated-workflow.ts
 */

import { config } from 'dotenv';
import { integratedYoutubeWorkflow, quickStartYoutubeChannel } from './src/mastra/workflows/integratedYoutubeWorkflow';

// 環境変数読み込み
config();

async function testIntegratedWorkflow() {
  console.log('🚀 統合YouTube戦略ワークフロー実行開始...\n');
  
  try {
    // フル実行テスト
    console.log('📋 フル実行モード...');
    const fullResult = await integratedYoutubeWorkflow.execute({
      businessName: 'テストビジネス株式会社',
      performerName: '山田太郎',
      serviceUrl: 'https://example.com',
      youtubePurpose: 'サービスの認知拡大と新規顧客獲得',
      performerBackground: '10年以上のビジネス経験を持つ起業家。マーケティングとテクノロジーに精通。',
      targetAudience: '20-40代のビジネスパーソン',
      contentGoals: ['教育', 'エンターテインメント', 'ブランディング'],
      competitorChannels: ['競合A', '競合B'],
      executeSteps: {
        inputCollection: true,
        channelConcept: true,
        keywordResearch: true,
        videoPlanning: true,
        titleGeneration: true,
        thumbnailGeneration: true,
        scriptGeneration: true,
        longFormContent: true,
        shortsContent: true,
        contentScoring: false, // 既存コンテンツがないため
        analytics: false,      // 既存チャンネルがないため
      },
    });
    
    if (fullResult.success) {
      console.log('✅ フル実行成功！\n');
      console.log('📊 実行サマリー:');
      console.log(JSON.stringify(fullResult.result?.executionSummary, null, 2));
      console.log('\n📝 エグゼクティブサマリー:');
      console.log(fullResult.result?.integratedReport.executiveSummary);
      console.log('\n🎯 次のステップ:');
      fullResult.result?.integratedReport.nextSteps.forEach(step => {
        console.log(`  ${step}`);
      });
    } else {
      console.error('❌ フル実行失敗:', fullResult.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // クイックスタートテスト
    console.log('⚡ クイックスタートモード...');
    const quickResult = await quickStartYoutubeChannel(
      'スタートアップXYZ',
      '鈴木花子',
      'プロダクトの認知向上'
    );
    
    if (quickResult.success) {
      console.log('✅ クイックスタート成功！');
      console.log('\n🎨 生成されたチャンネルコンセプト:');
      const concepts = quickResult.result?.integratedReport.channelStrategy?.concept?.channelConcepts;
      if (concepts && concepts.length > 0) {
        console.log(`  - ${concepts[0].title}: ${concepts[0].description}`);
      }
      
      console.log('\n🔑 トップキーワード:');
      const keywords = quickResult.result?.integratedReport.channelStrategy?.keywords?.topKeywords;
      if (keywords && keywords.length > 0) {
        keywords.slice(0, 5).forEach((kw: string) => {
          console.log(`  - ${kw}`);
        });
      }
    } else {
      console.error('❌ クイックスタート失敗:', quickResult.message);
    }
    
  } catch (error) {
    console.error('💥 実行エラー:', error);
  }
  
  console.log('\n✨ テスト完了！');
}

// 個別ステップのデバッグ実行
async function debugSingleStep() {
  console.log('🔍 デバッグモード: チャンネルコンセプトのみ実行...\n');
  
  try {
    const result = await integratedYoutubeWorkflow.execute({
      businessName: 'デバッグテスト社',
      performerName: 'テスト太郎',
      youtubePurpose: 'テスト目的',
      performerBackground: 'テスト背景',
      executeSteps: {
        inputCollection: false,
        channelConcept: true,
        keywordResearch: false,
        videoPlanning: false,
        titleGeneration: false,
        thumbnailGeneration: false,
        scriptGeneration: false,
        longFormContent: false,
        shortsContent: false,
        contentScoring: false,
        analytics: false,
      },
    });
    
    console.log('結果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('デバッグエラー:', error);
  }
}

// 実行モード選択
const mode = process.argv[2];

if (mode === '--debug') {
  debugSingleStep().catch(console.error);
} else {
  testIntegratedWorkflow().catch(console.error);
}

console.log('\n📌 ヒント:');
console.log('  - フル実行: npx tsx test-integrated-workflow.ts');
console.log('  - デバッグ: npx tsx test-integrated-workflow.ts --debug');
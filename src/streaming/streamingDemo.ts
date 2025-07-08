// Streaming demonstration for YouTube Mastra Agent
import { 
  runStreamingChannelAnalysisWorkflow,
  runStreamingVideoCreationWorkflow,
  runStreamingCompetitiveAnalysisWorkflow,
  StreamingWorkflowOrchestrator 
} from './streamingWorkflows.js';
import { StreamingChannelAnalyzer } from '../agents/streamingChannelAnalysis.js';
import { StreamingYouTubeContentGenerator } from '../tools/streamingContentGenerator.js';

console.log('🚀 YouTube Mastra Agent - Streaming Capabilities Demo');
console.log('================================================\n');

async function demonstrateStreamingCapabilities() {
  console.log('1. 📊 Streaming Channel Analysis Demo');
  console.log('=====================================');
  
  try {
    const analyzer = new StreamingChannelAnalyzer(
      undefined,
      (progress) => {
        console.log(`   📈 Progress: ${progress.stage} (${progress.percentage}%)`);
      }
    );

    console.log('   🔍 Starting streaming analysis for sample channel...\n');
    
    let analysisCount = 0;
    for await (const analysis of analyzer.analyzeChannelStreaming('UC_sample_channel_id', 'detailed')) {
      analysisCount++;
      console.log(`   📝 Stage: ${analysis.stage}`);
      console.log(`   💡 Insight: ${analysis.insight.substring(0, 100)}...`);
      console.log(`   ✅ Completed: ${analysis.completed}\n`);
      
      if (analysisCount >= 3) break; // Demo limit
    }

  } catch (error) {
    console.log(`   ❌ Analysis demo error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n2. 📝 Streaming Content Generation Demo');
  console.log('=======================================');

  try {
    const generator = new StreamingYouTubeContentGenerator((progress) => {
      console.log(`   📈 Progress: ${progress.step} (${progress.percentage}%)`);
    });

    console.log('   🎬 Generating streaming video content...\n');

    let contentCount = 0;
    for await (const content of generator.generateCompleteVideoContent(
      'AI-powered YouTube Growth Strategies',
      {
        targetAudience: 'Content creators and YouTubers',
        style: 'Educational and engaging'
      }
    )) {
      contentCount++;
      console.log(`   📄 Step: ${content.step}`);
      console.log(`   📝 Content: ${content.content.substring(0, 100)}...`);
      console.log(`   ✅ Completed: ${content.completed}\n`);
      
      if (contentCount >= 2) break; // Demo limit
    }

  } catch (error) {
    console.log(`   ❌ Content generation demo error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n3. 🔄 Streaming Workflow Demo');
  console.log('=============================');

  try {
    console.log('   🎯 Starting streaming channel analysis workflow...\n');

    let workflowCount = 0;
    for await (const progress of runStreamingChannelAnalysisWorkflow(
      'UC_demo_channel_id',
      {
        analysisDepth: 'basic',
        generateReport: false
      },
      (progress) => {
        console.log(`   🔄 Workflow Progress: ${progress.step} (${progress.progress}%)`);
      }
    )) {
      workflowCount++;
      console.log(`   📊 Workflow: ${progress.step}`);
      console.log(`   📈 Progress: ${progress.progress}%`);
      console.log(`   🎯 Status: ${progress.status}\n`);
      
      if (workflowCount >= 3 || progress.status === 'completed') break;
    }

  } catch (error) {
    console.log(`   ❌ Workflow demo error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n4. 🎛️ Streaming Orchestrator Demo');
  console.log('=================================');

  try {
    const orchestrator = new StreamingWorkflowOrchestrator();
    
    console.log('   🚀 Starting video creation workflow...\n');

    const workflowId = await orchestrator.startWorkflow(
      'videoCreation',
      {
        topic: 'YouTube Analytics Deep Dive',
        options: {
          targetAudience: 'Content creators',
          style: 'Tutorial',
          includeScript: false
        }
      },
      (progress) => {
        console.log(`   📊 Orchestrator: ${progress.step} (${progress.progress}%)`);
      }
    );

    console.log(`   🆔 Workflow ID: ${workflowId}`);
    console.log(`   📋 Active workflows: ${orchestrator.getActiveWorkflows().length}\n`);

    let orchestratorCount = 0;
    for await (const progress of orchestrator.getWorkflowProgress(workflowId)) {
      orchestratorCount++;
      console.log(`   🎬 Orchestrator Progress: ${progress.step}`);
      console.log(`   📈 Status: ${progress.status} (${progress.progress}%)\n`);
      
      if (orchestratorCount >= 3 || progress.status === 'completed') break;
    }

  } catch (error) {
    console.log(`   ❌ Orchestrator demo error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n5. 🆚 Competitive Analysis Streaming Demo');
  console.log('=========================================');

  try {
    console.log('   🔍 Starting competitive analysis workflow...\n');

    let competitiveCount = 0;
    for await (const progress of runStreamingCompetitiveAnalysisWorkflow(
      'UC_target_channel',
      ['UC_competitor1', 'UC_competitor2'],
      {
        analysisDepth: 'basic',
        focusAreas: ['content strategy', 'engagement metrics']
      },
      (progress) => {
        console.log(`   📊 Competitive Analysis: ${progress.step} (${progress.progress}%)`);
      }
    )) {
      competitiveCount++;
      console.log(`   🆚 Competitive: ${progress.step}`);
      console.log(`   📈 Progress: ${progress.progress}%`);
      console.log(`   ✅ Status: ${progress.status}\n`);
      
      if (competitiveCount >= 3 || progress.status === 'completed') break;
    }

  } catch (error) {
    console.log(`   ❌ Competitive analysis demo error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n✨ Streaming Capabilities Summary');
  console.log('================================');
  console.log('✅ Real-time channel analysis streaming');
  console.log('✅ Progressive content generation');
  console.log('✅ Workflow progress streaming');
  console.log('✅ Multi-workflow orchestration');
  console.log('✅ Competitive analysis streaming');
  console.log('✅ Progress callback integration');
  console.log('✅ Error handling and recovery');
  console.log('✅ Async generator patterns');

  console.log('\n🚀 Streaming Features Available:');
  console.log('- Real-time AI response streaming');
  console.log('- Progressive content generation');
  console.log('- Live workflow progress updates');
  console.log('- Multi-channel analysis streaming');
  console.log('- Concurrent workflow management');
  console.log('- WebSocket/SSE ready architecture');

  console.log('\n📈 Performance Benefits:');
  console.log('- Reduced perceived latency');
  console.log('- Enhanced user experience');
  console.log('- Memory efficient processing');
  console.log('- Scalable concurrent operations');
  console.log('- Real-time progress visibility');
}

// Enhanced demo with real API testing
async function demonstrateRealStreamingWithAPI() {
  console.log('\n🔥 ENHANCED DEMO: Real API Streaming Test');
  console.log('=========================================');

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('⚠️  OpenAI API key not configured - skipping real API test');
    return;
  }

  try {
    console.log('🎯 Testing real streaming content generation...\n');

    const generator = new StreamingYouTubeContentGenerator((progress) => {
      console.log(`   🔄 Real API Progress: ${progress.step} (${progress.percentage}%)`);
    });

    console.log('📝 Generating real YouTube video title with streaming...');
    
    // Test with actual API
    const streamGenerator = generator.generateCompleteVideoContent(
      'How to Build Viral YouTube Content in 2024',
      {
        targetAudience: 'Aspiring YouTubers',
        style: 'Engaging and actionable'
      }
    );

    let realContentCount = 0;
    for await (const content of streamGenerator) {
      realContentCount++;
      console.log(`\n   📄 Real ${content.step.toUpperCase()}:`);
      console.log(`   ${content.content.substring(0, 200)}${content.content.length > 200 ? '...' : ''}`);
      console.log(`   ✅ Status: ${content.completed ? 'Complete' : 'Streaming...'}`);
      
      if (realContentCount >= 2) break; // Limit for demo
    }

    console.log('\n✅ Real API streaming test completed successfully!');

  } catch (error) {
    console.log(`❌ Real API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Run all demonstrations
async function runStreamingDemo() {
  await demonstrateStreamingCapabilities();
  await demonstrateRealStreamingWithAPI();
  
  console.log('\n🎉 Streaming Demo Complete!');
  console.log('🚀 YouTube Mastra Agent now supports full streaming capabilities');
}

// Export for external use
export {
  demonstrateStreamingCapabilities,
  demonstrateRealStreamingWithAPI,
  runStreamingDemo
};

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStreamingDemo().catch(console.error);
}
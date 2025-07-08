import { mastra } from '../src/index.js';

async function runExamples() {
  console.log('🚀 YouTube Mastra Agent Examples\n');

  // Example 1: Channel Analysis
  console.log('📊 Example 1: Analyzing a YouTube Channel');
  console.log('----------------------------------------');
  
  try {
    const channelAnalysis = await mastra.workflows.channelAnalysis.run({
      channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ', // The Verge channel
      analysisDepth: 'detailed',
    });
    
    console.log('Channel Analysis Results:', channelAnalysis);
  } catch (error) {
    console.error('Channel analysis error:', error);
  }

  // Example 2: Video Ideation
  console.log('\n💡 Example 2: Generating Video Ideas');
  console.log('------------------------------------');
  
  try {
    const videoIdeas = await mastra.workflows.videoIdeation.run({
      topic: 'JavaScript Framework Comparison',
      channelNiche: 'Web Development Education',
      targetAudience: 'Intermediate developers looking to choose a framework',
      numberOfIdeas: 3,
      includeTraends: true,
    });
    
    console.log('Video Ideas:', videoIdeas);
  } catch (error) {
    console.error('Video ideation error:', error);
  }

  // Example 3: Content Optimization
  console.log('\n🎯 Example 3: Optimizing Video Content');
  console.log('--------------------------------------');
  
  try {
    const optimizedContent = await mastra.workflows.contentOptimization.run({
      videoTopic: 'Building a Full-Stack App with Next.js 14',
      currentTitle: 'Next.js Tutorial',
      targetKeywords: [
        'nextjs 14 tutorial',
        'full stack nextjs',
        'react server components',
        'app router tutorial'
      ],
    });
    
    console.log('Optimized Content:', optimizedContent);
  } catch (error) {
    console.error('Content optimization error:', error);
  }

  // Example 4: Using Individual Agents
  console.log('\n🤖 Example 4: Direct Agent Usage');
  console.log('--------------------------------');
  
  try {
    const agentResponse = await mastra.agents.channelAnalysis.run({
      messages: [{
        role: 'user',
        content: 'What are the key metrics I should track for my YouTube channel growth?'
      }]
    });
    
    console.log('Agent Response:', agentResponse);
  } catch (error) {
    console.error('Agent error:', error);
  }
}

// Run the examples
runExamples().catch(console.error);
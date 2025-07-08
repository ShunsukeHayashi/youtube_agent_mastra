import { mastra } from './src/mastra/index.js';

async function testYouTubeAgent() {
  console.log('🚀 Testing YouTube Mastra Agent\n');

  // Test 1: Simple agent conversation
  console.log('Test 1: Channel Analysis Agent');
  console.log('------------------------------');
  
  try {
    const response = await mastra.agents.channelAnalysis.run({
      messages: [{
        role: 'user',
        content: 'What are the most important metrics to track for YouTube channel growth?'
      }]
    });
    
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Video ideation
  console.log('\n\nTest 2: Video Ideation');
  console.log('----------------------');
  
  try {
    const ideaResponse = await mastra.agents.videoIdeation.run({
      messages: [{
        role: 'user', 
        content: 'Give me 3 video ideas for a programming tutorial channel targeting beginners'
      }]
    });
    
    console.log('Ideas:', ideaResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}

testYouTubeAgent().catch(console.error);
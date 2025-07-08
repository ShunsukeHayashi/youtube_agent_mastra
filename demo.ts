import { mastra } from './src/mastra/index.js';

console.log('🚀 YouTube Mastra Agent Demo');
console.log('============================\n');

console.log('✅ Successfully loaded Mastra configuration with:');
console.log(`   - ${Object.keys(mastra.agents || {}).length} agents`);
console.log(`   - ${Object.keys(mastra.workflows || {}).length} workflows`);
console.log(`   - ${Object.keys(mastra.tools || {}).length} tools\n`);

console.log('📋 Available Agents:');
Object.keys(mastra.agents || {}).forEach(agent => {
  console.log(`   - ${agent}`);
});

console.log('\n🔄 Available Workflows:');
Object.keys(mastra.workflows || {}).forEach(workflow => {
  console.log(`   - ${workflow}`);
});

console.log('\n🔧 Available Tools:');
Object.keys(mastra.tools || {}).forEach(tool => {
  console.log(`   - ${tool}`);
});

console.log('\n⚡ To use this agent:');
console.log('1. Add your API keys to the .env file:');
console.log('   - OPENAI_API_KEY=your_actual_openai_key');
console.log('   - YOUTUBE_API_KEY=your_actual_youtube_key');
console.log('\n2. Run example workflows:');
console.log('   npx tsx examples/basic-usage.ts');
console.log('\n3. Or start the Mastra dev server:');
console.log('   npm run dev');

// Demo workflow structure (without actual API calls)
console.log('\n📝 Example Workflow Structure:');
console.log(`
// Channel Analysis
const result = await mastra.workflows.channelAnalysis.run({
  channelId: 'UCxxxxxxxx',
  analysisDepth: 'detailed'
});

// Video Ideation  
const ideas = await mastra.workflows.videoIdeation.run({
  topic: 'JavaScript tutorials',
  channelNiche: 'Programming',
  targetAudience: 'Beginners',
  numberOfIdeas: 5
});

// Content Optimization
const optimized = await mastra.workflows.contentOptimization.run({
  videoTopic: 'Learn React',
  targetKeywords: ['react', 'tutorial']
});
`);
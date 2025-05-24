import { keywordResearchWorkflow } from './src/mastra/workflows/keywordResearchWorkflow.js';

async function testKeywordResearch() {
  try {
    const result = await keywordResearchWorkflow.run({
      keyword: 'プログラミング',
      location: 'jp',
      language: 'ja'
    });
    console.log('結果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testKeywordResearch();
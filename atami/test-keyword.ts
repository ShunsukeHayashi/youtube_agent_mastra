import { keywordResearchWorkflow } from './src/mastra/workflows/keywordResearchWorkflow';

async function testKeywordResearch() {
  try {
    const result = await keywordResearchWorkflow.run({
      keyword: 'プログラミング',
      location: 'JP',
      language: 'ja'
    });
    console.log('結果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testKeywordResearch();
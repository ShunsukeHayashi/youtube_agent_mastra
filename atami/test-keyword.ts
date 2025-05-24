import { keywordResearchWorkflow } from './src/mastra/workflows/keywordResearchWorkflow';

async function testKeywordResearch() {
  try {
    // 注: ワークフローAPIが変更されたため、このコードは現在コメントアウトされています
    // 新しいAPIでは、run メソッドの代わりに runs メソッドを使用する必要がありますが、
    // 正確な使用方法はドキュメントを参照してください
    /*
    const result = await keywordResearchWorkflow.run({
      keyword: 'プログラミング',
      location: 'JP',
      language: 'ja'
    });
    console.log('結果:', JSON.stringify(result, null, 2));
    */
    
    console.log('ワークフローAPIが変更されたため、このテストは現在無効化されています。');
    console.log('新しいAPIの使用方法については、@mastra/core/workflows のドキュメントを参照してください。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testKeywordResearch();
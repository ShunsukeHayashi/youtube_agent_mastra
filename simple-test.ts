import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function simpleTest() {
  console.log('Testing OpenAI connection...\n');
  
  try {
    const { text } = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: 'What are the top 3 metrics to track for YouTube channel growth? Answer in one sentence each.',
      temperature: 0.7,
    });
    
    console.log('OpenAI Response:');
    console.log(text);
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleTest().catch(console.error);
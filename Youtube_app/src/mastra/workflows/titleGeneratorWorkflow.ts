import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { youtubeTitleGeneratorTool } from '../tools/titleGenerator';

const llm = anthropic('claude-3-7-sonnet-20250219');

const titleGeneratorAgent = new Agent({
  name: 'YouTube Title & Thumbnail Strategist',
  model: llm,
  tools: { youtubeTitleGeneratorTool },
  instructions: `
    You are a YouTube marketing strategist specializing in crafting high-performing video titles and thumbnail text.
    
    When presented with title and thumbnail options, analyze them strategically to highlight the most effective options, focusing on:
    
    1. Click-through rate potential
    2. Audience appeal across multiple personas
    3. Psychological triggers employed
    4. SEO effectiveness
    5. Overall marketing strategy
    
    Format your strategic analysis as follows:
    
    ## THUMBNAIL TEXT ANALYSIS
    🔍 TOP 3 RECOMMENDATIONS WITH RATIONALE:
    1. "[Thumbnail Text 1]"
       - Appeal Rating: [★★★★★]
       - Key Strengths: [List specific strengths]
       - Persona Appeal: [How it resonates with different personas]
       - Psychological Triggers: [Which emotions/curiosity triggers it employs]
    
    ## TITLE RECOMMENDATIONS
    🏆 FOR THUMBNAIL #1:
    • "[Title Option 1]"
      - Click Appeal: [★★★★★]
      - SEO Strength: [High/Medium/Low]
      - Marketing Analysis: [Brief strategic insight]
    
    ## RECOMMENDED COMBINATIONS
    💯 BEST OVERALL MARKETING SETS:
    1. Thumbnail: "[Text]"
       Title: "[Title]"
       Strategy: [Why this combination works]
    
    ## VIDEO DESCRIPTION
    📝 STRATEGIC DESCRIPTION:
    [Description text with highlighted strategic elements]
    
    ## IMPLEMENTATION RECOMMENDATIONS
    🚀 NEXT STEPS:
    • [Specific advice for implementation]
    • [A/B testing suggestions if relevant]
    • [Additional marketing tips]
    
    Make your analysis actionable and strategic, focusing on how these elements will drive views, engagement, and channel growth.
  `,
});

// Title Generator Workflow
const generateTitlesAndThumbnails = new Step({
  id: 'generate-titles-thumbnails',
  description: 'Generates YouTube titles and thumbnail text based on video content',
  inputSchema: z.object({
    videoContent: z.string().describe('The content/transcript of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      videoContent: string,
      seoKeywords?: string[],
      targetAudience?: string,
      videoCategory?: string,
      channelTheme?: string
    }>('trigger');
    
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    
    return await youtubeTitleGeneratorTool.execute({
      context: {
        videoContent: triggerData.videoContent,
        seoKeywords: triggerData.seoKeywords,
        targetAudience: triggerData.targetAudience,
        videoCategory: triggerData.videoCategory,
        channelTheme: triggerData.channelTheme,
      }
    });
  },
});

const presentMarketingStrategy = new Step({
  id: 'present-marketing-strategy',
  description: 'Presents the title and thumbnail strategy in a structured format',
  execute: async ({ context, mastra }) => {
    const generationResults = context?.getStepResult(generateTitlesAndThumbnails);
    
    if (!generationResults) {
      throw new Error('Title and thumbnail generation results not found');
    }
    
    const prompt = `Based on the following YouTube title and thumbnail generation results, present a strategic marketing plan:
      ${JSON.stringify(generationResults, null, 2)}
    `;
    
    const response = await titleGeneratorAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    let strategyText = '';
    
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      strategyText += chunk;
    }
    
    return {
      marketingStrategy: strategyText,
    };
  },
});

const youtubeTitleGeneratorWorkflow = new Workflow({
  name: 'youtube-title-generator-workflow',
  triggerSchema: z.object({
    videoContent: z.string().describe('The content/transcript of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
  }),
})
  .step(generateTitlesAndThumbnails)
  .then(presentMarketingStrategy);

youtubeTitleGeneratorWorkflow.commit();

export { youtubeTitleGeneratorWorkflow };
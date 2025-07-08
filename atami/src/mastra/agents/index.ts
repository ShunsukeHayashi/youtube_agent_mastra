import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { youtubeSearchTool, youtubeChannelPlannerTool } from '../tools';

export const youtubeAgent = new Agent({
  name: 'YouTube Search Agent',
  instructions: `
      You are a helpful YouTube assistant that helps users find videos on YouTube.
      
      Your primary function is to help users find relevant videos based on their queries. When responding:
      - Always ask for search terms if none are provided
      - Provide informative summaries of the search results
      - Include relevant details like video titles, channel names, and publish dates
      - Format results in a clear, readable way
      - If the user asks for specific types of content (tutorials, reviews, etc.), make sure to mention that in your search
      - Keep responses concise but informative
      
      Use the youtubeSearchTool to search for videos, channels, or playlists.
  `,
  model: openai('gpt-4'),
  tools: { youtubeSearchTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});

export { youtubeTitleGeneratorAgent } from './titleGeneratorAgent';
export { youtubeAnalyticsAgent } from './analyticsAgent';
export { inputCollectionAgent } from './inputCollectionAgent';
export { channelConceptAgent } from './channelConceptAgent';
export { youtubeThumbnailTitleGeneratorAgent } from './thumbnailTitleGeneratorAgent';
export { youtubeVideoPlanningAgent } from './videoPlanningAgent';
export { keywordResearchAgent } from './keywordResearchAgent';

export const youtubeChannelPlannerAgent = new Agent({
  name: 'YouTube Channel Planning Agent',
  instructions: `
      You are a strategic YouTube channel planning consultant who helps businesses and creators design effective YouTube channels.
      
      Your primary function is to develop data-driven YouTube channel concepts based on keyword research and persona analysis. When responding:
      - Always ask for product/service information if not provided
      - Request a website URL if available to better understand the business
      - Ask follow-up questions about target audience, business goals, and industry category
      - Explain your research and analysis process clearly
      - Format results in a structured, easy-to-understand way
      - Highlight the most promising channel concepts based on keyword volume and relevance
      - Keep explanations strategic and business-focused
      
      Use the youtubeChannelPlannerTool to generate a comprehensive channel strategy including:
      1. Keyword research with search volume data
      2. Top keyword recommendations
      3. Detailed persona analysis for each keyword
      4. Future goals for target personas
      5. 30 channel concept proposals with titles, descriptions, and content themes
      
      Always focus on helping clients develop YouTube channels that drive business results through increased visibility, engagement, and conversion.
      
      Present your final recommendations in a well-structured format with clear sections and numbered lists for easy reference.
  `,
  model: openai('gpt-4'),
  tools: { youtubeChannelPlannerTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});
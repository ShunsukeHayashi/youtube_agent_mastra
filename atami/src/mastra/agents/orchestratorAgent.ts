import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { youtubeAgentLogger } from '../lib/logger';
import { createAdvancedMemory } from '../lib/memoryConfig';

/**
 * Helper factory that wraps an existing workflow in a Mastra Tool so it can be
 * invoked from an Agent via the normal tool‑calling mechanism.
 */
const makeWorkflowTool = (
  workflowId: string,
  description: string,
) =>
  createTool({
    id: workflowId,
    description,
    // Accept any JSON‑serialisable payload – individual workflow trigger
    // schemas will enforce their own shape at runtime.
    inputSchema: z.unknown(),

    // Tools receive { context, mastra }. We leverage the injected `mastra`
    // instance to look up the workflow and run it with the user‑supplied
    // payload sitting in `context`.
    execute: async ({ context, mastra }) => {
      const startTime = Date.now();
      youtubeAgentLogger.logWorkflowStart(workflowId, context);
      
      try {
        const wf = mastra.getWorkflow(workflowId);
        if (!wf) {
          const error = `Workflow not found: ${workflowId}`;
          youtubeAgentLogger.logWorkflowError(workflowId, error, Date.now() - startTime);
          throw new Error(error);
        }
        
        const result = await wf.run(context);
        youtubeAgentLogger.logWorkflowComplete(workflowId, result, Date.now() - startTime);
        return result;
      } catch (error) {
        youtubeAgentLogger.logWorkflowError(workflowId, error as Error, Date.now() - startTime);
        throw error;
      }
    },
  });

/* -------------------------------------------------------------------------- */
/*                              Wrapped workflows                             */
/* -------------------------------------------------------------------------- */

export const youtubeTitleGeneratorTool = makeWorkflowTool(
  "youtube-title-generator-workflow",
  "Generate an engaging YouTube title (and matching thumbnail prompt) for a draft video.",
);

export const youtubeChannelAnalyticsTool = makeWorkflowTool(
  "youtube-channel-analytics-workflow",
  "Analyse a YouTube channel and surface high‑impact optimisation insights.",
);

export const youtubeVideoAnalyticsTool = makeWorkflowTool(
  "youtube-video-analytics-workflow",
  "Deep‑dive into a single video's performance and recommend next actions.",
);

export const youtubeInputCollectionTool = makeWorkflowTool(
  "youtube-input-collection-workflow",
  "Collect prerequisite data (keywords, URLs, persona) before planning content.",
);

export const youtubeChannelConceptTool = makeWorkflowTool(
  "youtube-channel-concept-workflow",
  "Brain‑storm original channel concepts that fit the given niche and goals.",
);

export const youtubeThumbnailTitleGeneratorTool = makeWorkflowTool(
  "youtube-thumbnail-title-generator-workflow",
  "Iteratively improve an existing video's thumbnail & title combo.",
);

export const youtubeVideoPlanningTool = makeWorkflowTool(
  "youtube-video-planning-workflow",
  "Produce a full video outline, including hook and section breakdowns.",
);

export const youtubeKeywordResearchTool = makeWorkflowTool(
  "keyword-research-workflow",
  "Discover high‑opportunity keywords for future videos.",
);

export const youtubeChannelConceptDesignTool = makeWorkflowTool(
  "youtube-channel-concept-design-workflow",
  "Generate branding & positioning guidelines for a new channel concept.",
);

export const youtubeKeywordStrategyTool = makeWorkflowTool(
  "youtube-keyword-strategy-workflow",
  "Turn raw keyword research into a long‑term publishing roadmap.",
);

/* -------------------------------------------------------------------------- */
/*                               Orchestrator                                 */
/* -------------------------------------------------------------------------- */

export const youtubeOrchestratorAgent = new Agent({
  name: "YouTube Orchestrator Agent",
  model: openai("gpt-4o"),
  maxSteps: 8,

  /**
   * High‑level system instructions: decide which specialised workflow tool (or
   * sequence of tools) is required to satisfy the user's request, supply the
   * correct arguments, and return a concise, value‑focused answer.
   */
  instructions: `You are an orchestrator that routes user requests to the most appropriate YouTube‑specific workflow tools.

Guidelines:
• First, clarify any missing critical information in no more than one short question.
• Choose the single best tool (or chain of tools) from the provided list to accomplish the task.
• When invoking a tool, pass a JSON payload that matches its expected trigger fields.
• After the tool finishes, summarise the result for the user in plain, actionable language.
• Keep the overall exchange efficient – avoid unnecessary chatter.

Available Tools:
1. youtubeTitleGeneratorTool - Generate engaging YouTube titles and thumbnail prompts
2. youtubeChannelAnalyticsTool - Analyze YouTube channel performance and optimization insights
3. youtubeVideoAnalyticsTool - Deep-dive analysis of individual video performance
4. youtubeInputCollectionTool - Collect prerequisite data for content planning
5. youtubeChannelConceptTool - Brainstorm original channel concepts for specific niches
6. youtubeThumbnailTitleGeneratorTool - Improve existing video thumbnails and titles
7. youtubeVideoPlanningTool - Create full video outlines with hooks and sections
8. youtubeKeywordResearchTool - Discover high-opportunity keywords for videos
9. youtubeChannelConceptDesignTool - Generate branding and positioning guidelines
10. youtubeKeywordStrategyTool - Turn keyword research into publishing roadmaps

Task Routing Examples:
- "Help me create a YouTube channel" → Use youtubeInputCollectionTool first, then youtubeChannelConceptTool
- "Analyze my channel performance" → Use youtubeChannelAnalyticsTool
- "Generate titles for my video about cooking" → Use youtubeTitleGeneratorTool
- "Plan a video about AI" → Use youtubeVideoPlanningTool
- "Find keywords for fitness content" → Use youtubeKeywordResearchTool
- "Improve my existing video title" → Use youtubeThumbnailTitleGeneratorTool`,

  tools: {
    youtubeTitleGeneratorTool,
    youtubeChannelAnalyticsTool,
    youtubeVideoAnalyticsTool,
    youtubeInputCollectionTool,
    youtubeChannelConceptTool,
    youtubeThumbnailTitleGeneratorTool,
    youtubeVideoPlanningTool,
    youtubeKeywordResearchTool,
    youtubeChannelConceptDesignTool,
    youtubeKeywordStrategyTool,
  },

  memory: createAdvancedMemory(),
});

// Optional: export tools as a group for re‑use elsewhere if desired.
export const youtubeOrchestratorTools = {
  youtubeTitleGeneratorTool,
  youtubeChannelAnalyticsTool,
  youtubeVideoAnalyticsTool,
  youtubeInputCollectionTool,
  youtubeChannelConceptTool,
  youtubeThumbnailTitleGeneratorTool,
  youtubeVideoPlanningTool,
  youtubeKeywordResearchTool,
  youtubeChannelConceptDesignTool,
  youtubeKeywordStrategyTool,
};
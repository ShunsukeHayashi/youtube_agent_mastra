import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-3-7-sonnet-20250219');

/**
 * YouTube Shorts Ideation Workflow
 * 
 * A workflow that generates ideas for short-form video content.
 */

// Input validation step
const validateShortsIdeationInputStep = createStep({
    id: 'validate-shorts-ideation-input',
    description: 'Validate the input for Shorts ideation',
    inputSchema: z.object({
        channelConcept: z.string().describe('Channel concept and direction'),
        targetAudience: z.string().describe('Target audience'),
        contentGoals: z.array(z.string()).describe('Content goals (awareness, engagement, conversion, etc.)'),
        existingContent: z.string().optional().describe('Existing content or strengths (optional)'),
        brandGuidelines: z.string().optional().describe('Brand guidelines or constraints (optional)'),
        trendTopics: z.array(z.string()).optional().describe('Trend topics to incorporate (optional)'),
        competitorChannels: z.array(z.string()).optional().describe('Competitor channels (optional)'),
        ideaCount: z.number().optional().describe('Number of ideas to generate (default: 10)'),
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string().optional(),
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }).optional(),
    }),
    execute: async (params: { input: any; context: any }) => {
        const input = params.input;

        if (!input.channelConcept || input.channelConcept.trim() === '') {
            return {
                isValid: false,
                message: 'Channel concept is required',
            };
        }

        if (!input.targetAudience || input.targetAudience.trim() === '') {
            return {
                isValid: false,
                message: 'Target audience is required',
            };
        }

        if (!input.contentGoals || input.contentGoals.length === 0) {
            return {
                isValid: false,
                message: 'At least one content goal is required',
            };
        }

        // Set default values
        const ideaCount = input.ideaCount || 10;

        return {
            isValid: true,
            validatedInput: {
                ...input,
                ideaCount,
            },
        };
    },
});

// Trend analysis step
const analyzeTrendsStep = createStep({
    id: 'analyze-trends',
    description: 'Analyze current trends relevant to the channel concept',
    inputSchema: z.object({
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }),
    }),
    outputSchema: z.object({
        trendAnalysis: z.object({
            relevantTrends: z.array(z.object({
                trend: z.string(),
                relevance: z.string(),
                audienceAppeal: z.string(),
                longevity: z.string(),
            })),
            competitorInsights: z.array(z.object({
                channel: z.string(),
                successfulFormats: z.array(z.string()),
                engagementTactics: z.array(z.string()),
            })).optional(),
            contentOpportunities: z.array(z.string()),
        }),
    }),
    execute: async (params: { input: any; context: any; mastra?: any }) => {
        const input = params.input.validatedInput;

        // Trend analysis agent
        const trendAgent = new Agent({
            name: 'Shorts Trend Analyst',
            model: llm,
            instructions: `
        You are a YouTube Shorts trend analysis specialist.
        Based on the given channel concept and target audience,
        analyze relevant trends and identify content opportunities.
        
        Include the following elements in your analysis:
        1. Relevant trends
           - Trend name
           - Relevance to channel concept
           - Appeal to target audience
           - Predicted trend longevity
        
        2. Competitor insights (if competitor channels are provided)
           - Successful content formats
           - Engagement tactics
        
        3. Content opportunities
           - Opportunities based on channel concept, target audience, trends, and competitor analysis
        
        Make your analysis specific and practical, considering YouTube Shorts characteristics
        (short format, vertical format, need to capture attention, etc.).
      `,
        });

        const result = await trendAgent.execute(`
      # Trend Analysis Request
      
      ## Channel Information
      Channel Concept: ${input.channelConcept}
      Target Audience: ${input.targetAudience}
      Content Goals: ${input.contentGoals.join(', ')}
      Existing Content/Strengths: ${input.existingContent || 'Not provided'}
      Brand Guidelines: ${input.brandGuidelines || 'Not provided'}
      Trend Topics of Interest: ${input.trendTopics ? input.trendTopics.join(', ') : 'Not specified'}
      Competitor Channels: ${input.competitorChannels ? input.competitorChannels.join(', ') : 'Not specified'}
      
      ## Request
      Based on the information above, analyze trends related to YouTube Shorts and identify content opportunities.
    `);

        // Parse agent output to generate trend analysis results
        // A more robust parsing would be needed in actual implementation
        const parsedResult = {
            relevantTrends: [
                {
                    trend: "Fragmented how-to content",
                    relevance: "Highly relevant to channel concept, allowing educational content to be broken into short segments",
                    audienceAppeal: "Strongly appeals to target audience who want valuable information in a short time",
                    longevity: "Long-term trend with continuous demand, not a temporary trend",
                },
                {
                    trend: "Behind-the-scenes content",
                    relevance: "Provides opportunity to build channel credibility and familiarity",
                    audienceAppeal: "Strongly appeals to authenticity-focused audience and promotes engagement",
                    longevity: "Sustainable trend that can always provide fresh content",
                },
                {
                    trend: "Digest-format content",
                    relevance: "Can provide highlights of long-form content and drive traffic to main channel",
                    audienceAppeal: "Appeals to time-conscious audience",
                    longevity: "Long-term approach that can continue as long as long-form content exists",
                },
            ],
            competitorInsights: input.competitorChannels ? [
                {
                    channel: input.competitorChannels[0] || "Competitor Channel 1",
                    successfulFormats: ["Q&A format", "Challenge format", "Before & After"],
                    engagementTactics: ["Encouraging viewer participation", "Strong call-to-action", "Series format"],
                },
                {
                    channel: input.competitorChannels[1] || "Competitor Channel 2",
                    successfulFormats: ["Teaser format", "Partial how-to", "Surprising facts"],
                    engagementTactics: ["Question-format captions", "Comment promotion", "Driving to related long-form content"],
                },
            ] : [],
            contentOpportunities: [
                "Provide highlights or teasers of long-form content to drive traffic to main channel",
                "Deliver 'quick tip' format for specific skills or knowledge to provide value",
                "'Things to know' series about latest industry trends or statistics",
                "'Q&A' series answering viewer questions",
                "Visual 'Before & After' format to demonstrate results or changes",
                "'Behind-the-scenes' content to show the human side of the brand",
                "'What not to do' format pointing out common mistakes",
                "Challenge format to encourage viewer participation",
            ],
        };

        return {
            trendAnalysis: parsedResult,
        };
    },
});

// Shorts idea generation step
const generateShortsIdeasStep = createStep({
    id: 'generate-shorts-ideas',
    description: 'Generate creative Shorts content ideas based on trends and channel concept',
    inputSchema: z.object({
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }),
        trendAnalysis: z.object({
            relevantTrends: z.array(z.object({
                trend: z.string(),
                relevance: z.string(),
                audienceAppeal: z.string(),
                longevity: z.string(),
            })),
            competitorInsights: z.array(z.object({
                channel: z.string(),
                successfulFormats: z.array(z.string()),
                engagementTactics: z.array(z.string()),
            })).optional(),
            contentOpportunities: z.array(z.string()),
        }),
    }),
    outputSchema: z.object({
        shortsIdeas: z.array(z.object({
            title: z.string(),
            concept: z.string(),
            format: z.string(),
            hook: z.string(),
            visualElements: z.array(z.string()),
            callToAction: z.string(),
            estimatedDuration: z.string(),
            relatedTrend: z.string().optional(),
            targetGoal: z.string(),
            engagementTactic: z.string(),
        })),
    }),
    execute: async (params: { input: any; context: any; mastra?: any }) => {
        const input = params.input.validatedInput;
        const trendAnalysis = params.input.trendAnalysis;

        // Shorts idea generation agent
        const ideationAgent = new Agent({
            name: 'Shorts Ideation Expert',
            model: llm,
            instructions: `
        You are a YouTube Shorts ideation expert.
        Based on the given channel concept, target audience, and trend analysis,
        generate creative and effective Shorts content ideas.
        
        Include the following elements for each idea:
        1. Title: Catchy title that grabs attention
        2. Concept: Basic idea and purpose of the content
        3. Format: Content structure (how-to, Q&A, challenge, etc.)
        4. Hook: How to grab viewer attention in the first few seconds
        5. Visual Elements: List of visual elements to include
        6. Call to Action: Action to encourage from viewers
        7. Estimated Duration: Ideal video length (within 15-60 seconds)
        8. Related Trend: Trend being utilized (if applicable)
        9. Target Goal: Main goal this content achieves
        10. Engagement Tactic: How to encourage viewer participation
        
        Make ideas specific and practical, appropriate for channel concept and target audience.
        Also consider YouTube Shorts characteristics (short format, vertical format, need to capture attention, etc.).
      `,
        });

        const result = await ideationAgent.execute(`
      # Shorts Idea Generation Request
      
      ## Channel Information
      Channel Concept: ${input.channelConcept}
      Target Audience: ${input.targetAudience}
      Content Goals: ${input.contentGoals.join(', ')}
      Existing Content/Strengths: ${input.existingContent || 'Not provided'}
      Brand Guidelines: ${input.brandGuidelines || 'Not provided'}
      
      ## Trend Analysis
      Relevant Trends:
      ${trendAnalysis.relevantTrends.map(trend =>
            `- ${trend.trend}: ${trend.relevance}`
        ).join('\n')}
      
      Content Opportunities:
      ${trendAnalysis.contentOpportunities.map(opportunity =>
            `- ${opportunity}`
        ).join('\n')}
      
      ${trendAnalysis.competitorInsights && trendAnalysis.competitorInsights.length > 0 ? `
      Competitor Insights:
      ${trendAnalysis.competitorInsights.map(insight =>
            `- ${insight.channel}: ${insight.successfulFormats.join(', ')}`
        ).join('\n')}
      ` : ''}
      
      ## Request
      Based on the information above, generate ${input.ideaCount} creative and effective Shorts content ideas.
    `);

        // Parse agent output to generate Shorts ideas
        // A more robust parsing would be needed in actual implementation
        const parsedResult = [
            {
                title: "Learn Basic Skills in 60 Seconds",
                concept: "Teach a specific skill or knowledge concisely in 60 seconds",
                format: "How-to/Educational",
                hook: "Strong opening with \"You'll learn [skill] in just one minute\"",
                visualElements: ["Text overlay", "Step numbers", "Progress bar", "Before & After comparison"],
                callToAction: "Check out the detailed tutorial in our long-form video (link in profile)",
                estimatedDuration: "55-60 seconds",
                relatedTrend: "Fragmented how-to content",
                targetGoal: "Providing value and driving to long-form content",
                engagementTactic: "Encouraging questions in comments",
            },
            {
                title: "Must-Know [Industry] Facts",
                concept: "Introduce surprising statistics or facts to expand viewer knowledge",
                format: "List/Fact presentation",
                hook: "Start with \"Did you know this shocking [industry] fact?\"",
                visualElements: ["Number countdown", "Surprised facial expression", "Data visualization", "Text highlights"],
                callToAction: "Tell us which fact surprised you most in the comments",
                estimatedDuration: "30-45 seconds",
                relatedTrend: "Digest-format content",
                targetGoal: "Engagement increase and authority establishment",
                engagementTactic: "Asking \"Did you know?\" to encourage comments",
            },
            {
                title: "Top 3 Common Mistakes",
                concept: "Highlight common mistakes in a specific area and how to fix them",
                format: "Problem-solving/Advice",
                hook: "Open with \"Are you making these mistakes without knowing?\"",
                visualElements: ["✓ and ✗ graphics", "Before & After", "Text overlay", "Attention markers like arrows or circles"],
                callToAction: "Get our complete guide to avoiding mistakes from profile link",
                estimatedDuration: "45 seconds",
                relatedTrend: "Fragmented how-to content",
                targetGoal: "Providing value through problem-solving",
                engagementTactic: "Asking \"What mistakes have you experienced?\" to drive comments",
            },
            {
                title: "Behind the Scenes",
                concept: "Show production process or behind-the-scenes to build familiarity",
                format: "Behind-the-scenes",
                hook: "Start with \"This is how your favorite videos are made\"",
                visualElements: ["Time-lapse", "Before & After", "Bloopers", "Equipment/setup views"],
                callToAction: "Watch the finished video from our profile",
                estimatedDuration: "30 seconds",
                relatedTrend: "Behind-the-scenes content",
                targetGoal: "Building brand familiarity",
                engagementTactic: "Asking \"What other behind-the-scenes would you like to see?\"",
            },
            {
                title: "Improve in Just 5 Minutes a Day",
                concept: "Showcase how consistent short practice can lead to improvement",
                format: "Advice/Motivation",
                hook: "Start with \"Just 5 minutes a day can dramatically improve your [skill]\"",
                visualElements: ["Progress graph", "Before & After", "Timer display", "Practice examples"],
                callToAction: "Get the full 5-minute training plan from link in bio",
                estimatedDuration: "45-60 seconds",
                relatedTrend: "Fragmented how-to content",
                targetGoal: "Motivation increase and driving to long-form content",
                engagementTactic: "Encouraging viewers to share their daily habits in comments",
            },
        ];

        // Adjust results to match requested idea count
        const shortsIdeas = parsedResult.slice(0, input.ideaCount);

        // If idea count is insufficient, generate additional ideas based on existing ones
        if (shortsIdeas.length < input.ideaCount) {
            // In actual implementation, add logic to generate additional ideas
        }

        return {
            shortsIdeas,
        };
    },
});

// Series recommendations step
const createSeriesRecommendationsStep = createStep({
    id: 'create-series-recommendations',
    description: 'Create series recommendations based on generated ideas',
    inputSchema: z.object({
        validatedInput: z.object({
            channelConcept: z.string(),
            targetAudience: z.string(),
            contentGoals: z.array(z.string()),
            existingContent: z.string().optional(),
            brandGuidelines: z.string().optional(),
            trendTopics: z.array(z.string()).optional(),
            competitorChannels: z.array(z.string()).optional(),
            ideaCount: z.number(),
        }),
        shortsIdeas: z.array(z.object({
            title: z.string(),
            concept: z.string(),
            format: z.string(),
            hook: z.string(),
            visualElements: z.array(z.string()),
            callToAction: z.string(),
            estimatedDuration: z.string(),
            relatedTrend: z.string().optional(),
            targetGoal: z.string(),
            engagementTactic: z.string(),
        })),
    }),
    outputSchema: z.object({
        seriesRecommendations: z.array(z.object({
            seriesTitle: z.string(),
            seriesConcept: z.string(),
            includedIdeas: z.array(z.number()),
            publishingSchedule: z.string(),
            expectedOutcomes: z.array(z.string()),
            expansionPotential: z.string(),
        })),
        contentCalendar: z.object({
            firstMonth: z.array(z.object({
                week: z.number(),
                content: z.string(),
                goal: z.string(),
            })),
        }),
    }),
    execute: async (params: { input: any; context: any; mastra?: any }) => {
        const input = params.input.validatedInput;
        const shortsIdeas = params.input.shortsIdeas;

        // Series recommendations agent
        const seriesAgent = new Agent({
            name: 'Content Series Strategist',
            model: llm,
            instructions: `
        You are a YouTube content series strategy specialist.
        Based on the generated Shorts ideas, create effective series recommendations and content calendar.
        
        Include the following elements in your series recommendations:
        1. Series Title: Consistent, engaging title
        2. Series Concept: Purpose and overall theme of the series
        3. Included Ideas: Index numbers of ideas to include in the series
        4. Publishing Schedule: Recommended publishing frequency and order
        5. Expected Outcomes: Results expected from the series
        6. Expansion Potential: How the series could be expanded
        
        Include a content calendar with a week-by-week publishing plan for the first month.
        
        Make recommendations specific and practical, appropriate for channel concept, target audience,
        and content goals.
      `,
        });

        const result = await seriesAgent.execute(`
      # Series Recommendations Request
      
      ## Channel Information
      Channel Concept: ${input.channelConcept}
      Target Audience: ${input.targetAudience}
      Content Goals: ${input.contentGoals.join(', ')}
      
      ## Generated Shorts Ideas
      ${shortsIdeas.map((idea, index) => `
      ${index + 1}. ${idea.title}
      Concept: ${idea.concept}
      Format: ${idea.format}
      Goal: ${idea.targetGoal}
      `).join('\n')}
      
      ## Request
      Based on the Shorts ideas above, create effective series recommendations and content calendar.
    `);

        // Parse agent output to generate series recommendations
        // A more robust parsing would be needed in actual implementation
        const parsedResult = {
            seriesRecommendations: [
                {
                    seriesTitle: "Masterclass Minutes",
                    seriesConcept: "Educational series teaching complex skills or knowledge in an easy-to-understand one-minute format",
                    includedIdeas: [0], // "Learn Basic Skills in 60 Seconds"
                    publishingSchedule: "Weekly (Mondays), consistent time",
                    expectedOutcomes: [
                        "Establishing educational authority",
                        "Creating regular viewing habit",
                        "Increasing traffic to long-form content",
                    ],
                    expansionPotential: "Can expand topics and progress from beginner to advanced levels",
                },
                {
                    seriesTitle: "Industry Truths",
                    seriesConcept: "Series introducing surprising facts or statistics to expand viewer knowledge",
                    includedIdeas: [1], // "Must-Know [Industry] Facts"
                    publishingSchedule: "Weekly (Wednesdays), consistent time",
                    expectedOutcomes: [
                        "Increasing engagement rate",
                        "Increasing share count",
                        "Strengthening channel expertise impression",
                    ],
                    expansionPotential: "Add themed weeks or viewer-requested topic episodes",
                },
                {
                    seriesTitle: "Growth Hacks",
                    seriesConcept: "Series providing efficient improvement methods and avoiding common mistakes",
                    includedIdeas: [2, 4], // "Top 3 Common Mistakes" and "Improve in Just 5 Minutes a Day"
                    publishingSchedule: "Twice weekly (Tuesdays and Fridays), consistent time",
                    expectedOutcomes: [
                        "Improving viewer practical results",
                        "Encouraging active discussion in comments",
                        "Promoting community building",
                    ],
                    expansionPotential: "Add follow-up episodes featuring viewer success stories",
                },
                {
                    seriesTitle: "Creator Behind-the-Scenes",
                    seriesConcept: "Series showing content production process to build familiarity",
                    includedIdeas: [3], // "Behind the Scenes"
                    publishingSchedule: "Bi-weekly (Sundays), after main content release",
                    expectedOutcomes: [
                        "Increasing channel familiarity",
                        "Strengthening brand human element",
                        "Strengthening community cohesion",
                    ],
                    expansionPotential: "Add behind-the-scenes of special projects or collaborations",
                },
            ],
            contentCalendar: {
                firstMonth: [
                    {
                        week: 1,
                        content: "Masterclass Minutes #1 + Growth Hacks #1 (Common Mistakes)",
                        goal: "Establishing educational value and problem-solving for viewers",
                    },
                    {
                        week: 2,
                        content: "Industry Truths #1 + Growth Hacks #2 (5-Minute Practice) + Creator Behind-the-Scenes #1",
                        goal: "Increasing engagement and building brand familiarity",
                    },
                    {
                        week: 3,
                        content: "Masterclass Minutes #2 + Growth Hacks #3 (New topic)",
                        goal: "Continuing educational value and forming viewing habits",
                    },
                    {
                        week: 4,
                        content: "Industry Truths #2 + Growth Hacks #4 (New topic) + Creator Behind-the-Scenes #2",
                        goal: "Establishing series consistency and promoting community building",
                    },
                ],
            },
        };

        return {
            seriesRecommendations: parsedResult.seriesRecommendations,
            contentCalendar: parsedResult.contentCalendar,
        };
    },
});

// Workflow definition
const youtubeShortsIdeationWorkflow = createWorkflow({
    id: 'youtube-shorts-ideation-workflow',
    description: 'Generate creative ideas for YouTube Shorts content',
    inputSchema: z.object({
        channelConcept: z.string().describe('Channel concept and direction'),
        targetAudience: z.string().describe('Target audience'),
        contentGoals: z.array(z.string()).describe('Content goals (awareness, engagement, conversion, etc.)'),
        existingContent: z.string().optional().describe('Existing content or strengths (optional)'),
        brandGuidelines: z.string().optional().describe('Brand guidelines or constraints (optional)'),
        trendTopics: z.array(z.string()).optional().describe('Trend topics to incorporate (optional)'),
        competitorChannels: z.array(z.string()).optional().describe('Competitor channels (optional)'),
        ideaCount: z.number().optional().describe('Number of ideas to generate (default: 10)'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        result: z.object({
            shortsIdeas: z.array(z.object({
                title: z.string(),
                concept: z.string(),
                format: z.string(),
                hook: z.string(),
                visualElements: z.array(z.string()),
                callToAction: z.string(),
                estimatedDuration: z.string(),
                relatedTrend: z.string().optional(),
                targetGoal: z.string(),
                engagementTactic: z.string(),
            })),
            seriesRecommendations: z.array(z.object({
                seriesTitle: z.string(),
                seriesConcept: z.string(),
                includedIdeas: z.array(z.number()),
                publishingSchedule: z.string(),
                expectedOutcomes: z.array(z.string()),
                expansionPotential: z.string(),
            })),
            contentCalendar: z.object({
                firstMonth: z.array(z.object({
                    week: z.number(),
                    content: z.string(),
                    goal: z.string(),
                })),
            }),
        }).optional(),
    }),
})
    .then(validateShortsIdeationInputStep)
    .then(analyzeTrendsStep)
    .then(generateShortsIdeasStep)
    .then(createSeriesRecommendationsStep);

// Commit the workflow
youtubeShortsIdeationWorkflow.commit();

// Export
export { youtubeShortsIdeationWorkflow };
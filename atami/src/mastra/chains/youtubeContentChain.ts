/**
 * YouTube Content Creation Chain
 * 
 * Example workflow chain for end-to-end YouTube content creation
 */
import { WorkflowChain } from '../orchestration/workflowChain';
import { youtubeInputCollectionWorkflow } from '../workflows/inputCollectionWorkflow';
import { youtubeKeywordResearchWorkflow } from '../workflows/keywordResearchWorkflow';
import { youtubeVideoPlanningWorkflow } from '../workflows/videoPlanningWorkflow';
import { youtubeLongFormRoadmapWorkflow } from '../workflows/longFormRoadmapWorkflow';
import { youtubeThumbnailTitleGeneratorWorkflow } from '../workflows/thumbnailTitleGeneratorWorkflow';
import { youtubeContentScoringWorkflow } from '../workflows/contentScoringWorkflow';

/**
 * Create a workflow chain for long-form YouTube content creation
 */
export const youtubeLongFormContentChain = new WorkflowChain({
  id: 'youtube-long-form-content-chain',
  description: 'End-to-end workflow for creating long-form YouTube content',
  workflows: [
    // 1. Input collection
    {
      workflow: youtubeInputCollectionWorkflow,
      outputMapping: {
        businessName: 'business.name',
        presenterName: 'presenter.name',
        youtubeGoal: 'goals.primary',
        targetAudience: 'audience.primary',
      },
    },
    
    // 2. Keyword research
    {
      workflow: youtubeKeywordResearchWorkflow,
      inputMapping: {
        keyword: 'business.topic',
        targetAudience: 'audience.primary',
      },
      outputMapping: {
        mainKeyword: 'keywords.main',
        relatedKeywords: 'keywords.related',
      },
    },
    
    // 3. Video planning
    {
      workflow: youtubeVideoPlanningWorkflow,
      inputMapping: {
        topicKeywords: 'keywords.main.keyword',
        supportingKeywords: 'keywords.related[0].keyword',
        targetAudience: 'audience.primary',
        contentGoals: 'goals.primary',
      },
      outputMapping: {
        videoPlan: 'content.plan',
        videoOutline: 'content.outline',
      },
    },
    
    // 4. Script generation (Roadmap format)
    {
      workflow: youtubeLongFormRoadmapWorkflow,
      inputMapping: {
        topicTitle: 'content.plan.title',
        topicDescription: 'content.plan.description',
        targetAudience: 'audience.primary',
        goalState: 'content.plan.goal',
      },
      outputMapping: {
        script: 'content.script',
      },
    },
    
    // 5. Thumbnail and title generation
    {
      workflow: youtubeThumbnailTitleGeneratorWorkflow,
      inputMapping: {
        videoContent: 'content.script.sections',
        seoKeywords: ['keywords.main.keyword', 'keywords.related[0].keyword'],
        targetAudience: 'audience.primary',
      },
      outputMapping: {
        thumbnailTextOptions: 'publishing.thumbnailOptions',
        titleOptions: 'publishing.titleOptions',
      },
    },
    
    // 6. Content scoring and feedback (optional)
    {
      workflow: youtubeContentScoringWorkflow,
      optional: true,
      inputMapping: {
        contentType: '"long-form"',
        targetAudience: 'audience.primary',
        contentGoals: 'goals.primary',
        contentScript: 'content.script',
      },
      outputMapping: {
        overallScore: 'quality.score',
        improvementSuggestions: 'quality.improvements',
      },
    },
  ],
});

/**
 * Create a workflow chain for shorts content creation
 */
export const youtubeShortsContentChain = new WorkflowChain({
  id: 'youtube-shorts-content-chain',
  description: 'End-to-end workflow for creating YouTube Shorts content',
  workflows: [
    // 1. Input collection
    {
      workflow: youtubeInputCollectionWorkflow,
      outputMapping: {
        businessName: 'business.name',
        presenterName: 'presenter.name',
        youtubeGoal: 'goals.primary',
        targetAudience: 'audience.primary',
      },
    },
    
    // 2. Keyword research
    {
      workflow: youtubeKeywordResearchWorkflow,
      inputMapping: {
        keyword: 'business.topic',
        targetAudience: 'audience.primary',
      },
      outputMapping: {
        mainKeyword: 'keywords.main',
        relatedKeywords: 'keywords.related',
      },
    },
    
    // 3. Shorts ideation (handled differently from long-form video planning)
    {
      workflow: youtubeVideoPlanningWorkflow, // This would ideally be shortsIdeationWorkflow
      inputMapping: {
        topicKeywords: 'keywords.main.keyword',
        supportingKeywords: 'keywords.related[0].keyword',
        targetAudience: 'audience.primary',
        contentGoals: 'goals.primary',
        // Add format parameter to indicate shorts
        format: '"shorts"',
      },
      outputMapping: {
        videoPlan: 'content.plan',
        videoOutline: 'content.outline',
      },
    },
    
    // 4. Thumbnail and title generation
    {
      workflow: youtubeThumbnailTitleGeneratorWorkflow,
      inputMapping: {
        videoContent: 'content.outline',
        seoKeywords: ['keywords.main.keyword', 'keywords.related[0].keyword'],
        targetAudience: 'audience.primary',
        // Add format parameter to indicate shorts
        videoCategory: '"shorts"',
      },
      outputMapping: {
        thumbnailTextOptions: 'publishing.thumbnailOptions',
        titleOptions: 'publishing.titleOptions',
      },
    },
  ],
});
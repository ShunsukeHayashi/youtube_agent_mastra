// 他のワークフローのインポート
export { youtubeTitleGeneratorWorkflow } from './titleGeneratorWorkflow';
export { youtubeChannelAnalyticsWorkflow, youtubeVideoAnalyticsWorkflow } from './analyticsWorkflow';
export { inputCollectionWorkflow } from './inputCollectionWorkflow';
export { youtubeChannelConceptWorkflow } from './channelConceptWorkflow';
export { youtubeThumbnailTitleGeneratorWorkflow } from './thumbnailTitleGeneratorWorkflow';
export { youtubeVideoPlanningWorkflow } from './videoPlanningWorkflow';
export { keywordResearchWorkflow } from './keywordResearchWorkflow';
export { youtubeChannelConceptDesignWorkflow, youtubeKeywordStrategyWorkflow } from './youtubeWorkflows';

// ダミーワークフロー（型定義との互換性のため）
const youtubeSearchWorkflow = {
  name: 'youtube-search-workflow',
  run: async () => {
    console.log('YouTube Search Workflow は実装されていません');
    return {
      success: false,
      message: 'このワークフローは実装されていません',
    };
  },
  _mastra: null,
  __registerMastra: function(mastra: any) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

const youtubeChannelPlannerWorkflow = {
  name: 'youtube-channel-planner-workflow',
  run: async () => {
    console.log('YouTube Channel Planner Workflow は実装されていません');
    return {
      success: false,
      message: 'このワークフローは実装されていません',
    };
  },
  _mastra: null,
  __registerMastra: function(mastra: any) { this._mastra = mastra; },
  __registerPrimitives: function() {},
  commit: () => {}
};

export { youtubeSearchWorkflow, youtubeChannelPlannerWorkflow };

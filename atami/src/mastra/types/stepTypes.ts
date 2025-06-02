/**
 * Type definitions for workflow step parameters
 * 
 * These types define the common parameters passed to workflow steps
 * to ensure consistent type checking across the codebase.
 */

/**
 * Basic step parameters with input and context
 */
export interface StepParams<TInput = any, TContext = any> {
  /**
   * Input data passed to the step
   */
  input: TInput;
  
  /**
   * Context object for accessing step execution context
   */
  context: StepContext<TContext>;
  
  /**
   * Optional Mastra instance for accessing workflow functionality
   */
  mastra?: any;
}

/**
 * Step context for accessing previous steps' results
 */
export interface StepContext<T = any> {
  /**
   * Get the result of a previous step by step ID
   * @param stepId The ID of the step whose result to retrieve
   * @returns The result of the specified step
   */
  getStepResult<R = any>(stepId: string): R | undefined;
  
  /**
   * Original context data
   */
  data?: T;
}

/**
 * Common YouTube input collection parameters
 */
export interface YouTubeInputCollectionParams {
  /**
   * Name of the business
   */
  businessName: string;
  
  /**
   * Name of the presenter
   */
  presenterName: string;
  
  /**
   * URL of the service (optional)
   */
  serviceUrl?: string;
  
  /**
   * Goal of YouTube operation (acquisition, awareness, fan building, etc.)
   */
  youtubeGoal: string;
  
  /**
   * Background and history of the presenter
   */
  presenterBackground: string;
}

/**
 * Common YouTube channel concept parameters
 */
export interface YouTubeChannelConceptParams {
  /**
   * Description of the product
   */
  productDescription: string;
  
  /**
   * Target audience description
   */
  targetAudience?: string;
  
  /**
   * Website URL (optional)
   */
  websiteUrl?: string;
  
  /**
   * Business goals for the YouTube channel
   */
  businessGoals?: string;
  
  /**
   * Industry or business category
   */
  industryCategory?: string;
}

/**
 * Common YouTube keyword research parameters
 */
export interface YouTubeKeywordResearchParams {
  /**
   * The main keyword to research
   */
  keyword: string;
  
  /**
   * Location for search metrics (e.g., jp, us)
   */
  location?: string;
  
  /**
   * Language for search metrics (e.g., ja, en)
   */
  language?: string;
  
  /**
   * Maximum number of results to return
   */
  limit?: number;
  
  /**
   * Whether to include related keywords
   */
  includeRelated?: boolean;
  
  /**
   * Source platform for keyword research
   */
  source?: 'youtube' | 'google' | 'amazon' | 'bing' | 'ebay' | 'app-store' | 'play-store' | 'instagram' | 'twitter';
  
  /**
   * Business or industry category
   */
  businessCategory?: string;
  
  /**
   * Description of the target audience
   */
  targetAudience?: string;
}

/**
 * Common YouTube shorts ideation parameters
 */
export interface YouTubeShortsIdeationParams {
  /**
   * Channel concept and direction
   */
  channelConcept: string;
  
  /**
   * Target audience
   */
  targetAudience: string;
  
  /**
   * Content goals (awareness, engagement, conversion, etc.)
   */
  contentGoals: string[];
  
  /**
   * Existing content or strengths (optional)
   */
  existingContent?: string;
  
  /**
   * Brand guidelines or constraints (optional)
   */
  brandGuidelines?: string;
  
  /**
   * Trend topics to incorporate (optional)
   */
  trendTopics?: string[];
  
  /**
   * Competitor channels (optional)
   */
  competitorChannels?: string[];
  
  /**
   * Number of ideas to generate (default: 10)
   */
  ideaCount?: number;
}
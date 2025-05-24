/**
 * YouTube動画企画・SEO最適化ツール
 *
 * チャンネルコンセプトとキーワードリサーチに基づいて、
 * YouTube動画の企画とSEO最適化を行います。
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 定数定義
const COMPETITION_LEVELS = ['Low', 'Medium', 'High'] as const;
const CONTENT_GOALS = ['educate', 'entertain', 'convert', 'inspire', 'engage'] as const;
const DEFAULT_VIDEO_DURATION = '10-15 minutes';
const MAX_TAGS = 15; // YouTubeの最大タグ数

// 型定義
type CompetitionLevel = typeof COMPETITION_LEVELS[number];
type ContentGoal = typeof CONTENT_GOALS[number];

/**
 * キーワードデータのインターフェース
 */
interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: CompetitionLevel;
  relevance: number;
  rank: number;
}

/**
 * 競合動画のインターフェース
 */
interface CompetitorVideo {
  title: string;
  channelName: string;
  views: number;
  likes: number;
  comments: number;
  publishDate: string;
  duration: string;
  engagementRate: number;
  url: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * コンテンツ構造のインターフェース
 */
interface ContentStructure {
  section: string;
  duration: string;
  purpose: string;
  description: string;
}

/**
 * 動画タグのインターフェース
 */
interface VideoTag {
  tag: string;
  relevance: number;
  searchVolume: number;
  competition: CompetitionLevel;
}

/**
 * 視聴者維持戦略のインターフェース
 */
interface AudienceRetentionStrategy {
  technique: string;
  implementation: string;
  expectedImpact: string;
  timeMarker: string;
}

/**
 * SEO最適化データのインターフェース
 */
interface SeoOptimization {
  recommendedTitle: string;
  titleVariations: string[];
  description: string;
  tags: VideoTag[];
}

/**
 * メタデータのインターフェース
 */
interface PlanningMetadata {
  estimatedSearchRanking: string;
  estimatedViewRetention: string;
  processingTime: number;
  channelConceptSource?: string;
}

/**
 * 動画企画の出力データインターフェース
 */
interface VideoPlanningOutput {
  keywordResearch: KeywordData[];
  competitorAnalysis: CompetitorVideo[];
  contentStructure: ContentStructure[];
  seoOptimization: SeoOptimization;
  audienceRetentionStrategies: AudienceRetentionStrategy[];
  differentiationPoints: string[];
  callToActionStrategy: string;
  metadata: PlanningMetadata;
}

export const youtubeVideoPlanningTool = createTool({
  id: 'youtube-video-planning-seo',
  description: 'Generate strategic YouTube video planning and SEO optimization based on channel concept and keyword research',
  inputSchema: z.object({
    channelConcept: z.string().describe('The concept of the YouTube channel'),
    targetAudience: z.string().describe('Description of the target audience'),
    videoTopic: z.string().describe('The main topic of the video'),
    existingKeywords: z.array(z.string()).optional().describe('Existing SEO keywords to include'),
    competitorChannels: z.array(z.string()).optional().describe('List of competitor YouTube channels'),
    videoDuration: z.string().optional().describe('Expected duration of the video (e.g., "5-10 minutes", "15-20 minutes")'),
    contentGoal: z.string().optional().describe('Primary goal of the content (e.g., "educate", "entertain", "convert")'),
    channelConceptSource: z.enum(['WORKFLOW-1', 'direct']).optional().describe('Source of the channel concept (WORKFLOW-1 or directly provided)'),
  }),
  outputSchema: z.object({
    keywordResearch: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      competition: z.string(),
      relevance: z.number(),
      rank: z.number(),
    })),
    competitorAnalysis: z.array(z.object({
      title: z.string(),
      channelName: z.string(),
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      publishDate: z.string(),
      duration: z.string(),
      engagementRate: z.number(),
      url: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })),
    contentStructure: z.array(z.object({
      section: z.string(),
      duration: z.string(),
      purpose: z.string(),
      description: z.string(),
    })),
    seoOptimization: z.object({
      recommendedTitle: z.string(),
      titleVariations: z.array(z.string()),
      description: z.string(),
      tags: z.array(z.object({
        tag: z.string(),
        relevance: z.number(),
        searchVolume: z.number(),
        competition: z.string(),
      })),
    }),
    audienceRetentionStrategies: z.array(z.object({
      technique: z.string(),
      implementation: z.string(),
      expectedImpact: z.string(),
      timeMarker: z.string(),
    })),
    differentiationPoints: z.array(z.string()),
    callToActionStrategy: z.string(),
    metadata: z.object({
      estimatedSearchRanking: z.string(),
      estimatedViewRetention: z.string(),
      processingTime: z.number(),
      channelConceptSource: z.string().optional(),
    }),
  }),
  execute: async (params) => {
    try {
      const context = params.context;
      console.log(`Generating video planning and SEO optimization for topic: ${context.videoTopic}`);
      const startTime = Date.now();
      
      // 必須入力の検証
      validateRequiredInputs(context);
      
      // 動画企画とSEO最適化を生成
      const result = await generateYoutubeVideoPlanning(
        context.channelConcept,
        context.targetAudience,
        context.videoTopic,
        context.existingKeywords,
        context.competitorChannels,
        context.videoDuration || DEFAULT_VIDEO_DURATION,
        context.contentGoal,
        context.channelConceptSource
      );
      
      // 処理時間を計算
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // 秒単位
      
      // 結果を返す
      return {
        ...result,
        metadata: {
          ...result.metadata,
          processingTime,
          channelConceptSource: context.channelConceptSource || 'direct',
        }
      };
    } catch (error) {
      console.error('Error in youtubeVideoPlanningTool:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`動画企画生成中にエラーが発生しました: ${errorMessage}`);
    }
  },
});

/**
 * 必須入力を検証する関数
 * @param context 入力コンテキスト
 */
function validateRequiredInputs(context: any): void {
  if (!context.channelConcept) {
    throw new Error('チャンネルコンセプトは必須です');
  }
  
  if (!context.targetAudience) {
    throw new Error('ターゲットオーディエンスは必須です');
  }
  
  if (!context.videoTopic) {
    throw new Error('動画トピックは必須です');
  }
}

/**
 * YouTube動画企画とSEO最適化を生成する主要関数
 * @param channelConcept YouTubeチャンネルのコンセプト
 * @param targetAudience ターゲットオーディエンスの説明
 * @param videoTopic 動画のメイントピック
 * @param existingKeywords 含める既存のSEOキーワード
 * @param competitorChannels 競合YouTubeチャンネルのリスト
 * @param videoDuration 動画の予想時間
 * @param contentGoal コンテンツの主要目的
 * @param channelConceptSource チャンネルコンセプトのソース
 * @returns 完全な動画企画とSEO最適化データ
 */
const generateYoutubeVideoPlanning = async (
  channelConcept: string,
  targetAudience: string,
  videoTopic: string,
  existingKeywords?: string[],
  competitorChannels?: string[],
  videoDuration: string = DEFAULT_VIDEO_DURATION,
  contentGoal?: string,
  channelConceptSource?: string
): Promise<VideoPlanningOutput> => {
  try {
    console.log(`Generating planning for topic: ${videoTopic}, duration: ${videoDuration}`);
    
    // ステップ1: キーワードリサーチを実行
    const keywordResearch = performKeywordResearch(videoTopic, existingKeywords);
    
    // ステップ2: 競合動画を分析
    const competitorAnalysis = analyzeCompetitors(videoTopic, competitorChannels);
    
    // ステップ3: コンテンツ構造を設計
    const contentStructure = designContentStructure(videoTopic, videoDuration, contentGoal);
    
    // ステップ4: SEO最適化
    const seoOptimization = optimizeForSEO(videoTopic, keywordResearch, competitorAnalysis);
    
    // ステップ5: 視聴者維持戦略を開発
    const audienceRetentionStrategies = developRetentionStrategies(contentStructure, contentGoal);
    
    // ステップ6: 差別化ポイントを特定
    const differentiationPoints = identifyDifferentiationPoints(competitorAnalysis, channelConcept);
    
    // ステップ7: コール・トゥ・アクション戦略を作成
    const callToActionStrategy = createCTAStrategy(contentGoal, channelConcept);
    
    // ステップ8: パフォーマンス指標を推定
    const metadata: PlanningMetadata = {
      estimatedSearchRanking: estimateSearchRanking(keywordResearch, seoOptimization),
      estimatedViewRetention: estimateViewRetention(audienceRetentionStrategies, contentStructure),
      processingTime: 0, // 後で更新される
      channelConceptSource: channelConceptSource,
    };
    
    // 結果を返す
    return {
      keywordResearch,
      competitorAnalysis,
      contentStructure,
      seoOptimization,
      audienceRetentionStrategies,
      differentiationPoints,
      callToActionStrategy,
      metadata,
    };
  } catch (error) {
    console.error('Error generating YouTube video planning:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`動画企画生成中にエラーが発生しました: ${errorMessage}`);
  }
};
//==============================================================================
// キーワードリサーチ関連の関数
//==============================================================================

/**
 * 動画トピックに対してキーワードリサーチを実行する
 * @param videoTopic 動画のメイントピック
 * @param existingKeywords 含める既存のSEOキーワード
 * @returns メトリクス付きのキーワードデータの配列
 */
const performKeywordResearch = (
  videoTopic: string,
  existingKeywords?: string[]
): KeywordData[] => {
  try {
    if (!videoTopic) {
      throw new Error('キーワードリサーチには動画トピックが必要です');
    }
    
    // トピックからベースキーワードを生成
    const baseKeywords = generateBaseKeywords(videoTopic);
    
    // 既存のキーワードがあれば追加
    const allKeywords = existingKeywords && existingKeywords.length > 0
      ? [...baseKeywords, ...existingKeywords.map(k => k.toLowerCase())]
      : baseKeywords;
    
    // 重複を削除
    const uniqueKeywords = [...new Set(allKeywords)];
    
    // キーワードデータを生成
    return uniqueKeywords.map((keyword, index) => {
      // 検索ボリュームと競合度をシミュレート
      const searchVolume = Math.floor(Math.random() * 10000) + 500;
      const competition = COMPETITION_LEVELS[Math.floor(Math.random() * COMPETITION_LEVELS.length)];
      
      // 関連性を計算（前のキーワードほど高い）
      const relevance = Math.max(1, 10 - (index * 0.5));
      
      return {
        keyword,
        searchVolume,
        competition,
        relevance,
        rank: index + 1,
      };
    }).sort((a, b) => b.searchVolume - a.searchVolume);
  } catch (error) {
    console.error('Error performing keyword research:', error);
    return [];
  }
};

/**
 * 動画トピックからベースキーワードを生成する
 * @param videoTopic 動画のトピック
 * @returns 生成されたキーワードの配列
 */
const generateBaseKeywords = (videoTopic: string): string[] => {
  const topic = videoTopic.toLowerCase();
  const words = topic.split(/\s+/);
  
  // バリエーションを生成
  const variations = [
    topic,
    `${topic} 方法`,
    `${topic} やり方`,
    `${topic} チュートリアル`,
    `${topic} ガイド`,
    `${topic} おすすめ`,
    `${topic} コツ`,
    `${topic} 初心者`,
    `${topic} 上級`,
    `${topic} 例`,
    `${topic} テクニック`,
  ];
  
  // 英語圏向けのキーワードも追加（国際的なコンテンツの場合）
  if (topic.match(/^[a-zA-Z\s]+$/)) {
    variations.push(
      `how to ${topic}`,
      `${topic} tutorial`,
      `${topic} guide`,
      `best ${topic}`,
      `${topic} tips`,
      `${topic} for beginners`
    );
  }
  
  // 単語の組み合わせを生成
  if (words.length > 1) {
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        variations.push(`${words[i]} ${words[j]}`);
      }
    }
  }
  
  return [...new Set(variations)]; // 重複を削除して返す
};

// Analyze competitor videos
const analyzeCompetitors = (
  videoTopic: string,
  competitorChannels?: string[]
): CompetitorVideo[] => {
  // In a real implementation, this would search YouTube for competitor videos
  // For now, we'll generate simulated data
  
  const competitorVideos: CompetitorVideo[] = [];
  
  // Generate 5-8 competitor videos
  const numVideos = Math.floor(Math.random() * 4) + 5;
  
  for (let i = 0; i < numVideos; i++) {
    const views = Math.floor(Math.random() * 1000000) + 1000;
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.01));
    const comments = Math.floor(likes * (Math.random() * 0.5 + 0.1));
    const engagementRate = (likes + comments) / views;
    
    // Generate random publish date within the last year
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 365);
    const publishDate = new Date(today);
    publishDate.setDate(today.getDate() - daysAgo);
    
    // Generate random duration between 5 and 30 minutes
    const minutes = Math.floor(Math.random() * 25) + 5;
    const seconds = Math.floor(Math.random() * 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Generate strengths and weaknesses
    const strengths = generateRandomStrengths();
    const weaknesses = generateRandomWeaknesses();
    
    competitorVideos.push({
      title: generateCompetitorTitle(videoTopic, i),
      channelName: competitorChannels ? competitorChannels[i % competitorChannels.length] : `Channel ${i + 1}`,
      views,
      likes,
      comments,
      publishDate: publishDate.toISOString().split('T')[0],
      duration,
      engagementRate,
      url: `https://youtube.com/watch?v=example${i}`,
      strengths,
      weaknesses,
    });
  }
  
  // Sort by views (descending)
  return competitorVideos.sort((a, b) => b.views - a.views);
};

// Generate competitor video title
const generateCompetitorTitle = (videoTopic: string, index: number): string => {
  const prefixes = [
    'How to',
    'The Ultimate Guide to',
    'Top 10',
    'Complete',
    'Beginner\'s Guide to',
    'Advanced',
    'Master',
    'Learn',
    'Understanding',
    'Exploring',
  ];
  
  const suffixes = [
    'Tutorial',
    'Guide',
    'Tips and Tricks',
    'Explained',
    'in 2025',
    'for Beginners',
    'Masterclass',
    'Secrets Revealed',
    'Step by Step',
    'Essentials',
  ];
  
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[index % suffixes.length];
  
  return `${prefix} ${videoTopic} ${suffix}`;
};

// Generate random strengths for competitor videos
/**
 * Generate random strengths for competitor videos
 * @returns Array of random strengths
 */
const generateRandomStrengths = (): string[] => {
  try {
    const allStrengths = [
      'Clear explanations',
      'High production quality',
      'Engaging presenter',
      'Comprehensive coverage',
      'Good use of visuals',
      'Practical examples',
      'Well-structured content',
      'Effective use of timestamps',
      'Strong intro hook',
      'Good pacing',
      'Valuable insights',
      'Actionable advice',
      'Unique perspective',
      'Entertaining delivery',
      'Expert knowledge',
    ];
    
    // Select 2-4 random strengths using proper shuffling
    const numStrengths = Math.floor(Math.random() * 3) + 2;
    
    // Create a copy of the array and shuffle it properly
    const shuffled = [...allStrengths];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, numStrengths);
  } catch (error) {
    console.error('Error generating random strengths:', error);
    return ['Clear explanations', 'High production quality'];
  }
};

// Generate random weaknesses for competitor videos
/**
 * Generate random weaknesses for competitor videos
 * @returns Array of random weaknesses
 */
const generateRandomWeaknesses = (): string[] => {
  try {
    const allWeaknesses = [
      'Too lengthy',
      'Poor audio quality',
      'Lacks depth',
      'Outdated information',
      'Slow pacing',
      'Weak intro',
      'No clear structure',
      'Missing key information',
      'Too technical',
      'Too basic',
      'Distracting background',
      'No practical examples',
      'Poor lighting',
      'Monotone delivery',
      'No call to action',
    ];
    
    // Select 2-4 random weaknesses using proper shuffling
    const numWeaknesses = Math.floor(Math.random() * 3) + 2;
    
    // Create a copy of the array and shuffle it properly
    const shuffled = [...allWeaknesses];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, numWeaknesses);
  } catch (error) {
    console.error('Error generating random weaknesses:', error);
    return ['Too lengthy', 'Poor audio quality'];
  }
};

// Design content structure for the video
const designContentStructure = (
  videoTopic: string,
  videoDuration?: string,
  contentGoal?: string
): ContentStructure[] => {
  // Parse video duration
  let totalMinutes = 10; // Default to 10 minutes
  if (videoDuration) {
    const match = videoDuration.match(/(\d+)-(\d+)/);
    if (match) {
      const minDuration = parseInt(match[1]);
      const maxDuration = parseInt(match[2]);
      totalMinutes = Math.floor((minDuration + maxDuration) / 2);
    }
  }
  
  // Define standard sections
  const standardSections = [
    {
      section: 'Hook & Introduction',
      duration: '0:30-1:00',
      purpose: 'Grab attention and introduce topic',
      description: `Engaging hook that presents a problem or curiosity about ${videoTopic}, followed by a brief introduction to what viewers will learn`
    },
    {
      section: 'Overview & Promise',
      duration: '1:00-2:00',
      purpose: 'Set expectations and make a promise',
      description: `Clear overview of what the video will cover about ${videoTopic} and the specific value viewers will get by watching till the end`,
    },
    {
      section: 'Main Content Part 1',
      duration: '2:00-4:00',
      purpose: 'Deliver core content',
      description: `First major section covering fundamental aspects of ${videoTopic}`,
    },
    {
      section: 'Main Content Part 2',
      duration: '4:00-6:00',
      purpose: 'Deliver core content',
      description: `Second major section exploring more advanced or detailed aspects of ${videoTopic}`,
    },
    {
      section: 'Main Content Part 3',
      duration: '6:00-8:00',
      purpose: 'Deliver core content',
      description: `Third major section providing practical applications or examples of ${videoTopic}`,
    },
    {
      section: 'Summary & Key Takeaways',
      duration: '8:00-9:00',
      purpose: 'Reinforce main points',
      description: `Concise summary of the key points covered about ${videoTopic}`,
    },
    {
      section: 'Call to Action',
      duration: '9:00-10:00',
      purpose: 'Drive engagement and next steps',
      description: 'Clear call to action for likes, comments, subscription, and what to expect in future videos',
    },
  ];
  
  // Adjust sections based on content goal
  let contentSections = [...standardSections];
  if (contentGoal) {
    if (contentGoal.toLowerCase().includes('educate')) {
      contentSections.splice(5, 0, {
        section: 'Common Mistakes & How to Avoid Them',
        duration: '7:00-8:00',
        purpose: 'Provide additional value',
        description: `Common mistakes people make with ${videoTopic} and how to avoid them`,
      });
    } else if (contentGoal.toLowerCase().includes('entertain')) {
      contentSections.splice(3, 0, {
        section: 'Entertaining Story or Example',
        duration: '3:00-4:00',
        purpose: 'Engage and entertain',
        description: `An entertaining story or example related to ${videoTopic} to keep viewers engaged`,
      });
    } else if (contentGoal.toLowerCase().includes('convert')) {
      contentSections.splice(5, 0, {
        section: 'Product/Service Demonstration',
        duration: '7:00-8:00',
        purpose: 'Showcase solution',
        description: `Demonstration of how a product or service solves problems related to ${videoTopic}`,
      });
    }
  }
  
  // Allocate time to each section
  const totalSections = contentSections.length;
  const timePerSection = totalMinutes / totalSections;
  
  // Adjust time allocation based on section importance
  return contentSections.map((section, index) => {
    let duration: string;
    
    if (section.section === 'Hook & Introduction') {
      duration = `${Math.max(1, Math.floor(timePerSection * 0.7))}:00`;
    } else if (section.section === 'Call to Action') {
      duration = `${Math.max(1, Math.floor(timePerSection * 0.5))}:00`;
    } else if (section.section.includes('Main Content')) {
      duration = `${Math.max(2, Math.floor(timePerSection * 1.2))}:00`;
    } else {
      duration = `${Math.max(1, Math.floor(timePerSection))}:00`;
    }
    
    return {
      ...section,
      duration,
    };
  });
};

// Optimize for SEO
const optimizeForSEO = (
  videoTopic: string,
  keywordResearch: KeywordData[],
  competitorAnalysis: CompetitorVideo[]
) => {
  // Generate optimized title
  const recommendedTitle = generateOptimizedTitle(videoTopic, keywordResearch);
  
  // Generate title variations
  const titleVariations = generateTitleVariations(videoTopic, keywordResearch);
  
  // Generate optimized description
  const description = generateOptimizedDescription(videoTopic, keywordResearch);
  
  // Generate optimized tags
  const tags = generateOptimizedTags(videoTopic, keywordResearch);
  
  return {
    recommendedTitle,
    titleVariations,
    description,
    tags,
  };
};

// Generate optimized title
const generateOptimizedTitle = (
  videoTopic: string,
  keywordResearch: KeywordData[]
): string => {
  // Get top keywords
  const topKeywords = keywordResearch.slice(0, 3);
  
  // Generate title patterns
  const titlePatterns = [
    `How to Master ${videoTopic}: ${topKeywords[0].keyword} Guide`,
    `${topKeywords[0].keyword}: The Ultimate ${videoTopic} Tutorial`,
    `${videoTopic} Masterclass | ${topKeywords[0].keyword} Explained`,
    `The Complete Guide to ${videoTopic} (${topKeywords[0].keyword})`,
    `${videoTopic}: ${topKeywords[0].keyword} Tips and Tricks`,
  ];
  
  // Select a random pattern
  return titlePatterns[Math.floor(Math.random() * titlePatterns.length)];
};

// Generate title variations
const generateTitleVariations = (
  videoTopic: string,
  keywordResearch: KeywordData[]
): string[] => {
  // Get top keywords
  const topKeywords = keywordResearch.slice(0, 5);
  
  // Generate variations
  const variations = [
    `How to ${videoTopic} | ${topKeywords[0].keyword} Tutorial`,
    `${videoTopic} for Beginners: ${topKeywords[1].keyword}`,
    `${topKeywords[2].keyword}: ${videoTopic} Explained`,
    `Master ${videoTopic} with these ${topKeywords[3].keyword} Tips`,
    `${videoTopic} ${topKeywords[4].keyword} Guide 2025`,
  ];
  
  return variations;
};

// Generate optimized description
const generateOptimizedDescription = (
  videoTopic: string,
  keywordResearch: KeywordData[]
): string => {
  // Get top keywords
  const topKeywords = keywordResearch.slice(0, 5);
  
  // Generate description
  const description = `
Learn everything you need to know about ${videoTopic} in this comprehensive guide. This video covers ${topKeywords[0].keyword}, ${topKeywords[1].keyword}, and ${topKeywords[2].keyword}.

🔍 WHAT YOU'LL LEARN:
- How to master ${videoTopic} quickly and effectively
- Essential ${topKeywords[3].keyword} techniques
- Advanced ${topKeywords[4].keyword} strategies
- Common mistakes to avoid
- Practical examples and demonstrations

⏱️ TIMESTAMPS:
00:00 - Introduction
01:30 - Understanding ${videoTopic} basics
04:45 - ${topKeywords[0].keyword} techniques
08:20 - How to implement ${topKeywords[1].keyword}
12:15 - Advanced ${topKeywords[2].keyword} strategies
16:40 - Common mistakes to avoid
19:30 - Practical examples
22:50 - Summary and next steps

📚 RESOURCES MENTIONED:
- [Resource 1]: [Link]
- [Resource 2]: [Link]
- [Resource 3]: [Link]

👍 If you found this video helpful, please give it a like, subscribe to the channel, and share it with others who might benefit!

🔔 Turn on notifications to stay updated with our latest content on ${videoTopic} and related topics.

#${videoTopic.replace(/\s+/g, '')} #${topKeywords[0].keyword.replace(/\s+/g, '')} #${topKeywords[1].keyword.replace(/\s+/g, '')}
  `.trim();
  
  return description;
};

// Generate optimized tags
const generateOptimizedTags = (
  videoTopic: string,
  keywordResearch: KeywordData[]
): VideoTag[] => {
  // Convert topic to tags
  const topicWords = videoTopic.split(/\s+/);
  const topicTags = [
    videoTopic,
    ...topicWords,
  ];
  
  // Add keyword tags
  const keywordTags = keywordResearch.map(k => k.keyword);
  
  // Combine and remove duplicates
  const allTags = [...new Set([...topicTags, ...keywordTags])];
  
  // Generate tag data
  return allTags.slice(0, 15).map((tag, index) => {
    const keywordData = keywordResearch.find(k => k.keyword === tag);
    
    return {
      tag,
      relevance: keywordData?.relevance || (10 - (index * 0.5)),
      searchVolume: keywordData?.searchVolume || Math.floor(Math.random() * 5000) + 100,
      competition: keywordData?.competition || (COMPETITION_LEVELS[Math.floor(Math.random() * COMPETITION_LEVELS.length)]),
    };
  }).sort((a, b) => b.relevance - a.relevance);
};

// Develop audience retention strategies
const developRetentionStrategies = (
  contentStructure: ContentStructure[],
  contentGoal?: string
): AudienceRetentionStrategy[] => {
  // Define standard retention techniques
  const standardTechniques = [
    {
      technique: 'Strong Hook',
      implementation: 'Open with a surprising fact, question, or statement that creates curiosity',
      expectedImpact: 'Captures attention in the first 15 seconds',
      timeMarker: '0:00-0:15',
    },
    {
      technique: 'Content Preview',
      implementation: 'Tease valuable information that will come later in the video',
      expectedImpact: 'Creates anticipation and reduces drop-off',
      timeMarker: '0:30-1:00',
    },
    {
      technique: 'Pattern Interrupts',
      implementation: 'Change visuals, audio, or presentation style at regular intervals',
      expectedImpact: 'Maintains attention by preventing monotony',
      timeMarker: 'Every 2-3 minutes',
    },
    {
      technique: 'Open Loops',
      implementation: 'Start explaining something interesting, then pause and promise to finish it later',
      expectedImpact: 'Creates curiosity that keeps viewers watching',
      timeMarker: '2:00-3:00',
    },
    {
      technique: 'Visual Demonstrations',
      implementation: 'Show, don\'t just tell - use visual examples and demonstrations',
      expectedImpact: 'Increases engagement and understanding',
      timeMarker: 'Throughout main content',
    },
    {
      technique: 'Storytelling',
      implementation: 'Incorporate relevant stories or case studies',
      expectedImpact: 'Creates emotional connection and memorability',
      timeMarker: 'Middle sections',
    },
    {
      technique: 'Midpoint Recap',
      implementation: 'Briefly summarize key points covered so far',
      expectedImpact: 'Reinforces learning and re-engages viewers who may have drifted',
      timeMarker: 'Halfway point',
    },
    {
      technique: 'Call to Engagement',
      implementation: 'Ask viewers to comment with their thoughts or experiences',
      expectedImpact: 'Increases active engagement and session time',
      timeMarker: 'End of main sections',
    },
  ];
  
  // Adjust techniques based on content goal
  let retentionTechniques = [...standardTechniques];
  if (contentGoal) {
    if (contentGoal.toLowerCase().includes('educate')) {
      retentionTechniques.push({
        technique: 'Knowledge Checkpoints',
        implementation: 'Pose questions that test understanding of material covered',
        expectedImpact: 'Increases active learning and engagement',
        timeMarker: 'After each main section',
      });
    } else if (contentGoal.toLowerCase().includes('entertain')) {
      retentionTechniques.push({
        technique: 'Humor and Personality',
        implementation: 'Incorporate appropriate humor and authentic personality',
        expectedImpact: 'Creates enjoyment and personal connection',
        timeMarker: 'Throughout video',
      });
    } else if (contentGoal.toLowerCase().includes('convert')) {
      retentionTechniques.push({
        technique: 'Value Stacking',
        implementation: 'Continuously add layers of value throughout the video',
        expectedImpact: 'Builds perceived value and desire for offered solution',
        timeMarker: 'Throughout main content',
      });
    }
  }
  
  return retentionTechniques;
};

// Identify differentiation points
const identifyDifferentiationPoints = (
  competitorAnalysis: CompetitorVideo[],
  channelConcept: string
): string[] => {
  // Analyze competitor weaknesses
  const commonWeaknesses = new Map<string, number>();
  
  competitorAnalysis.forEach(competitor => {
    competitor.weaknesses.forEach(weakness => {
      commonWeaknesses.set(weakness, (commonWeaknesses.get(weakness) || 0) + 1);
    });
  });
  
  // Sort weaknesses by frequency
  const sortedWeaknesses = [...commonWeaknesses.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([weakness]) => weakness);
  
  // Generate differentiation points based on common weaknesses
  const differentiationPoints = sortedWeaknesses.slice(0, 3).map(weakness => {
    switch (weakness) {
      case 'Too lengthy':
        return 'Concise and to-the-point content that respects viewer\'s time';
      case 'Poor audio quality':
        return 'Professional audio quality for clear communication';
      case 'Lacks depth':
        return 'In-depth analysis and comprehensive coverage of the topic';
      case 'Outdated information':
        return 'Up-to-date information with the latest research and developments';
      case 'Slow pacing':
        return 'Engaging pacing that maintains viewer interest throughout';
      case 'Weak intro':
        return 'Compelling introduction that hooks viewers immediately';
      case 'No clear structure':
        return 'Well-structured content with clear organization and flow';
      case 'Missing key information':
        return 'Complete coverage of all essential information on the topic';
      case 'Too technical':
        return 'Accessible explanations that break down complex concepts';
      case 'Too basic':
        return 'Advanced insights while still being accessible to beginners';
      case 'Distracting background':
        return 'Clean, professional setting that enhances rather than distracts';
      case 'No practical examples':
        return 'Practical, real-world examples that demonstrate application';
      case 'Poor lighting':
        return 'Professional lighting for clear, high-quality visuals';
      case 'Monotone delivery':
        return 'Engaging, dynamic presentation style that maintains interest';
      case 'No call to action':
        return 'Clear guidance on next steps and implementation';
      default:
        return `Addressing the common issue of "${weakness}" found in competitor videos`;
    }
  });
  
  // Add channel concept-specific differentiation points
  differentiationPoints.push(
    `Unique perspective based on ${channelConcept}`,
    'Consistent quality and style that builds channel recognition'
  );
  
  return differentiationPoints;
};

// Create call-to-action strategy
const createCTAStrategy = (
  contentGoal?: string,
  channelConcept?: string
): string => {
  // Define CTA strategies based on content goal
  if (contentGoal) {
    if (contentGoal.toLowerCase().includes('educate')) {
      return `
Educational CTA Strategy:
1. Primary CTA: "If you found this tutorial helpful, hit the like button and subscribe for more educational content on ${channelConcept || 'this topic'}"
2. Engagement CTA: "Share your experience with ${channelConcept || 'this topic'} in the comments below - what challenges have you faced?"
3. Next Steps CTA: "Check out our comprehensive playlist on ${channelConcept || 'related topics'} to continue your learning journey"
4. Resource CTA: "Download our free worksheet/guide in the description to practice what you've learned"
      `.trim();
    } else if (contentGoal.toLowerCase().includes('entertain')) {
      return `
Entertainment CTA Strategy:
1. Primary CTA: "If this video made you smile, hit that like button and subscribe for more entertaining content about ${channelConcept || 'this topic'}"
2. Secondary CTA: "Share this video with a friend who needs a laugh!"
3. Community Engagement: "Comment below with your favorite moment from this video"
4. Engagement CTA: "Tell us your favorite part in the comments below or share your own funny story about ${channelConcept || 'this topic'}"
5. Community CTA: "Join our community on social media where we share exclusive content and behind-the-scenes footage"
6. Anticipation CTA: "Next week we'll be covering [teaser for next video] - hit the notification bell so you don't miss it!"
      `.trim();
    } else if (contentGoal.toLowerCase().includes('convert')) {
      return `
Conversion CTA Strategy:
1. Primary CTA: "To learn more about how we can help you with ${channelConcept || 'this topic'}, click the link in the description to schedule a free consultation"
2. Value-Add CTA: "Download our free guide that walks you through the exact process shown in this video"
3. Social Proof CTA: "Check out the case studies in the description to see how others have achieved results with our approach"
4. Urgency CTA: "The special offer mentioned in this video is available for the next 7 days only - click the link below to take advantage"
      `.trim();
    }
  }
  
  // Default CTA strategy
  return `
Balanced CTA Strategy:
1. Primary CTA: "If you found value in this video, please hit the like button and subscribe to the channel for more content on ${channelConcept || 'this topic'}"
2. Engagement CTA: "Share your thoughts, questions, or experiences in the comments below - I read and respond to as many as possible"
3. Cross-Promotion CTA: "Check out our related video on [related topic] - link in the description"
4. Community CTA: "Follow us on social media for additional tips, updates, and behind-the-scenes content"
  `.trim();
};

// Estimate search ranking
const estimateSearchRanking = (
  keywordResearch: KeywordData[],
  seoOptimization: any
): string => {
  // Calculate keyword strength
  const topKeywords = keywordResearch.slice(0, 5);
  const keywordStrength = topKeywords.reduce((sum, keyword) => {
    const competitionFactor = keyword.competition === 'Low' ? 1.5 : 
                             keyword.competition === 'Medium' ? 1.0 : 0.5;
    return sum + (keyword.relevance * competitionFactor);
  }, 0) / topKeywords.length;
  
  // Calculate title optimization
  const titleOptimization = seoOptimization.recommendedTitle.length > 40 && 
                           seoOptimization.recommendedTitle.length < 70 ? 1.0 : 0.7;
  
  // Calculate description optimization
  const descriptionOptimization = seoOptimization.description.length > 200 ? 1.0 : 0.7;
  
  // Calculate tag optimization
  const tagOptimization = seoOptimization.tags.length > 10 ? 1.0 : 0.7;
  
  // Calculate overall score
  const overallScore = (keywordStrength * 0.4) + 
                      (titleOptimization * 0.3) + 
                      (descriptionOptimization * 0.2) + 
                      (tagOptimization * 0.1);
  
  // Convert to ranking estimate
  if (overallScore > 0.9) {
    return 'Excellent potential for top 5 ranking for primary keywords';
  } else if (overallScore > 0.8) {
    return 'Strong potential for first page ranking for primary keywords';
  } else if (overallScore > 0.7) {
    return 'Good potential for first page ranking for some keywords';
  } else if (overallScore > 0.6) {
    return 'Moderate potential for ranking on first or second page';
  } else {
    return 'May struggle to rank on first page without additional optimization';
  }
};

// Estimate view retention
const estimateViewRetention = (
  audienceRetentionStrategies: AudienceRetentionStrategy[],
  contentStructure: ContentStructure[]
): string => {
  // Calculate strategy effectiveness
  const strategyEffectiveness = audienceRetentionStrategies.length / 10;
  
  // Calculate content structure effectiveness
  const structureEffectiveness = contentStructure.length > 5 ? 1.0 : 0.7;
  
  // Calculate overall score
  const overallScore = (strategyEffectiveness * 0.6) + (structureEffectiveness * 0.4);
  
  // Convert to retention estimate
  if (overallScore > 0.9) {
    return 'Excellent potential for 60%+ average view duration';
  } else if (overallScore > 0.8) {
    return 'Strong potential for 50-60% average view duration';
  } else if (overallScore > 0.7) {
    return 'Good potential for 40-50% average view duration';
  } else if (overallScore > 0.6) {
    return 'Moderate potential for 30-40% average view duration';
  } else {
    return 'May achieve 20-30% average view duration';
  }
};
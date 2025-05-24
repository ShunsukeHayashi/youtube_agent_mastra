import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Type definitions
/**
 * Represents a thumbnail text option with rating and persona reactions
 */
interface ThumbnailText {
  text: string;
  rating: number;
  rationale: string;
  personaReactions: {
    personaName: string;
    reaction: string;
  }[];
}

/**
 * Represents a title option with rating and associated thumbnail text
 */
interface TitleOption {
  title: string;
  rating: number;
  rationale: string;
  thumbnailTextId: number;
  seoKeywords: string[];
}

/**
 * Represents a YouTube viewer persona
 */
interface YouTubePersona {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  viewingHabits: string;
}

/**
 * Represents a recommended set of thumbnail text and matching titles
 */
interface TitleAndThumbnailSet {
  thumbnailText: string;
  titles: string[];
}

/**
 * Represents a video description with tags
 */
interface VideoDescriptionSet {
  description: string;
  tags: string[];
}

// Constants
/**
 * Common persona names for diversity
 */
const PERSONA_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Skyler'];

/**
 * Age ranges for personas
 */
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-64'];

/**
 * Gender options for personas
 */
const GENDERS = ['Male', 'Female', 'Non-binary'];

/**
 * Occupation options for personas
 */
const OCCUPATIONS = [
  'Student', 'Professional', 'Entrepreneur', 'Freelancer', 'Manager',
  'Content Creator', 'Educator', 'Designer', 'Developer', 'Marketer'
];

/**
 * Common interests for personas
 */
const COMMON_INTERESTS = [
  'Learning new skills', 'Professional growth', 'Self-improvement',
  'Staying updated on trends', 'Technology', 'Innovation', 'Productivity',
  'Career development', 'Social media', 'Digital marketing'
];

/**
 * Common pain points for personas
 */
const COMMON_PAIN_POINTS = [
  'Information overload', 'Lack of time', 'Difficulty finding reliable sources',
  'Rapidly changing industry', 'Too many options to choose from', 'Fear of missing out',
  'Staying relevant', 'Work-life balance', 'Learning complex topics quickly'
];

/**
 * Common goals for personas
 */
const COMMON_GOALS = [
  'Master new skills', 'Advance career', 'Stay ahead of trends',
  'Find practical solutions', 'Increase productivity', 'Network with like-minded people',
  'Build authority in field', 'Implement best practices', 'Achieve specific outcomes'
];

/**
 * YouTube viewing habits for personas
 */
const VIEWING_HABITS = [
  'Regularly watches educational content during lunch breaks',
  'Binge-watches tutorials on weekends to learn new skills',
  'Subscribes to industry leaders and watches their content religiously',
  'Uses YouTube as primary learning resource for professional development',
  'Watches YouTube on mobile during commute or downtime',
  'Saves videos to watch later and organizes them by topic',
  'Actively engages with content by commenting and participating in discussions'
];

/**
 * Shocking phrases for thumbnail text
 */
const SHOCKING_PHRASES = [
  'Mind-blowing', 'Shocking truth', 'Unbelievable', 'Never before seen',
  'Game-changer', 'Revolutionary', 'Insider secret', 'Hidden method',
  'Jaw-dropping', 'Industry disruptor', 'Counterintuitive', 'Secret formula',
  'Unexpected twist', 'Forbidden technique', 'Untold story', 'Unknown hack',
  'Rare insight', 'Breakthrough approach', 'Ultimate revelation', 'Expert confession',
  'Surprising fact', 'Little-known trick', 'Controversial truth', 'Proven method',
  'Instant results', 'Massive discovery', 'Exclusive access', 'Powerful strategy',
  'Critical warning', 'Essential knowledge'
];

/**
 * Benefit phrases for thumbnail text
 */
const BENEFIT_PHRASES = [
  'Transform your results', 'Skyrocket your success', 'Double your performance',
  'Master the technique', 'Achieve in days not months', 'Get immediate results',
  'Eliminate common mistakes', 'Never struggle again', 'Save hours of time',
  'Beat the competition', 'Fast-track your learning', 'Outperform expectations',
  'Gain unfair advantage', 'Level up instantly', 'Become the expert',
  'Unlock new potential', 'Simplify complex problems', 'Overcome limitations',
  'Maximize your outcome', 'Effortlessly succeed', 'Boost your confidence',
  'Accelerate your growth', 'Achieve breakthrough results', 'Dominate your niche',
  'Multiply your impact', 'Streamline your process', 'Amplify your skills',
  'Eliminate frustration', 'Reach your goals faster', 'Outshine competitors'
];

/**
 * Benefit phrases for titles
 */
const TITLE_BENEFIT_PHRASES = [
  'Transform Your Results', 'Skyrocket Your Success', 'Master This Technique',
  'Achieve Breakthrough Results', 'Double Your Productivity', 'Unlock Hidden Potential',
  'Eliminate Common Mistakes', 'Accelerate Your Growth', 'Maximize Your Impact',
  'Overcome Limitations', 'Simplify Complex Problems', 'Gain Unfair Advantage',
  'Boost Your Performance', 'Streamline Your Process', 'Reach Your Goals Faster',
  'Outperform Competitors', 'Revolutionize Your Approach', 'Discover Proven Methods',
  'Implement Winning Strategies', 'Leverage Expert Insights'
];

// Utility functions
/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Gets a random item from an array
 * @param array The array to get a random item from
 * @returns A random item from the array
 */
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Gets a random subset of items from an array
 * @param array The array to get items from
 * @param count The number of items to get
 * @returns A random subset of items
 */
const getRandomSubset = <T>(array: T[], count: number): T[] => {
  return shuffleArray(array).slice(0, Math.min(count, array.length));
};

export const youtubeThumbnailTitleGeneratorTool = createTool({
  id: 'youtube-thumbnail-title-generator',
  description: 'Generate high-CTR YouTube thumbnail text and titles based on video content or script',
  inputSchema: z.object({
    videoContent: z.string().describe('The content summary or full script of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
    scriptSource: z.enum(['WORKFLOW-3', 'WORKFLOW-7', 'direct']).optional().describe('Source of the script (WORKFLOW-3: video planning, WORKFLOW-7: narration script, direct: directly provided)'),
  }),
  outputSchema: z.object({
    personas: z.array(z.object({
      name: z.string(),
      age: z.string(),
      gender: z.string(),
      occupation: z.string(),
      interests: z.array(z.string()),
      painPoints: z.array(z.string()),
      goals: z.array(z.string()),
      viewingHabits: z.string(),
    })),
    thumbnailTextOptions: z.array(z.object({
      text: z.string(),
      rating: z.number(),
      rationale: z.string(),
      personaReactions: z.array(z.object({
        personaName: z.string(),
        reaction: z.string(),
      })),
    })),
    titleOptions: z.array(z.object({
      title: z.string(),
      rating: z.number(),
      rationale: z.string(),
      thumbnailTextId: z.number(),
      seoKeywords: z.array(z.string()),
    })),
    recommendedSets: z.array(z.object({
      thumbnailText: z.string(),
      titles: z.array(z.string()),
    })),
    videoDescription: z.object({
      description: z.string(),
      tags: z.array(z.string()),
    }),
    metadata: z.object({
      totalThumbnailTexts: z.number(),
      totalTitles: z.number(),
      scriptSource: z.string().optional(),
      processingTime: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    console.log(`Generating thumbnail texts and titles for video content: ${context.videoContent.substring(0, 50)}...`);
    const startTime = Date.now();
    
    // Validate input
    if (!context.videoContent || context.videoContent.trim().length === 0) {
      throw new Error('Video content is required and cannot be empty');
    }
    
    try {
      const result = await generateYouTubeThumbnailsAndTitles(
        context.videoContent,
        context.seoKeywords || [],
        context.targetAudience,
        context.videoCategory,
        context.channelTheme,
        context.scriptSource
      );
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // in seconds
      
      return {
        ...result,
        metadata: {
          totalThumbnailTexts: result.thumbnailTextOptions.length,
          totalTitles: result.titleOptions.length,
          scriptSource: context.scriptSource || 'direct',
          processingTime,
        }
      };
    } catch (error) {
      console.error('Error in youtubeThumbnailTitleGeneratorTool:', error);
      throw error;
    }
  },
});

/**
 * Main function to generate YouTube thumbnails and titles
 * @param videoContent The content summary or full script of the video
 * @param seoKeywords SEO keywords to include in titles
 * @param targetAudience Description of the target audience
 * @param videoCategory Category of the video
 * @param channelTheme Overall theme or focus of the YouTube channel
 * @param scriptSource Source of the script
 * @returns Generated personas, thumbnail texts, titles, recommended sets, and video description
 */
const generateYouTubeThumbnailsAndTitles = async (
  videoContent: string,
  seoKeywords: string[] = [],
  targetAudience?: string,
  videoCategory?: string,
  channelTheme?: string,
  scriptSource?: string
) => {
  try {
    // Step 1: Extract topics from the video content
    const topics = extractTopics(videoContent);
    
    // Step 2: Generate personas based on the video content and topics
    const personas = generatePersonas(topics, targetAudience);
    
    // Step 3: Generate key themes from topics
    const keyThemes = generateKeyThemes(topics);
    
    // Step 4: Generate specific phrases from topics
    const specificElements = generateSpecificPhrases(topics);
    
    // Step 5: Generate thumbnail text options (30 options)
    const thumbnailTextOptions = generateThumbnailTextOptions(
      SHOCKING_PHRASES,
      specificElements,
      BENEFIT_PHRASES,
      personas
    );
    
    // Step 6: Generate title options (at least 20 options)
    const titleOptions = generateEnhancedTitleOptions(
      thumbnailTextOptions,
      seoKeywords,
      keyThemes,
      videoCategory
    );
    
    // Step 7: Create recommended sets of thumbnail texts and titles
    const recommendedSets = createRecommendedSets(thumbnailTextOptions, titleOptions);
    
    // Step 8: Generate video description
    const videoDescription = generateVideoDescription(
      videoContent,
      seoKeywords,
      topics,
      channelTheme
    );
    
    return {
      personas,
      thumbnailTextOptions,
      titleOptions,
      recommendedSets,
      videoDescription,
    };
  } catch (error) {
    console.error('Error generating YouTube thumbnails and titles:', error);
    throw error;
  }
};

/**
 * Extracts topics from video content by analyzing word frequency
 * @param content The video content to analyze
 * @returns Array of extracted topics
 */
const extractTopics = (content: string): string[] => {
  if (!content || content.trim().length === 0) {
    return ['general knowledge', 'education', 'information', 'tutorial', 'guide'];
  }

  // Normalize content
  const normalized = content.toLowerCase();
  
  // Remove common words and split
  const words = normalized.split(/\s+/)
    .filter(word => word.length > 3) // Only words longer than 3 characters
    .filter(word => !['the', 'and', 'that', 'with', 'for', 'this', 'have', 'are', 'you'].includes(word));
  
  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and take top 5
  const sortedWords = Object.entries(wordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([word]) => word)
    .slice(0, 5);
  
  return sortedWords.length > 0 ? sortedWords : ['general knowledge', 'education', 'information', 'tutorial', 'guide'];
};

/**
 * Generates key themes based on topics
 * @param topics Extracted topics from the video content
 * @returns Array of key themes
 */
const generateKeyThemes = (topics: string[]): string[] => {
  return topics.map(topic => {
    const variations = [
      `Understanding ${topic}`,
      `Mastering ${topic}`,
      `${topic} techniques`,
      `${topic} strategies`,
      `${topic} fundamentals`
    ];
    return getRandomItem(variations);
  });
};

/**
 * Generates specific phrases based on topics
 * @param topics Extracted topics from the video content
 * @returns Array of specific phrases
 */
const generateSpecificPhrases = (topics: string[]): string[] => {
  // Generate specific phrases based on topics
  const specificPhrases = topics.flatMap(topic => [
    `${topic} strategy`,
    `${topic} system`,
    `${topic} formula`,
    `${topic} framework`,
    `${topic} technique`,
    `${topic} method`,
    `${topic} approach`,
    `${topic} process`,
    `${topic} routine`,
    `${topic} blueprint`,
    `${topic} roadmap`,
    `${topic} guide`,
    `${topic} toolkit`,
    `${topic} masterclass`,
    `${topic} workshop`
  ]);
  
  // Select a random subset
  return getRandomSubset(specificPhrases, 15);
};

/**
 * Generates personas based on topics and target audience
 * @param topics Extracted topics from the video content
 * @param targetAudienceInfo Description of the target audience
 * @returns Array of generated personas
 */
const generatePersonas = (
  topics: string[],
  targetAudienceInfo?: string
): YouTubePersona[] => {
  // Define common viewer demographics based on content
  const personas: YouTubePersona[] = [];
  
  // Generate 3-5 distinct personas
  const numPersonas = targetAudienceInfo ? 5 : 3; // Generate more personas if target audience info is provided
  
  for (let i = 0; i < numPersonas; i++) {
    const persona = createPersona(i, topics, targetAudienceInfo);
    personas.push(persona);
  }
  
  return personas;
};

/**
 * Creates a single persona with diverse traits
 * @param index Index to ensure diversity among personas
 * @param topics Extracted topics from the video content
 * @param targetAudienceInfo Description of the target audience
 * @returns A generated persona
 */
const createPersona = (
  index: number,
  topics: string[],
  targetAudienceInfo?: string
): YouTubePersona => {
  // Create tailored interests, pain points, and goals based on topics
  const tailoredInterests = topics.map(topic => `Interest in ${topic}`);
  const tailoredPainPoints = topics.map(topic => `Struggling to master ${topic}`);
  const tailoredGoals = topics.map(topic => `Become proficient in ${topic}`);
  
  // Mix common and tailored traits using utility functions
  const interests = [
    ...getRandomSubset(COMMON_INTERESTS, 3),
    ...getRandomSubset(tailoredInterests, 2)
  ];
  
  const painPoints = [
    ...getRandomSubset(COMMON_PAIN_POINTS, 2),
    ...getRandomSubset(tailoredPainPoints, 2)
  ];
  
  const goals = [
    ...getRandomSubset(COMMON_GOALS, 2),
    ...getRandomSubset(tailoredGoals, 2)
  ];
  
  // Personalize based on index to ensure diversity
  return {
    name: PERSONA_NAMES[index % PERSONA_NAMES.length],
    age: AGE_RANGES[index % AGE_RANGES.length],
    gender: GENDERS[index % GENDERS.length],
    occupation: OCCUPATIONS[(index * 3) % OCCUPATIONS.length],
    interests,
    painPoints,
    goals,
    viewingHabits: VIEWING_HABITS[index % VIEWING_HABITS.length]
  };
};

// This function is now replaced by generateKeyThemes

// Extract shocking elements for thumbnail text
/**
 * Extracts shocking elements for thumbnail text
 * @param content The video content to analyze
 * @returns Array of shocking phrases
 */
const extractShockingElements = (content: string): string[] => {
  // Use the constant SHOCKING_PHRASES instead of redefining the array
  // Select a random subset using the shuffleArray utility function
  return getRandomSubset(SHOCKING_PHRASES, 15);
};

// Extract benefit elements for thumbnail text
/**
 * Extracts benefit elements for thumbnail text
 * @param content The video content to analyze
 * @returns Array of benefit phrases
 */
const extractBenefitElements = (content: string): string[] => {
  // Use the constant BENEFIT_PHRASES instead of redefining the array
  // Select a random subset using the shuffleArray utility function
  return getRandomSubset(BENEFIT_PHRASES, 15);
};

// Extract specific elements for thumbnail text
/**
 * Extracts specific elements for thumbnail text
 * @param content The video content to analyze
 * @returns Array of specific phrases
 */
const extractSpecificElements = (content: string): string[] => {
  // Extract topics
  const topics = extractTopics(content);
  
  // Use the generateSpecificPhrases function which already does this
  return generateSpecificPhrases(topics);
};

// Generate thumbnail text options
/**
 * Generates thumbnail text options by combining shocking elements, specific elements, and benefit elements
 * @param shockingElements Array of shocking phrases
 * @param specificElements Array of specific phrases related to topics
 * @param benefitElements Array of benefit phrases
 * @param personas Array of personas to generate reactions for
 * @returns Array of thumbnail text options with ratings and persona reactions
 */
const generateThumbnailTextOptions = (
  shockingElements: string[],
  specificElements: string[],
  benefitElements: string[],
  personas: YouTubePersona[]
): ThumbnailText[] => {
  try {
    if (!shockingElements.length || !specificElements.length || !benefitElements.length || !personas.length) {
      throw new Error('Invalid input: All input arrays must contain elements');
    }
    
    const thumbnailTexts: ThumbnailText[] = [];
    
    // Generate 30 thumbnail text options
    for (let i = 0; i < 30; i++) {
      // Create thumbnail text by combining elements
      const text = createThumbnailText(
        getRandomItem(shockingElements),
        getRandomItem(specificElements),
        getRandomItem(benefitElements),
        i % 4
      );
      
      // Generate persona reactions
      const personaReactions = personas.map(persona => ({
        personaName: persona.name,
        reaction: generatePersonaReaction(persona, text)
      }));
      
      // Calculate rating based on persona reactions (1-5 scale)
      const personaInterestLevel = calculateAverageInterestLevel(personaReactions);
      
      // Round to nearest 0.5
      const rating = Math.round(personaInterestLevel * 2) / 2;
      
      // Generate rationale for the rating
      const rationale = generateRatingRationale(rating, text, personaReactions);
      
      thumbnailTexts.push({
        text,
        rating,
        rationale,
        personaReactions
      });
    }
    
    // Sort by rating (descending)
    return thumbnailTexts.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Error generating thumbnail text options:', error);
    // Return empty array in case of error
    return [];
  }
};

/**
 * Creates a thumbnail text by combining shocking, specific, and benefit elements
 * @param shocking Shocking phrase
 * @param specific Specific phrase
 * @param benefit Benefit phrase
 * @param patternIndex Index to determine the pattern to use
 * @returns Generated thumbnail text
 */
const createThumbnailText = (
  shocking: string,
  specific: string,
  benefit: string,
  patternIndex: number
): string => {
  // Combine elements in different ways based on pattern index
  switch (patternIndex) {
    case 0:
      return `${shocking}: ${specific}`;
    case 1:
      return `${specific} → ${benefit}`;
    case 2:
      return `${shocking} ${specific}`;
    default:
      return `${benefit} with ${specific}`;
  }
};

/**
 * Calculates the average interest level from persona reactions
 * @param personaReactions Array of persona reactions
 * @returns Average interest level
 */
/**
 * Calculates the average interest level from persona reactions
 * @param personaReactions Array of persona reactions
 * @returns Average interest level
 */
const calculateAverageInterestLevel = (
  personaReactions: { personaName: string; reaction: string }[]
): number => {
  try {
    if (!personaReactions || personaReactions.length === 0) return 3; // Default rating if no reactions
    
    const sum = personaReactions.reduce((total, reaction) => {
      return total + analyzeReactionInterestLevel(reaction.reaction);
    }, 0);
    
    return sum / personaReactions.length;
  } catch (error) {
    console.error('Error calculating average interest level:', error);
    return 3; // Default rating in case of error
  }
};

/**
 * Generates a persona's reaction to a thumbnail text
 * @param persona The persona to generate a reaction for
 * @param text The thumbnail text to react to
 * @returns A string representing the persona's reaction
 */
/**
 * Generates a persona's reaction to a thumbnail text
 * @param persona The persona to generate a reaction for
 * @param text The thumbnail text to react to
 * @returns A string representing the persona's reaction
 */
const generatePersonaReaction = (persona: YouTubePersona, text: string): string => {
  try {
    if (!text) return 'No reaction - empty text';
    if (!persona) return 'No reaction - invalid persona';
    
    const textLower = text.toLowerCase();
    
    // Check if the text aligns with persona's interests, goals, or pain points
    const matchingInterest = persona.interests.find(interest =>
      textLower.includes(interest.toLowerCase())
    );
    
    const matchingGoal = persona.goals.find(goal =>
      textLower.includes(goal.toLowerCase())
    );
    
    const matchingPainPoint = persona.painPoints.find(painPoint =>
      textLower.includes(painPoint.toLowerCase())
    );
    
    // Generate reaction based on matches
    if (matchingInterest && matchingGoal) {
      return `Highly engaged - this directly addresses my interests in ${matchingInterest} and my goal to ${matchingGoal}`;
    } else if (matchingInterest) {
      return `Interested - aligns with my passion for ${matchingInterest}`;
    } else if (matchingGoal) {
      return `Attentive - helps me achieve my goal of ${matchingGoal}`;
    } else if (matchingPainPoint) {
      return `Curious - might help solve my problem with ${matchingPainPoint}`;
    } else {
      return `Somewhat interested - doesn't directly address my specific needs but could be useful`;
    }
  } catch (error) {
    console.error('Error generating persona reaction:', error);
    return 'No reaction - error occurred';
  }
};

// Analyze the interest level in a reaction (1-5 scale)
/**
 * Analyzes the interest level in a reaction (1-5 scale)
 * @param reaction The reaction text to analyze
 * @returns A numeric interest level score
 */
const analyzeReactionInterestLevel = (reaction: string): number => {
  if (reaction.startsWith('Highly engaged')) {
    return 5;
  } else if (reaction.startsWith('Interested')) {
    return 4;
  } else if (reaction.startsWith('Attentive')) {
    return 3.5;
  } else if (reaction.startsWith('Curious')) {
    return 3;
  } else {
    return 2;
  }
};

/**
 * Generates enhanced title options based on thumbnail texts and keywords
 * @param thumbnailTextOptions Array of thumbnail text options
 * @param seoKeywords SEO keywords to include in titles
 * @param keyThemes Key themes extracted from the video content
 * @param videoCategory Category of the video
 * @returns Array of title options with ratings and rationales
 */
const generateEnhancedTitleOptions = (
  thumbnailTextOptions: ThumbnailText[],
  seoKeywords: string[],
  keyThemes: string[],
  videoCategory?: string
): TitleOption[] => {
  try {
    if (!thumbnailTextOptions.length) {
      throw new Error('No thumbnail text options provided');
    }
    
    const titleOptions: TitleOption[] = [];
    
    // Take top 10 thumbnail texts based on rating
    const topThumbnailTexts = thumbnailTextOptions.slice(0, 10);
    
    // Generate title options for each top thumbnail text
    topThumbnailTexts.forEach((thumbnailText, thumbnailIndex) => {
      // Get thumbnail text index in the original array
      const thumbnailTextId = thumbnailTextOptions.findIndex(t => t.text === thumbnailText.text);
      
      // Generate 2-3 title options for each thumbnail text
      const numTitlesPerThumbnail = thumbnailIndex < 5 ? 3 : 2; // More titles for top 5 thumbnails
      
      for (let i = 0; i < numTitlesPerThumbnail; i++) {
        // Select keywords for this title
        const selectedKeywords = selectKeywordsForTitle(seoKeywords, keyThemes, videoCategory);
        
        // Generate title components
        const hook = thumbnailText.text;
        const benefit = generateBenefitPhrase(i);
        const keywordPhrase = selectedKeywords.length > 0
          ? ` | ${selectedKeywords.join(' ')}`
          : '';
        
        // Create title using one of several patterns
        const title = createTitleWithPattern(hook, benefit, keywordPhrase, i % 3);
        
        // Generate rationale and rating
        const rationale = generateTitleRationale(title, thumbnailText.rating, selectedKeywords);
        const titleRating = calculateTitleRating(thumbnailText.rating, selectedKeywords.length);
        
        titleOptions.push({
          title,
          rating: titleRating,
          rationale,
          thumbnailTextId,
          seoKeywords: selectedKeywords,
        });
      }
    });
    
    // Generate additional standalone titles to reach at least 20 options
    const additionalTitlesNeeded = Math.max(0, 20 - titleOptions.length);
    generateAdditionalTitles(
      additionalTitlesNeeded,
      thumbnailTextOptions,
      seoKeywords,
      keyThemes,
      titleOptions
    );
    
    // Sort by rating (descending)
    return titleOptions.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Error generating enhanced title options:', error);
    return [];
  }
};

/**
 * Selects keywords for a title from available sources
 * @param seoKeywords SEO keywords
 * @param keyThemes Key themes
 * @param videoCategory Video category
 * @returns Array of selected keywords
 */
const selectKeywordsForTitle = (
  seoKeywords: string[],
  keyThemes: string[],
  videoCategory?: string
): string[] => {
  try {
    const selectedKeywords: string[] = [];
    
    // Add an SEO keyword if available
    if (seoKeywords && seoKeywords.length > 0) {
      selectedKeywords.push(getRandomItem(seoKeywords));
    }
    
    // Add a theme keyword if available
    if (keyThemes && keyThemes.length > 0 && Math.random() > 0.3) {
      const themeKeyword = getRandomItem(keyThemes);
      if (!selectedKeywords.includes(themeKeyword)) {
        selectedKeywords.push(themeKeyword);
      }
    }
    
    // Add category keyword if available
    if (videoCategory && Math.random() > 0.5) {
      if (!selectedKeywords.includes(videoCategory)) {
        selectedKeywords.push(videoCategory);
      }
    }
    
    return selectedKeywords;
  } catch (error) {
    console.error('Error selecting keywords for title:', error);
    return seoKeywords || [];
  }
};

/**
 * Creates a title using a specific pattern
 * @param hook The hook (thumbnail text)
 * @param benefit The benefit phrase
 * @param keywordPhrase The keyword phrase
 * @param patternIndex The pattern index to use
 * @returns A formatted title
 */
const createTitleWithPattern = (
  hook: string,
  benefit: string,
  keywordPhrase: string,
  patternIndex: number
): string => {
  try {
    if (!hook) hook = 'Video';
    if (!benefit) benefit = 'Improve Your Results';
    if (!keywordPhrase) keywordPhrase = '';
    
    let title: string;
    
    switch (patternIndex) {
      case 0:
        title = `${hook} - ${benefit}${keywordPhrase}`;
        break;
      case 1:
        title = `How to ${benefit} with ${hook}${keywordPhrase}`;
        break;
      default:
        title = `${benefit}: ${hook}${keywordPhrase}`;
    }
    
    // Ensure title is not too long (YouTube limit is around 100 characters)
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }
    
    return title;
  } catch (error) {
    console.error('Error creating title with pattern:', error);
    return `How to Improve Your Results${keywordPhrase || ''}`;
  }
};

/**
 * Calculates a title rating based on thumbnail rating and keyword count
 * @param thumbnailRating The rating of the thumbnail text
 * @param keywordCount The number of keywords in the title
 * @returns The calculated title rating
 */
const calculateTitleRating = (thumbnailRating: number, keywordCount: number): number => {
  try {
    if (isNaN(thumbnailRating) || thumbnailRating < 0) {
      console.warn('Invalid thumbnail rating:', thumbnailRating);
      thumbnailRating = 3; // Default to average rating
    }
    
    if (isNaN(keywordCount) || keywordCount < 0) {
      console.warn('Invalid keyword count:', keywordCount);
      keywordCount = 0;
    }
    
    const keywordBonus = keywordCount * 0.1;
    return Math.min(5, thumbnailRating + keywordBonus);
  } catch (error) {
    console.error('Error calculating title rating:', error);
    return 3; // Default to average rating in case of error
  }
};

/**
 * Generates additional titles to reach the minimum required count
 * @param count Number of additional titles to generate
 * @param thumbnailTextOptions All thumbnail text options
 * @param seoKeywords SEO keywords
 * @param keyThemes Key themes
 * @param titleOptions Array to add the new titles to
 */
/**
 * Generates additional titles to reach the minimum required count
 * @param count Number of additional titles to generate
 * @param thumbnailTextOptions All thumbnail text options
 * @param seoKeywords SEO keywords
 * @param keyThemes Key themes
 * @param titleOptions Array to add the new titles to
 */
const generateAdditionalTitles = (
  count: number,
  thumbnailTextOptions: ThumbnailText[],
  seoKeywords: string[],
  keyThemes: string[],
  titleOptions: TitleOption[]
): void => {
  try {
    if (!thumbnailTextOptions || thumbnailTextOptions.length === 0) {
      console.warn('No thumbnail text options provided for generating additional titles');
      return;
    }
    
    if (count <= 0) {
      return; // No additional titles needed
    }
    
    for (let i = 0; i < count; i++) {
      // Select random thumbnail text from top 15
      const randomThumbnailIndex = Math.floor(Math.random() * Math.min(15, thumbnailTextOptions.length));
      const randomThumbnail = thumbnailTextOptions[randomThumbnailIndex];
      
      // Select keywords
      const selectedKeywords = selectKeywordsForTitle(seoKeywords, keyThemes);
      
      // Generate title components
      const hook = i % 2 === 0 ? randomThumbnail.text : keyThemes[i % keyThemes.length];
      const benefit = generateBenefitPhrase(i + 10); // Use different benefit phrases
      const keywordPhrase = selectedKeywords.length > 0
        ? ` | ${selectedKeywords.join(' ')}`
        : '';
      
      // Create title with more variation
      let title = createAdditionalTitleWithPattern(hook, benefit, keywordPhrase, i % 5);
      
      // Generate rationale and rating
      const rationale = generateTitleRationale(title, randomThumbnail.rating, selectedKeywords);
      const keywordBonus = selectedKeywords.length * 0.1;
      const titleRating = Math.min(5, randomThumbnail.rating + keywordBonus - 0.2); // Slightly lower rating
      
      titleOptions.push({
        title,
        rating: titleRating,
        rationale,
        thumbnailTextId: randomThumbnailIndex,
        seoKeywords: selectedKeywords,
      });
    }
  } catch (error) {
    console.error('Error generating additional titles:', error);
  }
};

/**
 * Creates an additional title using a specific pattern
 * @param hook The hook (thumbnail text or theme)
 * @param benefit The benefit phrase
 * @param keywordPhrase The keyword phrase
 * @param patternIndex The pattern index to use
 * @returns A formatted title
 */
const createAdditionalTitleWithPattern = (
  hook: string,
  benefit: string,
  keywordPhrase: string,
  patternIndex: number
): string => {
  try {
    if (!hook) hook = 'Video';
    if (!benefit) benefit = 'Improve Your Results';
    if (!keywordPhrase) keywordPhrase = '';
    
    let title: string;
    
    switch (patternIndex) {
      case 0:
        title = `${hook} - ${benefit}${keywordPhrase}`;
        break;
      case 1:
        title = `How to ${benefit} with ${hook}${keywordPhrase}`;
        break;
      case 2:
        title = `${benefit}: ${hook}${keywordPhrase}`;
        break;
      case 3:
        title = `${hook}: The Ultimate Guide to ${benefit}${keywordPhrase}`;
        break;
      default:
        title = `${benefit} - ${hook} Explained${keywordPhrase}`;
    }
    
    // Ensure title is not too long
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }
    
    return title;
  } catch (error) {
    console.error('Error creating additional title with pattern:', error);
    return `How to Improve Your Results${keywordPhrase || ''}`;
  }
};

// Generate benefit phrases for titles
/**
 * Generates a benefit phrase for titles
 * @param index The index to use for selecting a phrase
 * @returns A benefit phrase
 */
const generateBenefitPhrase = (index: number): string => {
  try {
    // Use the constant TITLE_BENEFIT_PHRASES instead of redefining the array
    if (index < 0) {
      console.warn('Invalid index for benefit phrase:', index);
      index = 0;
    }
    
    return TITLE_BENEFIT_PHRASES[index % TITLE_BENEFIT_PHRASES.length];
  } catch (error) {
    console.error('Error generating benefit phrase:', error);
    return 'Improve Your Results'; // Default phrase in case of error
  }
};

// Generate rationale for title rating
/**
 * Generate rationale for title rating
 * @param title The title to analyze
 * @param thumbnailRating The rating of the associated thumbnail text
 * @param keywords Keywords used in the title
 * @returns A rationale string explaining the title's strengths and weaknesses
 */
const generateTitleRationale = (
  title: string,
  thumbnailRating: number,
  keywords: string[]
): string => {
  try {
    if (!title) return 'No title provided for analysis.';
    
    const keywordStrength = keywords && keywords.length > 1 ? 'strong' : keywords && keywords.length === 1 ? 'moderate' : 'weak';
    const titleLength = title.length;
    const lengthAssessment = titleLength > 80 ? 'long' : titleLength > 50 ? 'optimal' : 'concise';
    
    const hasEmotionalTrigger =
      title.includes('Transform') ||
      title.includes('Skyrocket') ||
      title.includes('Ultimate') ||
      title.includes('Breakthrough');
    
    const hasSpecificity =
      title.includes('How to') ||
      title.includes('Guide') ||
      title.includes('Steps') ||
      title.includes('Method');
    
    const hasBenefit =
      title.includes('Results') ||
      title.includes('Success') ||
      title.includes('Achieve') ||
      title.includes('Boost');
    
    if (thumbnailRating >= 4.5) {
      return `Excellent title with ${keywordStrength} SEO potential. ${lengthAssessment} length, paired with high-performing thumbnail text. ${hasEmotionalTrigger ? 'Strong emotional triggers' : 'Could use stronger emotional triggers'}. ${hasSpecificity ? 'Good specificity' : 'Could be more specific'}. ${hasBenefit ? 'Clear benefits' : 'Benefits could be clearer'}.`;
    } else if (thumbnailRating >= 4) {
      return `Strong title with ${keywordStrength} SEO potential. ${lengthAssessment} length, paired with well-performing thumbnail text. ${hasEmotionalTrigger ? 'Has emotional triggers' : 'Could use stronger emotional triggers'}. ${hasSpecificity ? 'Good specificity' : 'Could be more specific'}. ${hasBenefit ? 'Shows benefits' : 'Benefits could be clearer'}.`;
    } else if (thumbnailRating >= 3) {
      return `Decent title with ${keywordStrength} SEO potential. ${lengthAssessment} length, paired with moderately performing thumbnail text. ${hasEmotionalTrigger ? 'Some emotional appeal' : 'Lacks emotional triggers'}. ${hasSpecificity ? 'Has specificity' : 'Needs more specificity'}. ${hasBenefit ? 'Mentions benefits' : 'Benefits are unclear'}.`;
    } else {
      return `Basic title with ${keywordStrength} SEO potential. ${lengthAssessment} length, paired with lower-performing thumbnail text. Needs improvement in emotional triggers, specificity, and benefit clarity.`;
    }
  } catch (error) {
    console.error('Error generating title rationale:', error);
    return 'Title analysis could not be completed due to an error.';
  }
};

// Create recommended sets of thumbnail texts and titles
/**
 * Create recommended sets of thumbnail texts and titles
 * @param thumbnailTextOptions Array of thumbnail text options
 * @param titleOptions Array of title options
 * @returns Array of recommended thumbnail text and title sets
 */
const createRecommendedSets = (
  thumbnailTextOptions: ThumbnailText[],
  titleOptions: TitleOption[]
): TitleAndThumbnailSet[] => {
  try {
    if (!thumbnailTextOptions || thumbnailTextOptions.length === 0) {
      console.warn('No thumbnail text options provided for creating recommended sets');
      return [];
    }
    
    if (!titleOptions || titleOptions.length === 0) {
      console.warn('No title options provided for creating recommended sets');
      return [];
    }
    
    const recommendedSets: TitleAndThumbnailSet[] = [];
    
    // Take top 5 thumbnail texts
    const topThumbnailTexts = thumbnailTextOptions.slice(0, 5);
    
    // For each top thumbnail text, find matching titles
    topThumbnailTexts.forEach((thumbnailText, index) => {
      const thumbnailTextId = thumbnailTextOptions.findIndex(t => t.text === thumbnailText.text);
      
      // Find titles that match this thumbnail text
      const matchingTitles = titleOptions
        .filter(title => title.thumbnailTextId === thumbnailTextId)
        .map(title => title.title);
      
      // If no matching titles, use top titles
      const titles = matchingTitles.length > 0
        ? matchingTitles
        : titleOptions.slice(0, 3).map(title => title.title);
      
      recommendedSets.push({
        thumbnailText: thumbnailText.text,
        titles: titles.slice(0, 3), // Take up to 3 titles per thumbnail
      });
    });
    
    return recommendedSets;
  } catch (error) {
    console.error('Error creating recommended sets:', error);
    return [];
  }
};

// Generate video description
/**
 * Generates a video description with tags
 * @param videoContent The content summary or full script of the video
 * @param seoKeywords SEO keywords to include in the description and tags
 * @param topics Topics extracted from the video content
 * @param channelTheme Overall theme or focus of the YouTube channel
 * @returns Generated video description and tags
 */
const generateVideoDescription = (
  videoContent: string,
  seoKeywords: string[],
  topics: string[],
  channelTheme?: string
): VideoDescriptionSet => {
  try {
  // Extract topics from video content
  // Topics are now passed as a parameter, no need to extract them again
  
  // Generate description paragraphs
  const intro = `In this video, we explore ${topics.join(', ')} and provide actionable insights to help you succeed.`;
  
  const mainPoints = topics.map(topic => 
    `Learn how to master ${topic} with our proven strategies and expert tips.`
  ).join(' ');
  
  const callToAction = 'If you found this video helpful, please like, subscribe, and share with others who might benefit!';
  
  // Add timestamps (mock)
  const timestamps = [
    '0:00 - Introduction',
    '1:30 - Key Concepts',
    '3:45 - Step-by-Step Guide',
    '7:20 - Common Mistakes to Avoid',
    '10:15 - Advanced Strategies',
    '13:40 - Real-World Examples',
    '16:25 - Summary and Next Steps'
  ].join('\n');
  
  // Add links and social media
  const links = [
    '🌐 Website: https://example.com',
    '📱 Instagram: https://instagram.com/example',
    '🐦 Twitter: https://twitter.com/example',
    '📘 Facebook: https://facebook.com/example'
  ].join('\n');
  
    // Combine all sections
    const description = `${intro}\n\n${mainPoints}\n\n${timestamps}\n\n${callToAction}\n\n${links}`;
    
    // Generate tags from keywords and topics
    const tags = [...new Set([...seoKeywords, ...topics])];
    
    return {
      description,
      tags,
    };
  } catch (error) {
    console.error('Error generating video description:', error);
    return {
      description: 'Video description could not be generated due to an error.',
      tags: seoKeywords || []
    };
  }
};
// This section is removed as it's a duplicate of the analyzeReactionInterestLevel function
// that has been properly placed earlier in the file

/**
 * Generate rationale for thumbnail text rating
 * @param rating The rating to explain
 * @param text The thumbnail text being rated
 * @param personaReactions Reactions from different personas
 * @returns A rationale string explaining the rating
 */
const generateRatingRationale = (
  rating: number,
  text: string,
  personaReactions: { personaName: string; reaction: string }[]
): string => {
  try {
    if (!text) return 'No thumbnail text provided for analysis.';
    if (!personaReactions || personaReactions.length === 0) return 'No persona reactions available for analysis.';
    
    const positiveReactions = personaReactions.filter(r =>
      r.reaction.includes('Highly engaged') || r.reaction.includes('Interested')
    );
    
    const emotionalTriggers =
      text.includes('Shocking') ||
      text.includes('Unbelievable') ||
      text.includes('Revolutionary');
    
    const specificity = text.includes('system') ||
      text.includes('method') ||
      text.includes('framework') ||
      text.includes('formula');
    
    const benefitClear = text.includes('Transform') ||
      text.includes('Achieve') ||
      text.includes('Master') ||
      text.includes('Unlock');
    
    if (rating >= 4.5) {
      return `Exceptional appeal across personas. ${positiveReactions.length} of ${personaReactions.length} personas showed high engagement. Strong emotional triggers${emotionalTriggers ? ' present' : ' could be enhanced'}, clear specificity${specificity ? '' : ' could be improved'}, and compelling benefits${benefitClear ? '' : ' could be clearer'}.`;
    } else if (rating >= 4) {
      return `Strong appeal to most personas. ${positiveReactions.length} of ${personaReactions.length} personas showed interest. Good balance of emotional triggers${emotionalTriggers ? '' : ' could be enhanced'}, specificity${specificity ? '' : ' could be improved'}, and benefits${benefitClear ? '' : ' could be clearer'}.`;
    } else if (rating >= 3) {
      return `Moderate appeal. Resonates with ${positiveReactions.length} of ${personaReactions.length} personas. ${emotionalTriggers ? 'Has emotional triggers' : 'Lacks strong emotional triggers'}, ${specificity ? 'good specificity' : 'could be more specific'}, and ${benefitClear ? 'clear benefits' : 'benefits could be clearer'}.`;
    } else {
      return `Limited appeal. Only resonates with ${positiveReactions.length} of ${personaReactions.length} personas. Needs stronger emotional triggers, more specificity, and clearer benefits.`;
    }
  } catch (error) {
    console.error('Error generating rating rationale:', error);
    return 'Thumbnail text analysis could not be completed due to an error.';
  }
};
// This section is removed as it's a duplicate of the extractTopics function
// that has been properly defined earlier in the file
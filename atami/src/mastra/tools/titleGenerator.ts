import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ThumbnailText {
  text: string;
  rating: number;
  rationale: string;
  personaReactions: {
    personaName: string;
    reaction: string;
  }[];
}

interface TitleOption {
  title: string;
  rating: number;
  rationale: string;
  thumbnailTextId: number;
}

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

interface TitleAndThumbnailSet {
  thumbnailText: string;
  titles: string[];
}

interface VideoDescriptionSet {
  description: string;
  tags: string[];
}

export const youtubeTitleGeneratorTool = createTool({
  id: 'youtube-title-generator',
  description: 'Generate engaging YouTube thumbnail text and titles based on video content',
  inputSchema: z.object({
    videoContent: z.string().describe('The content/transcript of the video'),
    seoKeywords: z.array(z.string()).optional().describe('SEO keywords to include in titles'),
    targetAudience: z.string().optional().describe('Description of the target audience'),
    videoCategory: z.string().optional().describe('Category of the video (e.g., tutorial, review, entertainment)'),
    channelTheme: z.string().optional().describe('Overall theme or focus of the YouTube channel'),
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
    })),
    recommendedSets: z.array(z.object({
      thumbnailText: z.string(),
      titles: z.array(z.string()),
    })),
    videoDescription: z.object({
      description: z.string(),
      tags: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    return await generateYouTubeTitlesAndThumbnails(
      context.videoContent,
      context.seoKeywords,
      context.targetAudience,
      context.videoCategory,
      context.channelTheme
    );
  },
});

// Main function to generate YouTube titles and thumbnails
const generateYouTubeTitlesAndThumbnails = async (
  videoContent: string,
  seoKeywords?: string[],
  targetAudience?: string,
  videoCategory?: string,
  channelTheme?: string
) => {
  // Step 1: Generate personas based on the video content
  const personas = generatePersonas(videoContent, targetAudience);
  
  // Step 2: Extract key themes, concepts, and shocking elements from the video
  const keyThemes = extractKeyThemes(videoContent);
  const shockingElements = extractShockingElements(videoContent);
  const benefitElements = extractBenefitElements(videoContent);
  const specificElements = extractSpecificElements(videoContent);
  
  // Step 3: Generate thumbnail text options
  const thumbnailTextOptions = generateThumbnailTextOptions(
    shockingElements,
    specificElements,
    benefitElements,
    personas
  );
  
  // Step 4: Generate title options for the top thumbnail texts
  const titleOptions = generateTitleOptions(
    thumbnailTextOptions,
    seoKeywords || [],
    keyThemes,
    videoCategory
  );
  
  // Step 5: Create recommended sets of thumbnail texts and titles
  const recommendedSets = createRecommendedSets(thumbnailTextOptions, titleOptions);
  
  // Step 6: Generate video description
  const videoDescription = generateVideoDescription(
    videoContent,
    seoKeywords || [],
    channelTheme
  );
  
  return {
    personas,
    thumbnailTextOptions,
    titleOptions,
    recommendedSets,
    videoDescription,
  };
};

// Helper function to generate personas
const generatePersonas = (
  videoContent: string,
  targetAudienceInfo?: string
): YouTubePersona[] => {
  // Extract topics and themes from the video content
  const topics = extractTopics(videoContent);
  
  // Define common viewer demographics based on content
  const personas: YouTubePersona[] = [];
  
  // Generate 3 distinct personas
  for (let i = 0; i < 3; i++) {
    const persona = createPersona(i, topics, videoContent, targetAudienceInfo);
    personas.push(persona);
  }
  
  return personas;
};

// Extract key topics from video content
const extractTopics = (content: string): string[] => {
  // In a real implementation, this would use NLP to extract key topics
  // This is a simplified version that just extracts common words
  
  // Normalize content
  const normalized = content.toLowerCase();
  
  // Remove common words and split
  const words = normalized.split(/\\s+/)
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
  
  return sortedWords;
};

// Create a single persona
const createPersona = (
  index: number,
  topics: string[],
  content: string,
  targetAudienceInfo?: string
): YouTubePersona => {
  // Define possible persona traits
  const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn'];
  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64'];
  const genders = ['Male', 'Female', 'Non-binary'];
  const occupations = [
    'Student', 'Professional', 'Entrepreneur', 'Freelancer', 'Manager',
    'Content Creator', 'Educator', 'Designer', 'Developer', 'Marketer'
  ];
  
  // Common interests based on content themes
  const commonInterests = [
    'Learning new skills', 'Professional growth', 'Self-improvement',
    'Staying updated on trends', 'Technology', 'Innovation', 'Productivity',
    'Career development', 'Social media', 'Digital marketing'
  ];
  
  // Common pain points
  const commonPainPoints = [
    'Information overload', 'Lack of time', 'Difficulty finding reliable sources',
    'Rapidly changing industry', 'Too many options to choose from', 'Fear of missing out',
    'Staying relevant', 'Work-life balance', 'Learning complex topics quickly'
  ];
  
  // Common goals
  const commonGoals = [
    'Master new skills', 'Advance career', 'Stay ahead of trends',
    'Find practical solutions', 'Increase productivity', 'Network with like-minded people',
    'Build authority in field', 'Implement best practices', 'Achieve specific outcomes'
  ];
  
  // YouTube viewing habits
  const viewingHabits = [
    'Regularly watches educational content during lunch breaks',
    'Binge-watches tutorials on weekends to learn new skills',
    'Subscribes to industry leaders and watches their content religiously',
    'Uses YouTube as primary learning resource for professional development',
    'Watches YouTube on mobile during commute or downtime',
    'Saves videos to watch later and organizes them by topic',
    'Actively engages with content by commenting and participating in discussions'
  ];
  
  // Create tailored interests, pain points, and goals based on topics
  const tailoredInterests = topics.map(topic => `Interest in ${topic}`);
  const tailoredPainPoints = topics.map(topic => `Struggling to master ${topic}`);
  const tailoredGoals = topics.map(topic => `Become proficient in ${topic}`);
  
  // Mix common and tailored traits
  const interests = [...commonInterests.slice(0, 3), ...tailoredInterests.slice(0, 2)];
  const painPoints = [...commonPainPoints.slice(0, 2), ...tailoredPainPoints.slice(0, 2)];
  const goals = [...commonGoals.slice(0, 2), ...tailoredGoals.slice(0, 2)];
  
  // Personalize based on index to ensure diversity
  return {
    name: names[index % names.length],
    age: ageRanges[index % ageRanges.length],
    gender: genders[index % genders.length],
    occupation: occupations[(index * 3) % occupations.length],
    interests: interests,
    painPoints: painPoints,
    goals: goals,
    viewingHabits: viewingHabits[index % viewingHabits.length]
  };
};

// Extract key themes from video content
const extractKeyThemes = (content: string): string[] => {
  // Mock implementation - in real usage, would implement NLP to extract themes
  const topics = extractTopics(content);
  const themes = topics.map(topic => {
    const variations = [
      `Understanding ${topic}`,
      `Mastering ${topic}`,
      `${topic} techniques`,
      `${topic} strategies`,
      `${topic} fundamentals`
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  });
  
  return themes;
};

// Extract shocking elements for thumbnail text
const extractShockingElements = (content: string): string[] => {
  // Mock implementation - would use sentiment analysis in real usage
  const shockingPhrases = [
    'Mind-blowing',
    'Shocking truth',
    'Unbelievable',
    'Never before seen',
    'Game-changer',
    'Revolutionary',
    'Insider secret',
    'Hidden method',
    'Jaw-dropping',
    'Industry disruptor',
    'Counterintuitive',
    'Secret formula',
    'Unexpected twist',
    'Forbidden technique',
    'Untold story',
    'Unknown hack',
    'Rare insight',
    'Breakthrough approach',
    'Ultimate revelation',
    'Expert confession'
  ];
  
  // Select a random subset
  const numPhrases = Math.min(10, shockingPhrases.length);
  const shuffled = [...shockingPhrases].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPhrases);
};

// Extract benefit elements for thumbnail text
const extractBenefitElements = (content: string): string[] => {
  // Mock implementation - would use more sophisticated NLP in real usage
  const benefitPhrases = [
    'Transform your results',
    'Skyrocket your success',
    'Double your performance',
    'Master the technique',
    'Achieve in days not months',
    'Get immediate results',
    'Eliminate common mistakes',
    'Never struggle again',
    'Save hours of time',
    'Beat the competition',
    'Fast-track your learning',
    'Outperform expectations',
    'Gain unfair advantage',
    'Level up instantly',
    'Become the expert',
    'Unlock new potential',
    'Simplify complex problems',
    'Overcome limitations',
    'Maximize your outcome',
    'Effortlessly succeed'
  ];
  
  // Select a random subset
  const numPhrases = Math.min(10, benefitPhrases.length);
  const shuffled = [...benefitPhrases].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPhrases);
};

// Extract specific elements for thumbnail text
const extractSpecificElements = (content: string): string[] => {
  // Extract topics
  const topics = extractTopics(content);
  
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
    `${topic} blueprint`
  ]);
  
  // Select a random subset
  const numPhrases = Math.min(10, specificPhrases.length);
  const shuffled = [...specificPhrases].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPhrases);
};

// Generate thumbnail text options
const generateThumbnailTextOptions = (
  shockingElements: string[],
  specificElements: string[],
  benefitElements: string[],
  personas: YouTubePersona[]
): ThumbnailText[] => {
  const thumbnailTexts: ThumbnailText[] = [];
  
  // Generate 30 thumbnail text options
  for (let i = 0; i < 30; i++) {
    // Select random elements for each component
    const shocking = shockingElements[i % shockingElements.length];
    const specific = specificElements[i % specificElements.length];
    const benefit = benefitElements[i % benefitElements.length];
    
    // Combine elements in different ways based on index
    let text: string;
    if (i % 3 === 0) {
      text = `${shocking}: ${specific}`;
    } else if (i % 3 === 1) {
      text = `${specific} → ${benefit}`;
    } else {
      text = `${shocking} ${specific}`;
    }
    
    // Generate persona reactions
    const personaReactions = personas.map(persona => {
      // Generate a reaction based on persona's interests and goals
      const reaction = generatePersonaReaction(persona, text);
      
      return {
        personaName: persona.name,
        reaction
      };
    });
    
    // Calculate rating based on persona reactions (1-5 scale)
    const personaInterestLevel = personaReactions.reduce((sum, reaction) => {
      // Analyze reaction for interest level
      const interestLevel = analyzeReactionInterestLevel(reaction.reaction);
      return sum + interestLevel;
    }, 0) / personas.length;
    
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
};

// Generate a persona reaction to thumbnail text
const generatePersonaReaction = (persona: YouTubePersona, text: string): string => {
  // Check if the text aligns with persona's interests or goals
  const interestMatch = persona.interests.some(interest => 
    text.toLowerCase().includes(interest.toLowerCase())
  );
  
  const goalMatch = persona.goals.some(goal =>
    text.toLowerCase().includes(goal.toLowerCase())
  );
  
  const painPointMatch = persona.painPoints.some(painPoint =>
    text.toLowerCase().includes(painPoint.toLowerCase())
  );
  
  // Generate reaction based on matches
  if (interestMatch && goalMatch) {
    return `Highly engaged - this directly addresses my interests in ${persona.interests[0]} and my goal to ${persona.goals[0]}`;
  } else if (interestMatch) {
    return `Interested - aligns with my passion for ${persona.interests[0]}`;
  } else if (goalMatch) {
    return `Attentive - helps me achieve my goal of ${persona.goals[0]}`;
  } else if (painPointMatch) {
    return `Curious - might help solve my problem with ${persona.painPoints[0]}`;
  } else {
    return `Somewhat interested - doesn't directly address my specific needs but could be useful`;
  }
};

// Analyze the interest level in a reaction (1-5 scale)
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

// Generate rationale for thumbnail text rating
const generateRatingRationale = (
  rating: number, 
  text: string, 
  personaReactions: { personaName: string; reaction: string }[]
): string => {
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
  
  const benefitPromise = text.includes('Transform') || 
    text.includes('Double') || 
    text.includes('Skyrocket') || 
    text.includes('Master');
  
  let rationale = '';
  
  if (rating >= 4.5) {
    rationale = `Exceptional balance of shock value, specificity, and benefit promise. Strongly appeals to ${positiveReactions.length} out of ${personaReactions.length} personas.`;
  } else if (rating >= 4) {
    rationale = `Strong appeal with good emotional triggers${emotionalTriggers ? '' : ' missing'}. Clear value proposition that resonates with most personas.`;
  } else if (rating >= 3.5) {
    rationale = `Above average engagement potential. ${specificity ? 'Good specificity' : 'Could be more specific'}, ${benefitPromise ? 'clear benefit' : 'benefit could be clearer'}.`;
  } else if (rating >= 3) {
    rationale = `Moderate appeal. Might attract some viewers but lacks ${!emotionalTriggers ? 'emotional impact' : ''}${!specificity ? ', specificity' : ''}${!benefitPromise ? ', clear benefit' : ''}.`;
  } else {
    rationale = `Limited appeal. Too generic or doesn't strongly connect with target personas' interests and goals.`;
  }
  
  return rationale;
};

// Generate title options
const generateTitleOptions = (
  thumbnailTexts: ThumbnailText[],
  seoKeywords: string[],
  keyThemes: string[],
  videoCategory?: string
): TitleOption[] => {
  const titleOptions: TitleOption[] = [];
  
  // Use top 3 thumbnail texts
  const topThumbnailTexts = thumbnailTexts.slice(0, 3);
  
  // Ensure we have at least some SEO keywords
  const effectiveSeoKeywords = seoKeywords.length > 0 ? 
    seoKeywords : 
    keyThemes.map(theme => theme.split(' ')[0]);
  
  // Generate 20 titles for each top thumbnail text
  topThumbnailTexts.forEach((thumbnailText, thumbnailIndex) => {
    for (let i = 0; i < 20; i++) {
      // Structure: shocking element + specific content + benefit + SEO
      const titleElements = {
        shocking: thumbnailText.text.split(':')[0],
        specific: keyThemes[i % keyThemes.length],
        benefit: generateBenefitPhrase(i),
        seo: effectiveSeoKeywords[i % effectiveSeoKeywords.length]
      };
      
      // Create title with different patterns
      let title: string;
      if (i % 4 === 0) {
        title = `${titleElements.shocking}: ${titleElements.specific} | ${titleElements.benefit} (${titleElements.seo})`;
      } else if (i % 4 === 1) {
        title = `${titleElements.shocking} ${titleElements.specific} That Will ${titleElements.benefit} | ${titleElements.seo}`;
      } else if (i % 4 === 2) {
        title = `How To ${titleElements.specific} - ${titleElements.shocking} Way To ${titleElements.benefit} | ${titleElements.seo}`;
      } else {
        title = `${titleElements.shocking} Approach To ${titleElements.specific}: ${titleElements.benefit} [${titleElements.seo}]`;
      }
      
      // Calculate rating (1-5 scale)
      // In a real implementation, this would use more advanced metrics
      const clickbaitLevel = titleElements.shocking.length > 8 ? 1 : 0.5;
      const specificityLevel = titleElements.specific.length > 10 ? 1 : 0.5;
      const benefitLevel = titleElements.benefit.includes('Transform') || titleElements.benefit.includes('Master') ? 1 : 0.5;
      const seoLevel = 1; // Assuming good SEO since we're using provided keywords
      
      const baseRating = 2; // Base rating
      const rating = Math.min(5, baseRating + clickbaitLevel + specificityLevel + benefitLevel + seoLevel);
      
      // Generate rationale
      const rationale = generateTitleRationale(title, rating, thumbnailText.rating);
      
      titleOptions.push({
        title,
        rating,
        rationale,
        thumbnailTextId: thumbnailIndex // Associate with the thumbnail text
      });
    }
  });
  
  // Sort by rating (descending)
  return titleOptions.sort((a, b) => b.rating - a.rating);
};

// Generate benefit phrase for title
const generateBenefitPhrase = (index: number): string => {
  const benefits = [
    'Transform Your Results',
    'Master This Skill Fast',
    'Outperform Competitors',
    'Change Your Approach Forever',
    'Achieve Breakthrough Results',
    'Save Hours Every Week',
    'Double Your Efficiency',
    'Eliminate Common Mistakes',
    'Accelerate Your Progress',
    'Unlock Hidden Potential',
    'Simplify Complex Problems',
    'Gain Expert Knowledge',
    'Stay Ahead of Trends',
    'Implement Like a Pro',
    'Overcome Key Challenges',
    'Maximize Your Impact',
    'Avoid Costly Errors',
    'Learn The Expert Way',
    'See Immediate Improvement',
    'Revolutionize Your Workflow'
  ];
  
  return benefits[index % benefits.length];
};

// Generate rationale for title rating
const generateTitleRationale = (
  title: string,
  rating: number,
  thumbnailRating: number
): string => {
  // Generate rationale based on title structure and rating
  let rationale = '';
  
  if (rating >= 4.5) {
    rationale = `Exceptional title with perfect balance of intrigue, specificity, and benefit. Strong SEO potential. Complements thumbnail text (rated ${thumbnailRating}) perfectly.`;
  } else if (rating >= 4) {
    rationale = `Strong title that generates curiosity while clearly communicating value. Good SEO incorporation. Works well with the thumbnail text.`;
  } else if (rating >= 3.5) {
    rationale = `Above average title with good elements. ${title.length > 50 ? 'Slightly long' : 'Good length'}. Decent match with thumbnail text rating of ${thumbnailRating}.`;
  } else if (rating >= 3) {
    rationale = `Moderate appeal. Would attract some clicks but ${title.includes('How To') ? 'uses common format' : 'could be more engaging'}. Acceptable pairing with thumbnail.`;
  } else {
    rationale = `Limited potential. Too ${title.length > 60 ? 'lengthy' : 'generic'} or doesn't create enough intrigue. Poor match with thumbnail text.`;
  }
  
  return rationale;
};

// Create recommended sets of thumbnail texts and titles
const createRecommendedSets = (
  thumbnailTexts: ThumbnailText[],
  titleOptions: TitleOption[]
): TitleAndThumbnailSet[] => {
  const recommendedSets: TitleAndThumbnailSet[] = [];
  
  // Get top 3 thumbnail texts
  const topThumbnailTexts = thumbnailTexts.slice(0, 3);
  
  // For each top thumbnail text, get the top 5 titles associated with it
  topThumbnailTexts.forEach((thumbnailText, index) => {
    const associatedTitles = titleOptions
      .filter(title => title.thumbnailTextId === index)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(title => title.title);
    
    recommendedSets.push({
      thumbnailText: thumbnailText.text,
      titles: associatedTitles
    });
  });
  
  return recommendedSets;
};

// Generate video description
const generateVideoDescription = (
  videoContent: string,
  seoKeywords: string[],
  channelTheme?: string
): VideoDescriptionSet => {
  // Extract key topics
  const topics = extractTopics(videoContent);
  
  // Generate description paragraphs
  const intro = `Discover ${topics[0]} strategies that will transform your approach to ${topics[1]}. This video breaks down the essential techniques you need to know.`;
  
  const mainBody = `
In this video, you'll learn:
- How to master ${topics[0]} effectively
- Key strategies for improving your ${topics[1]} skills
- Advanced techniques that most people overlook
- Common mistakes to avoid and how to fix them
- Practical steps to implement these methods immediately

Whether you're a beginner or experienced with ${topics[0]}, these insights will help you achieve better results faster.
`;

  const callToAction = `
If you found this video helpful, please like, comment, and subscribe for more content on ${channelTheme || topics[0]}!

Check out our related videos:
- Ultimate Guide to ${topics[0]}
- How to Master ${topics[1]} in Record Time
- ${topics[2]} Secrets Revealed

Visit our website for more resources: [Your Website]
`;

  const description = `${intro}\n${mainBody}\n${callToAction}`;
  
  // Generate tags from SEO keywords and topics
  const baseTags = [
    ...seoKeywords,
    ...topics,
    'how to',
    'tutorial',
    'guide',
    'learn',
    'tips',
    'tricks',
    'strategies'
  ];
  
  // Combine keywords into phrases
  const combinedTags = [
    `${topics[0]} tutorial`,
    `${topics[0]} guide`,
    `how to ${topics[0]}`,
    `${topics[1]} strategies`,
    `learn ${topics[0]}`,
    `${topics[0]} tips`,
    `best ${topics[0]} techniques`
  ];
  
  // Combine all tags and remove duplicates
  const allTags = [...new Set([...baseTags, ...combinedTags])];
  
  return {
    description,
    tags: allTags
  };
};
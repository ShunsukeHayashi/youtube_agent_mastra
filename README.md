# YouTube Mastra Agent

A powerful YouTube AI agent built with the Mastra.ai framework for channel analysis, content ideation, and optimization.

## Features

### 🎯 Channel Analysis
- Comprehensive channel performance metrics
- Content pattern identification
- Competitor analysis
- Growth recommendations

### 💡 Video Ideation
- Trend-based content ideas
- Niche-specific suggestions
- Content calendar generation
- Viral hook creation

### 🚀 Content Optimization
- SEO-optimized titles and descriptions
- Tag generation
- Thumbnail concepts
- Engagement optimization

## Prerequisites

- Node.js >= 20.0.0
- YouTube Data API v3 key
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-mastra-agent.git
cd youtube-mastra-agent
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Usage

### Development Mode

Start the Mastra development server:
```bash
npm run dev
```

### Build

Build the project:
```bash
npm run build
```

### Example Usage

```typescript
import { mastra } from './src/index.js';

// Analyze a YouTube channel
const channelAnalysis = await mastra.workflows.channelAnalysis.run({
  channelId: 'UCxxxxxxxx',
  analysisDepth: 'comprehensive',
});

// Generate video ideas
const videoIdeas = await mastra.workflows.videoIdeation.run({
  topic: 'Web Development Tutorials',
  channelNiche: 'Programming Education',
  targetAudience: 'Beginner developers',
  numberOfIdeas: 5,
});

// Optimize content
const optimizedContent = await mastra.workflows.contentOptimization.run({
  videoTopic: 'Learn React in 2024',
  targetKeywords: ['react tutorial', 'react for beginners', 'learn react'],
});
```

## Project Structure

```
youtube-mastra-agent/
├── src/
│   ├── agents/          # AI agents for different tasks
│   ├── tools/           # Tools for YouTube API and content generation
│   ├── workflows/       # Multi-step workflows
│   ├── lib/            # Utility functions and services
│   └── index.ts        # Main entry point
├── examples/           # Usage examples
├── tests/             # Test files
└── package.json       # Dependencies and scripts
```

## API Documentation

### Agents

#### Channel Analysis Agent
Analyzes YouTube channels for performance insights and growth recommendations.

#### Video Ideation Agent
Generates creative video ideas based on trends and channel analysis.

#### Content Optimization Agent
Optimizes titles, descriptions, tags, and thumbnails for maximum reach.

### Workflows

#### Channel Analysis Workflow
```typescript
Input: {
  channelId: string,
  analysisDepth: 'basic' | 'detailed' | 'comprehensive',
  competitorChannels?: string[]
}

Output: {
  channelMetrics: ChannelMetrics,
  performanceAnalysis: string,
  recommendations: string[],
  competitiveInsights?: string
}
```

#### Video Ideation Workflow
```typescript
Input: {
  topic: string,
  channelNiche: string,
  targetAudience: string,
  numberOfIdeas: number,
  includeTraends: boolean
}

Output: {
  ideas: VideoIdea[],
  trendingTopics?: string[],
  contentCalendar?: string
}
```

#### Content Optimization Workflow
```typescript
Input: {
  videoTopic: string,
  currentTitle?: string,
  currentDescription?: string,
  targetKeywords: string[],
  competitorVideos?: string[]
}

Output: {
  optimizedTitle: OptimizedTitle,
  optimizedDescription: string,
  tags: string[],
  thumbnailConcepts: string[],
  seoScore: number
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Mastra.ai](https://mastra.ai)
- Uses YouTube Data API v3
- Powered by OpenAI GPT-4
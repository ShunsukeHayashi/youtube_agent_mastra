# YouTube Mastra Agent - Setup Guide

## 🎯 Quick Start

The YouTube Mastra Agent is now set up and ready to use! This AI-powered system helps with YouTube channel analysis, content ideation, and optimization.

## 📁 Project Structure Created

```
youtube-mastra-agent/
├── src/
│   ├── agents/              # AI Agents
│   │   ├── channelAnalysis.ts
│   │   ├── videoIdeation.ts
│   │   └── contentOptimization.ts
│   ├── tools/               # Tools for API integration
│   │   ├── youtubeAnalytics.ts
│   │   └── contentGenerator.ts
│   ├── workflows/           # Multi-step workflows
│   │   ├── channelAnalysis.ts
│   │   ├── videoIdeation.ts
│   │   └── contentOptimization.ts
│   ├── lib/                # Utilities
│   │   └── youtube.ts
│   └── mastra/             # Mastra configuration
│       └── index.ts
├── examples/               # Example usage
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 🚀 Next Steps

### 1. Configure API Keys

Edit the `.env` file and add your actual API keys:

```bash
YOUTUBE_API_KEY=your_actual_youtube_api_key
OPENAI_API_KEY=your_actual_openai_api_key
```

### 2. Run the Development Server

```bash
npm run dev
```

The Mastra dev server will start (ignore the telemetry error - it's a known issue that doesn't affect functionality).

### 3. Access the API

Once running, you can access:
- API Documentation: http://localhost:4111/api
- Swagger UI: http://localhost:4111/swagger

### 4. Use the Workflows

#### Channel Analysis
```typescript
const result = await mastra.workflows.channelAnalysis.run({
  channelId: 'UCxxxxxxxx',
  analysisDepth: 'comprehensive'
});
```

#### Video Ideation
```typescript
const ideas = await mastra.workflows.videoIdeation.run({
  topic: 'Web Development',
  channelNiche: 'Programming',
  targetAudience: 'Beginners',
  numberOfIdeas: 5
});
```

#### Content Optimization
```typescript
const optimized = await mastra.workflows.contentOptimization.run({
  videoTopic: 'React Tutorial',
  targetKeywords: ['react', 'javascript', 'tutorial']
});
```

## 🛠️ Features Implemented

### Agents
- **Channel Analysis Agent**: Analyzes YouTube channels for performance insights
- **Video Ideation Agent**: Generates creative video ideas based on trends
- **Content Optimization Agent**: Optimizes titles, descriptions, and tags

### Tools
- **YouTube Analytics Tool**: Interfaces with YouTube Data API v3
- **Content Generator Tool**: Uses OpenAI for content creation

### Workflows
- **Channel Analysis Workflow**: Full channel performance analysis
- **Video Ideation Workflow**: Trend-based content ideation
- **Content Optimization Workflow**: Complete content optimization pipeline

## 📝 Notes

- The telemetry error on startup is a known Mastra issue and doesn't affect functionality
- Make sure to use valid API keys for full functionality
- The system uses GPT-4 Turbo for optimal results but can be configured to use other models

## 🔗 Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [OpenAI API](https://platform.openai.com/docs)
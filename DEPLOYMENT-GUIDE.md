# YouTube Mastra Agent - Deployment Guide for Mastra Cloud

## 🚀 Deploy to Mastra Cloud

Follow these steps to deploy your YouTube Mastra Agent to Mastra Cloud:

### Step 1: Create GitHub Repository

The project is already committed to Git. Now push to GitHub:

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/yourusername/youtube-mastra-agent.git
git branch -M main
git push -u origin main
```

### Step 2: Access Mastra Cloud

1. Go to [cloud.mastra.ai](https://cloud.mastra.ai/)
2. Sign in with your GitHub account
3. Install the Mastra GitHub app when prompted

### Step 3: Create New Project

1. Click **"Create new project"** button
2. Search for your `youtube-mastra-agent` repository
3. Click **"Import"**

### Step 4: Configure Deployment Settings

Mastra Cloud will automatically detect the configuration, but verify these settings:

#### Build Settings (Auto-detected)
- **Framework**: Mastra
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables
Add these in the Mastra Cloud dashboard:

```
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
MASTRA_LOG_LEVEL=info
NODE_ENV=production
```

### Step 5: Deploy

1. Review your configuration
2. Click **"Deploy Project"**
3. Wait for build and deployment to complete

## 📋 Project Structure for Mastra Cloud

The project is optimized for Mastra Cloud with:

```
youtube-mastra-agent/
├── src/mastra/index.ts      # Main Mastra configuration
├── mastra.config.ts         # Deployment configuration
├── package.json             # Dependencies and scripts
├── .env.production          # Production environment template
├── Dockerfile               # Container configuration
└── vercel.json             # Alternative deployment config
```

## 🔧 Configuration Files

### `mastra.config.ts`
- Deployment platform: `mastra-cloud`
- Auto-scaling enabled
- Memory: 512MB, Timeout: 30s
- Regions: us-east-1

### Environment Variables
- **Required**: `YOUTUBE_API_KEY`, `OPENAI_API_KEY`
- **Optional**: `MASTRA_LOG_LEVEL`, `UPSTASH_URL`, `UPSTASH_TOKEN`

## 📊 Features Available After Deployment

### REST API Endpoints
Your deployed agent will expose these endpoints:

- **POST** `/api/agents/channel-analysis` - Channel analysis
- **POST** `/api/agents/video-ideation` - Video idea generation
- **POST** `/api/agents/content-optimization` - Content optimization
- **POST** `/api/workflows/channel-analysis` - Full channel analysis workflow
- **POST** `/api/workflows/video-ideation` - Video ideation workflow
- **POST** `/api/workflows/content-optimization` - Content optimization workflow

### Monitoring & Observability
- Real-time logs in Mastra Cloud dashboard
- Performance metrics and analytics
- Error tracking and debugging tools
- Agent execution traces

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Atomic deployments ensure zero downtime
- Rollback capabilities for quick recovery

## 🌐 Alternative Deployment Options

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Cloudflare Workers
```bash
npm install @mastra/deployer-cloudflare
npm run deploy:cloudflare
```

### Self-hosted
```bash
npm run build
npm start
```

## 📝 API Usage Examples

After deployment, use your endpoints:

```javascript
// Channel Analysis
const response = await fetch('https://your-domain.mastra.ai/api/workflows/channel-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelId: 'UCxxxxxxxx',
    analysisDepth: 'detailed'
  })
});

// Video Ideation
const ideas = await fetch('https://your-domain.mastra.ai/api/workflows/video-ideation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'JavaScript Tutorial',
    channelNiche: 'Programming',
    targetAudience: 'Beginners',
    numberOfIdeas: 5
  })
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Node.js version (≥20.0.0)
   - Review build logs in dashboard

2. **API Key Errors**
   - Ensure YouTube Data API v3 is enabled
   - Verify OpenAI API key has sufficient credits
   - Check API key permissions

3. **Memory/Timeout Issues**
   - Increase memory allocation in config
   - Optimize workflow steps
   - Consider breaking large operations into smaller chunks

### Support

- Mastra Documentation: [mastra.ai/docs](https://mastra.ai/docs)
- GitHub Issues: Report bugs and feature requests
- Community Discord: Join for real-time support

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Mastra Cloud account created
- [ ] GitHub app installed
- [ ] Project imported to Mastra Cloud
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] API endpoints tested
- [ ] Monitoring dashboard reviewed

Your YouTube Mastra Agent is now live on Mastra Cloud! 🎉
import { defineConfig } from 'mastra';

export default defineConfig({
  name: 'youtube-mastra-agent',
  version: '1.0.0',
  description: 'YouTube AI Agent for channel analysis, content ideation, and optimization',
  
  // Environment configuration
  environment: {
    development: {
      port: 4111,
      debug: true
    },
    production: {
      port: process.env.PORT || 3000,
      debug: false
    }
  },

  // Build configuration for Mastra Cloud
  build: {
    outDir: 'dist',
    entry: 'src/mastra/index.ts',
    target: 'node',
    format: 'esm'
  },

  // Required environment variables
  env: {
    required: [
      'YOUTUBE_API_KEY',
      'OPENAI_API_KEY'
    ],
    optional: [
      'MASTRA_LOG_LEVEL',
      'UPSTASH_URL',
      'UPSTASH_TOKEN'
    ]
  },

  // API configuration
  api: {
    enabled: true,
    cors: {
      origin: ['http://localhost:3000', 'https://cloud.mastra.ai'],
      credentials: true
    }
  },

  // Telemetry and monitoring
  telemetry: {
    enabled: true,
    endpoint: process.env.MASTRA_TELEMETRY_ENDPOINT
  },

  // Deployment settings
  deployment: {
    platform: 'mastra-cloud',
    autoScale: true,
    regions: ['us-east-1'],
    resources: {
      memory: '512MB',
      timeout: '30s'
    }
  }
});
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Ensure we're using ESM imports correctly
const { youtube, youtubeAnalytics } = google;

// OAuth configuration
let oauthClient: OAuth2Client | null = null;

/**
 * Initialize OAuth2 client with credentials
 * In a real implementation, you would store these securely and not hardcode them
 */
export function initializeGoogleAuth(credentials?: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}) {
  // Check if we should use mock APIs
  if (process.env.MOCK_APIS === 'true') {
    console.log('MOCK_APIS=true, using mock data for Google APIs');
    return null;
  }
  
  // Use provided credentials or attempt to use environment variables
  const clientId = credentials?.clientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = credentials?.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = credentials?.redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
  const refreshToken = credentials?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
  
  if (!clientId || !clientSecret) {
    console.warn('Google OAuth credentials not provided. Analytics API will use mock data.');
    return null;
  }

  try {
    oauthClient = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Set refresh token if available
    if (refreshToken) {
      oauthClient.setCredentials({
        refresh_token: refreshToken
      });
      console.log('Google OAuth client initialized with refresh token');
    } else {
      console.warn('No refresh token provided, OAuth client may require user authentication');
    }

    return oauthClient;
  } catch (error) {
    console.error('Error initializing Google OAuth client:', error);
    return null;
  }
}

/**
 * Get or initialize OAuth client
 */
export function getOAuthClient(): OAuth2Client | null {
  if (!oauthClient) {
    return initializeGoogleAuth();
  }
  return oauthClient;
}

/**
 * Get YouTube Analytics API v2 initialized with OAuth
 */
export function getYoutubeAnalyticsApi() {
  return google.youtubeAnalytics({
    version: 'v2',
    auth: getOAuthClient()
  });
}

/**
 * Generate authentication URL for user to authorize app
 */
export function getAuthUrl(): string {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('OAuth client not initialized');
  }
  
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    prompt: 'consent'
  });
}

/**
 * Exchange authorization code for tokens
 * @param code The authorization code from OAuth redirect
 */
export async function getTokensFromCode(code: string) {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('OAuth client not initialized');
  }
  
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  
  return tokens;
}

/**
 * Mock implementation for YouTube Analytics API
 * Used when no auth credentials are available or for testing
 */
export const mockYoutubeAnalytics = {
  reports: {
    query: async ({
      ids,
      startDate,
      endDate,
      metrics,
      dimensions,
      filters
    }: {
      ids: string;
      startDate: string;
      endDate: string;
      metrics: string;
      dimensions?: string;
      filters?: string;
    }) => {
      console.log('Using mock YouTube Analytics API');
      console.log('Request params:', { ids, startDate, endDate, metrics, dimensions, filters });
      
      // Channel ID from the ids parameter (e.g., "channel==UC123456789")
      const channelId = ids.split('==')[1] || 'MOCK_CHANNEL';
      
      // Parse metrics to determine what data to return
      const metricsList = metrics.split(',');
      
      // Parse dimensions to determine how to structure the data
      const isDimensionDay = dimensions === 'day';
      
      // Check if this is for a specific video
      const isVideoSpecific = filters && filters.startsWith('video==');
      const videoId = isVideoSpecific ? filters!.split('==')[1] : null;
      
      // Generate mock data
      const rows = generateMockAnalyticsData(
        startDate,
        endDate,
        metricsList,
        isDimensionDay,
        isVideoSpecific
      );
      
      // Create column headers based on requested metrics
      const columnHeaders = [
        ...(isDimensionDay ? [{ name: 'day' }] : []),
        ...metricsList.map(metric => ({ name: metric }))
      ];
      
      return {
        data: {
          kind: 'youtubeAnalytics#resultTable',
          columnHeaders,
          rows
        }
      };
    }
  }
};

/**
 * Generate mock analytics data based on parameters
 */
function generateMockAnalyticsData(
  startDate: string,
  endDate: string,
  metrics: string[],
  isDimensionDay: boolean,
  isVideoSpecific: boolean
): any[] {
  // Convert dates to timestamps
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  // Calculate number of days in the range
  const dayCount = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
  
  // Generate daily or aggregate data
  if (isDimensionDay) {
    // Generate daily data
    return Array.from({ length: dayCount }, (_, i) => {
      const currentDate = new Date(start + i * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Base values slightly higher for older data to simulate decline in interest
      const viewsFactor = Math.max(0.7, 1 - (i / dayCount) * 0.5);
      const randomFactor = 0.7 + Math.random() * 0.6; // Random factor between 0.7 and 1.3
      
      // Return row with date and metrics
      return [
        dateString,
        // Views - between 100-1000 for channel, 10-100 for video
        ...metrics.includes('views') ? 
          [Math.floor((isVideoSpecific ? 50 : 500) * viewsFactor * randomFactor)] : [],
        // Average view duration in seconds - between 60-300 seconds
        ...metrics.includes('averageViewDuration') ?
          [Math.floor((120 + Math.random() * 180) * randomFactor)] : [],
        // Estimated minutes watched - views * averageViewDuration / 60
        ...metrics.includes('estimatedMinutesWatched') ?
          [Math.floor((isVideoSpecific ? 50 : 500) * viewsFactor * randomFactor * (120 + Math.random() * 180) / 60)] : [],
        // Click-through rate - between 2-10%
        ...metrics.includes('cardClickRate') ?
          [Math.round((2 + Math.random() * 8) * 100) / 100] : []
      ];
    });
  } else {
    // Generate aggregate data
    // Base values
    const viewsBase = isVideoSpecific ? 50 * dayCount : 500 * dayCount;
    const randomFactor = 0.7 + Math.random() * 0.6;
    
    // Return a single row with aggregate metrics
    return [[
      // Views - based on dayCount
      ...metrics.includes('views') ? 
        [Math.floor(viewsBase * randomFactor)] : [],
      // Average view duration in seconds - between 60-300 seconds
      ...metrics.includes('averageViewDuration') ?
        [Math.floor((120 + Math.random() * 180) * randomFactor)] : [],
      // Estimated minutes watched - views * averageViewDuration / 60
      ...metrics.includes('estimatedMinutesWatched') ?
        [Math.floor(viewsBase * randomFactor * (120 + Math.random() * 180) / 60)] : [],
      // Click-through rate - between 2-10%
      ...metrics.includes('cardClickRate') ?
        [Math.round((2 + Math.random() * 8) * 100) / 100] : []
    ]];
  }
}

/**
 * Get YouTube Analytics API instance - returns mock if auth not available
 */
export function getYoutubeAnalytics() {
  // Always use mock if MOCK_APIS is true
  if (process.env.MOCK_APIS === 'true') {
    console.log('Using mock YouTube Analytics API (MOCK_APIS=true)');
    return mockYoutubeAnalytics;
  }
  
  // Use real API if OAuth client is available, otherwise use mock
  if (oauthClient) {
    console.log('Using real YouTube Analytics API with OAuth');
    return getYoutubeAnalyticsApi();
  } else {
    console.log('OAuth client not available, using mock YouTube Analytics API');
    return mockYoutubeAnalytics;
  }
}
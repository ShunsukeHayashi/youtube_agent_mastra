import { youtubeAnalyticsTool } from '../youtubeAnalytics';
import { YouTubeService } from '../../lib/youtube';

jest.mock('../../lib/youtube');

describe('YouTubeAnalyticsTool', () => {
  let mockYouTubeService: jest.Mocked<YouTubeService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock the YouTubeService constructor
    mockYouTubeService = {
      getChannelInfo: jest.fn(),
      getChannelVideos: jest.fn(),
      getVideoDetails: jest.fn(),
      searchVideos: jest.fn(),
      getTrendingVideos: jest.fn()
    } as any;

    (YouTubeService as jest.Mock).mockImplementation(() => mockYouTubeService);

    // Set up environment
    process.env.YOUTUBE_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    delete process.env.YOUTUBE_API_KEY;
  });

  describe('execute', () => {
    it('should return error when API key is not configured', async () => {
      delete process.env.YOUTUBE_API_KEY;

      const result = await youtubeAnalyticsTool.execute({
        action: 'channel',
        channelId: 'UC123'
      });

      expect(result).toEqual({
        success: false,
        data: null,
        error: 'YouTube API key not configured'
      });
    });

    describe('channel action', () => {
      it('should fetch channel info and videos', async () => {
        const mockChannelInfo = {
          id: 'UC123',
          snippet: { title: 'Test Channel' },
          statistics: { subscriberCount: '1000' }
        };
        const mockVideos = [
          { id: { videoId: 'video1' }, snippet: { title: 'Video 1' } }
        ];

        mockYouTubeService.getChannelInfo.mockResolvedValue(mockChannelInfo);
        mockYouTubeService.getChannelVideos.mockResolvedValue(mockVideos);

        const result = await youtubeAnalyticsTool.execute({
          action: 'channel',
          channelId: 'UC123'
        });

        expect(result).toEqual({
          success: true,
          data: {
            channel: mockChannelInfo,
            videos: mockVideos
          }
        });
        expect(mockYouTubeService.getChannelInfo).toHaveBeenCalledWith('UC123');
        expect(mockYouTubeService.getChannelVideos).toHaveBeenCalledWith('UC123');
      });

      it('should return error when channelId is missing', async () => {
        const result = await youtubeAnalyticsTool.execute({
          action: 'channel'
        });

        expect(result).toEqual({
          success: false,
          data: null,
          error: 'Channel ID is required for channel analysis'
        });
      });
    });

    describe('video action', () => {
      it('should fetch video details', async () => {
        const mockVideoDetails = [{
          id: 'video1',
          snippet: { title: 'Test Video' },
          statistics: { viewCount: '1000' }
        }];

        mockYouTubeService.getVideoDetails.mockResolvedValue(mockVideoDetails);

        const result = await youtubeAnalyticsTool.execute({
          action: 'video',
          videoId: 'video1'
        });

        expect(result).toEqual({
          success: true,
          data: mockVideoDetails[0]
        });
        expect(mockYouTubeService.getVideoDetails).toHaveBeenCalledWith(['video1']);
      });

      it('should return error when videoId is missing', async () => {
        const result = await youtubeAnalyticsTool.execute({
          action: 'video'
        });

        expect(result).toEqual({
          success: false,
          data: null,
          error: 'Video ID is required for video analysis'
        });
      });
    });

    describe('search action', () => {
      it('should search videos', async () => {
        const mockSearchResults = [
          { id: { videoId: 'result1' }, snippet: { title: 'Result 1' } }
        ];

        mockYouTubeService.searchVideos.mockResolvedValue(mockSearchResults);

        const result = await youtubeAnalyticsTool.execute({
          action: 'search',
          query: 'test query'
        });

        expect(result).toEqual({
          success: true,
          data: mockSearchResults
        });
        expect(mockYouTubeService.searchVideos).toHaveBeenCalledWith('test query');
      });

      it('should return error when query is missing', async () => {
        const result = await youtubeAnalyticsTool.execute({
          action: 'search'
        });

        expect(result).toEqual({
          success: false,
          data: null,
          error: 'Query is required for search'
        });
      });
    });

    describe('trending action', () => {
      it('should fetch trending videos with default region', async () => {
        const mockTrendingVideos = [
          { id: 'trend1', snippet: { title: 'Trending Video' } }
        ];

        mockYouTubeService.getTrendingVideos.mockResolvedValue(mockTrendingVideos);

        const result = await youtubeAnalyticsTool.execute({
          action: 'trending'
        });

        expect(result).toEqual({
          success: true,
          data: mockTrendingVideos
        });
        expect(mockYouTubeService.getTrendingVideos).toHaveBeenCalledWith('JP');
      });

      it('should fetch trending videos with custom region', async () => {
        const mockTrendingVideos = [];

        mockYouTubeService.getTrendingVideos.mockResolvedValue(mockTrendingVideos);

        const result = await youtubeAnalyticsTool.execute({
          action: 'trending',
          regionCode: 'US'
        });

        expect(mockYouTubeService.getTrendingVideos).toHaveBeenCalledWith('US');
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error');
      mockYouTubeService.getChannelInfo.mockRejectedValue(error);

      const result = await youtubeAnalyticsTool.execute({
        action: 'channel',
        channelId: 'UC123'
      });

      expect(result).toEqual({
        success: false,
        data: null,
        error: 'API Error'
      });
    });

    it('should handle invalid action', async () => {
      const result = await youtubeAnalyticsTool.execute({
        action: 'invalid' as any
      });

      expect(result).toEqual({
        success: false,
        data: null,
        error: 'Invalid action'
      });
    });
  });
});
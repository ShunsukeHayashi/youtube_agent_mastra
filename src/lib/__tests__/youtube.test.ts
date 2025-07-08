import { YouTubeService } from '../youtube';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn(() => ({
      channels: {
        list: jest.fn()
      },
      search: {
        list: jest.fn()
      },
      videos: {
        list: jest.fn()
      }
    }))
  }
}));

describe('YouTubeService', () => {
  let service: YouTubeService;
  let mockYouTube: any;

  beforeEach(() => {
    service = new YouTubeService('test_api_key');
    mockYouTube = (google.youtube as jest.Mock).mock.results[0].value;
  });

  describe('getChannelInfo', () => {
    it('should fetch channel information successfully', async () => {
      const mockChannelData = {
        data: {
          items: [{
            id: 'UC123',
            snippet: {
              title: 'Test Channel',
              description: 'Test Description'
            },
            statistics: {
              subscriberCount: '1000',
              viewCount: '10000',
              videoCount: '50'
            }
          }]
        }
      };

      mockYouTube.channels.list.mockResolvedValue(mockChannelData);

      const result = await service.getChannelInfo('UC123');

      expect(mockYouTube.channels.list).toHaveBeenCalledWith({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: ['UC123']
      });
      expect(result).toEqual(mockChannelData.data.items[0]);
    });

    it('should return null if channel not found', async () => {
      mockYouTube.channels.list.mockResolvedValue({ data: { items: [] } });

      const result = await service.getChannelInfo('invalid_id');

      expect(result).toBeNull();
    });

    it('should throw error on API failure', async () => {
      const error = new Error('API Error');
      mockYouTube.channels.list.mockRejectedValue(error);

      await expect(service.getChannelInfo('UC123')).rejects.toThrow('API Error');
    });
  });

  describe('getChannelVideos', () => {
    it('should fetch channel videos with default parameters', async () => {
      const mockVideos = {
        data: {
          items: [
            { id: { videoId: 'video1' }, snippet: { title: 'Video 1' } },
            { id: { videoId: 'video2' }, snippet: { title: 'Video 2' } }
          ]
        }
      };

      mockYouTube.search.list.mockResolvedValue(mockVideos);

      const result = await service.getChannelVideos('UC123');

      expect(mockYouTube.search.list).toHaveBeenCalledWith({
        part: ['snippet'],
        channelId: 'UC123',
        maxResults: 50,
        order: 'date',
        type: ['video']
      });
      expect(result).toEqual(mockVideos.data.items);
    });

    it('should fetch videos with custom maxResults', async () => {
      mockYouTube.search.list.mockResolvedValue({ data: { items: [] } });

      await service.getChannelVideos('UC123', 10);

      expect(mockYouTube.search.list).toHaveBeenCalledWith(
        expect.objectContaining({ maxResults: 10 })
      );
    });
  });

  describe('getVideoDetails', () => {
    it('should fetch details for multiple videos', async () => {
      const mockVideoDetails = {
        data: {
          items: [
            {
              id: 'video1',
              snippet: { title: 'Video 1' },
              statistics: { viewCount: '1000' }
            },
            {
              id: 'video2',
              snippet: { title: 'Video 2' },
              statistics: { viewCount: '2000' }
            }
          ]
        }
      };

      mockYouTube.videos.list.mockResolvedValue(mockVideoDetails);

      const result = await service.getVideoDetails(['video1', 'video2']);

      expect(mockYouTube.videos.list).toHaveBeenCalledWith({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: ['video1', 'video2']
      });
      expect(result).toEqual(mockVideoDetails.data.items);
    });
  });

  describe('searchVideos', () => {
    it('should search videos with query', async () => {
      const mockSearchResults = {
        data: {
          items: [
            { id: { videoId: 'result1' }, snippet: { title: 'Result 1' } }
          ]
        }
      };

      mockYouTube.search.list.mockResolvedValue(mockSearchResults);

      const result = await service.searchVideos('test query');

      expect(mockYouTube.search.list).toHaveBeenCalledWith({
        part: ['snippet'],
        q: 'test query',
        maxResults: 10,
        type: ['video'],
        order: 'relevance'
      });
      expect(result).toEqual(mockSearchResults.data.items);
    });
  });

  describe('getTrendingVideos', () => {
    it('should fetch trending videos for default region', async () => {
      const mockTrendingVideos = {
        data: {
          items: [
            { id: 'trend1', snippet: { title: 'Trending 1' } }
          ]
        }
      };

      mockYouTube.videos.list.mockResolvedValue(mockTrendingVideos);

      const result = await service.getTrendingVideos();

      expect(mockYouTube.videos.list).toHaveBeenCalledWith({
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode: 'JP',
        maxResults: 20
      });
      expect(result).toEqual(mockTrendingVideos.data.items);
    });

    it('should fetch trending videos with category', async () => {
      mockYouTube.videos.list.mockResolvedValue({ data: { items: [] } });

      await service.getTrendingVideos('US', '10');

      expect(mockYouTube.videos.list).toHaveBeenCalledWith(
        expect.objectContaining({
          regionCode: 'US',
          videoCategoryId: '10'
        })
      );
    });
  });
});
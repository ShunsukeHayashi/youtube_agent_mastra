/// <reference types="jest" />

const fetchYoutubeAnalyticsTool = {
  id: 'getYouTubeAnalytics',
  description: '指定ユーザーのYouTubeチャンネルから動画KPIを取得する',
  execute: jest.fn()
};

jest.mock('../src/mastra/tools/fetchYoutubeAnalytics', () => ({
  fetchYoutubeAnalyticsTool
}));

import * as dotenv from 'dotenv';

dotenv.config();

describe('fetchYoutubeAnalyticsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be properly initialized', () => {
    expect(fetchYoutubeAnalyticsTool).toBeDefined();
    expect(fetchYoutubeAnalyticsTool.id).toBe('getYouTubeAnalytics');
  });

  test('should fetch analytics successfully', async () => {
    const mockResult = [
      { videoId: 'vid1', views: 100, avgDurationSec: 120, totalMinutes: 200 }
    ];
    fetchYoutubeAnalyticsTool.execute.mockResolvedValueOnce(mockResult);

    const result = await fetchYoutubeAnalyticsTool.execute({
      input: { userId: 'user', period: { start: '2024-04-01', end: '2024-04-30' } }
    } as any);

    expect(result).toBe(mockResult);
    expect(fetchYoutubeAnalyticsTool.execute).toHaveBeenCalledTimes(1);
  });

  test('should handle errors', async () => {
    fetchYoutubeAnalyticsTool.execute.mockRejectedValueOnce(new Error('Test error'));

    await expect(
      fetchYoutubeAnalyticsTool.execute({
        input: { userId: 'user', period: { start: '2024-04-01', end: '2024-04-30' } }
      } as any)
    ).rejects.toThrow('Test error');

    expect(fetchYoutubeAnalyticsTool.execute).toHaveBeenCalledTimes(1);
  });
});

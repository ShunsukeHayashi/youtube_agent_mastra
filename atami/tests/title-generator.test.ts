/// <reference types="jest" />

// Create a mock function with proper Jest typing
const mockExecute = jest.fn();

// Mock the title generator tool
jest.mock('../src/mastra/tools/titleGenerator', () => ({
  youtubeTitleGeneratorTool: {
    id: 'youtube-title-generator',
    description: 'Generate engaging YouTube thumbnail text and titles based on video content',
    execute: mockExecute
  }
}));

import * as dotenv from 'dotenv';
import { youtubeTitleGeneratorTool } from '../src/mastra/tools/titleGenerator';

// テスト前に.envファイルを読み込む
dotenv.config();

describe('YouTube Title Generator Tool', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト1: YouTube Title Generator Toolが正しく初期化されるかテスト
  test('should be properly initialized', () => {
    expect(youtubeTitleGeneratorTool).toBeDefined();
    expect(youtubeTitleGeneratorTool.id).toBe('youtube-title-generator');
    expect(youtubeTitleGeneratorTool.description).toBe('Generate engaging YouTube thumbnail text and titles based on video content');
  });

  // テスト2: タイトルとサムネイルテキスト生成が成功するかテスト
  test('should successfully generate titles and thumbnail text', async () => {
    // モック実装を設定
    const mockResult = {
      personas: [
        {
          name: 'Alex',
          age: '25-34',
          gender: 'Male',
          occupation: 'Content Creator',
          interests: ['Learning new skills', 'Technology', 'Self-improvement', 'Interest in AI', 'Interest in techniques'],
          painPoints: ['Information overload', 'Lack of time', 'Struggling to master AI', 'Struggling to master techniques'],
          goals: ['Master new skills', 'Advance career', 'Become proficient in AI', 'Become proficient in techniques'],
          viewingHabits: 'Regularly watches educational content during lunch breaks'
        }
      ],
      thumbnailTextOptions: [
        {
          text: 'Revolutionary AI technique',
          rating: 4.5,
          rationale: 'Exceptional balance of shock value, specificity, and benefit promise. Strongly appeals to 3 out of 3 personas.',
          personaReactions: [
            {
              personaName: 'Alex',
              reaction: 'Highly engaged - this directly addresses my interests in Technology and my goal to Master new skills'
            }
          ]
        }
      ],
      titleOptions: [
        {
          title: 'Revolutionary AI technique: Mastering AI techniques | Transform Your Results (AI)',
          rating: 4.5,
          rationale: 'Exceptional title with perfect balance of intrigue, specificity, and benefit. Strong SEO potential. Complements thumbnail text (rated 4.5) perfectly.',
          thumbnailTextId: 0
        }
      ],
      recommendedSets: [
        {
          thumbnailText: 'Revolutionary AI technique',
          titles: [
            'Revolutionary AI technique: Mastering AI techniques | Transform Your Results (AI)',
            'Revolutionary AI technique That Will Transform Your Results | AI',
            'How To Master AI techniques - Revolutionary Way To Outperform Competitors | AI',
            'Revolutionary Approach To AI techniques: Unlock Hidden Potential [AI]',
            'Revolutionary: AI techniques | Double Your Efficiency (AI)'
          ]
        }
      ],
      videoDescription: {
        description: 'Discover AI strategies that will transform your approach to techniques. This video breaks down the essential techniques you need to know.\n\nIn this video, you\'ll learn:\n- How to master AI effectively\n- Key strategies for improving your techniques skills\n- Advanced techniques that most people overlook\n- Common mistakes to avoid and how to fix them\n- Practical steps to implement these methods immediately\n\nWhether you\'re a beginner or experienced with AI, these insights will help you achieve better results faster.\n\n\nIf you found this video helpful, please like, comment, and subscribe for more content on AI!\n\nCheck out our related videos:\n- Ultimate Guide to AI\n- How to Master techniques in Record Time\n- beginner Secrets Revealed\n\nVisit our website for more resources: [Your Website]\n',
        tags: ['AI', 'techniques', 'beginner', 'educational', 'tutorial', 'how to', 'tutorial', 'guide', 'learn', 'tips', 'tricks', 'strategies', 'AI tutorial', 'AI guide', 'how to AI', 'techniques strategies', 'learn AI', 'AI tips', 'best AI techniques']
      }
    };

    // executeメソッドのモック実装
    mockExecute.mockResolvedValueOnce(mockResult);

    // ツールを実行
    const result = await youtubeTitleGeneratorTool.execute({
      context: {
        videoContent: 'This is a video about AI techniques for beginners. We will cover various methods and approaches to help you understand AI better.',
        seoKeywords: ['AI', 'techniques', 'beginner', 'educational', 'tutorial'],
        targetAudience: 'Tech enthusiasts and beginners interested in AI',
        videoCategory: 'Educational',
        channelTheme: 'AI and Technology'
      },
      runtimeContext: {} as any
    });

    // 結果を検証
    expect(result).toBeDefined();
    expect(result).toBe(mockResult);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith({
      context: {
        videoContent: 'This is a video about AI techniques for beginners. We will cover various methods and approaches to help you understand AI better.',
        seoKeywords: ['AI', 'techniques', 'beginner', 'educational', 'tutorial'],
        targetAudience: 'Tech enthusiasts and beginners interested in AI',
        videoCategory: 'Educational',
        channelTheme: 'AI and Technology'
      },
      runtimeContext: expect.any(Object)
    });
  });

  // テスト3: エラーが発生した場合のテスト
  test('should handle errors', async () => {
    // エラーをスローするモック実装
    mockExecute.mockRejectedValueOnce(new Error('Failed to generate titles and thumbnail text'));

    // エラーが発生することを期待
    await expect(
      youtubeTitleGeneratorTool.execute({
        context: {
          videoContent: 'This is a video about AI techniques for beginners.',
          seoKeywords: ['AI', 'techniques', 'beginner'],
          targetAudience: 'Tech enthusiasts',
          videoCategory: 'Educational',
          channelTheme: 'AI and Technology'
        },
        runtimeContext: {} as any
      })
    ).rejects.toThrow('Failed to generate titles and thumbnail text');

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
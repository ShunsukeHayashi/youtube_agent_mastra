import { contentGeneratorTool } from '../contentGenerator';
import { generateText } from 'ai';

jest.mock('ai', () => ({
  generateText: jest.fn()
}));

describe('ContentGeneratorTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('idea generation', () => {
      it('should generate video ideas', async () => {
        const mockResponse = `
        Video Idea: "JavaScript Array Methods Explained"
        Hook: Start with a common coding mistake that beginners make
        Content Points: 
        - Map, Filter, Reduce basics
        - Real-world examples
        - Performance comparisons
        CTA: Subscribe for more JavaScript tips
        `;

        (generateText as jest.Mock).mockResolvedValue({ text: mockResponse });

        const result = await contentGeneratorTool.execute({
          type: 'idea',
          topic: 'JavaScript Arrays',
          targetAudience: 'Beginners',
          style: 'Tutorial'
        });

        expect(result.success).toBe(true);
        expect(result.content).toBe(mockResponse);
        expect(result.metadata).toMatchObject({
          type: 'idea',
          topic: 'JavaScript Arrays'
        });

        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('JavaScript Arrays');
        expect(callArgs.prompt).toContain('Beginners');
        expect(callArgs.prompt).toContain('Tutorial');
        expect(callArgs.temperature).toBe(0.7);
      });

      it('should generate ideas without optional parameters', async () => {
        (generateText as jest.Mock).mockResolvedValue({ text: 'Video idea content' });

        const result = await contentGeneratorTool.execute({
          type: 'idea',
          topic: 'React Hooks'
        });

        expect(result.success).toBe(true);
        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('React Hooks');
      });
    });

    describe('title generation', () => {
      it('should generate SEO-optimized titles', async () => {
        const mockTitle = 'Master React Hooks in 10 Minutes | Complete Guide 2024';
        
        (generateText as jest.Mock).mockResolvedValue({ text: mockTitle });

        const result = await contentGeneratorTool.execute({
          type: 'title',
          topic: 'React Hooks Tutorial',
          keywords: ['react hooks', 'useState', 'useEffect']
        });

        expect(result.success).toBe(true);
        expect(result.content).toBe(mockTitle);

        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('React Hooks Tutorial');
        expect(callArgs.prompt).toContain('react hooks, useState, useEffect');
        expect(callArgs.prompt).toContain('Under 60 characters');
        expect(callArgs.prompt).toContain('SEO optimized');
      });
    });

    describe('description generation', () => {
      it('should generate YouTube descriptions', async () => {
        const mockDescription = `
        Learn React Hooks in this comprehensive tutorial...
        
        Timestamps:
        00:00 Introduction
        02:30 useState Hook
        
        Links:
        - GitHub: ...
        - Twitter: ...
        
        Keywords: react hooks, tutorial, useState
        `;

        (generateText as jest.Mock).mockResolvedValue({ text: mockDescription });

        const result = await contentGeneratorTool.execute({
          type: 'description',
          topic: 'React Hooks',
          keywords: ['react', 'hooks']
        });

        expect(result.success).toBe(true);
        expect(result.content).toBe(mockDescription);

        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('YouTube video description');
        expect(callArgs.prompt).toContain('timestamps');
        expect(callArgs.prompt).toContain('SEO keywords');
      });
    });

    describe('script generation', () => {
      it('should generate scripts with specified length', async () => {
        const mockScript = `
        [HOOK - 0:00-0:15]
        "Have you ever wondered why your React app rerenders so much?"
        
        [INTRODUCTION - 0:15-0:45]
        Welcome back! Today we're diving into React performance...
        `;

        (generateText as jest.Mock).mockResolvedValue({ text: mockScript });

        const result = await contentGeneratorTool.execute({
          type: 'script',
          topic: 'React Performance',
          length: 'short',
          targetAudience: 'Intermediate developers'
        });

        expect(result.success).toBe(true);
        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('1-3 minutes');
        expect(callArgs.prompt).toContain('Intermediate developers');
      });

      it('should handle medium length scripts', async () => {
        (generateText as jest.Mock).mockResolvedValue({ text: 'Script content' });

        await contentGeneratorTool.execute({
          type: 'script',
          topic: 'Test',
          length: 'medium'
        });

        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('5-7 minutes');
      });

      it('should handle long scripts', async () => {
        (generateText as jest.Mock).mockResolvedValue({ text: 'Script content' });

        await contentGeneratorTool.execute({
          type: 'script',
          topic: 'Test',
          length: 'long'
        });

        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('10-15 minutes');
      });
    });

    describe('tags generation', () => {
      it('should generate YouTube tags', async () => {
        const mockTags = `
        react tutorial, learn react, react for beginners,
        react hooks, useState, useEffect, react 2024,
        web development, javascript framework, frontend
        `;

        (generateText as jest.Mock).mockResolvedValue({ text: mockTags });

        const result = await contentGeneratorTool.execute({
          type: 'tags',
          topic: 'React Tutorial',
          keywords: ['react', 'tutorial']
        });

        expect(result.success).toBe(true);
        const callArgs = (generateText as jest.Mock).mock.calls[0][0];
        expect(callArgs.prompt).toContain('15-20 YouTube tags');
        expect(callArgs.prompt).toContain('Long-tail keywords');
      });
    });

    describe('error handling', () => {
      it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        (generateText as jest.Mock).mockRejectedValue(error);

        const result = await contentGeneratorTool.execute({
          type: 'idea',
          topic: 'Test'
        });

        expect(result.success).toBe(false);
        expect(result.content).toBe('');
        expect(result.metadata?.error).toBe('API Error');
      });

      it('should handle unknown errors', async () => {
        (generateText as jest.Mock).mockRejectedValue('Unknown error');

        const result = await contentGeneratorTool.execute({
          type: 'idea',
          topic: 'Test'
        });

        expect(result.success).toBe(false);
        expect(result.metadata?.error).toBe('Unknown error');
      });
    });
  });
});
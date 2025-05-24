/**
 * Mastra API Routes Configuration
 * 
 * Centralizes all API endpoints for workflows and OpenAPI documentation
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import * as workflows from '../workflows';
import { openApiSchema, generateSwaggerHtml } from './openapi-schema';

// APIルーター作成
export const apiRouter = new Hono();

// ミドルウェア設定
apiRouter.use('*', cors());
apiRouter.use('*', logger());

// OpenAPI仕様エンドポイント
apiRouter.get('/openapi.json', (c) => {
  return c.json(openApiSchema);
});

// Swagger UIエンドポイント
apiRouter.get('/docs', (c) => {
  const html = generateSwaggerHtml(openApiSchema);
  return c.html(html);
});

// ヘルスチェックエンドポイント
apiRouter.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ワークフローエンドポイントを動的に登録
Object.entries(workflows).forEach(([name, workflow]) => {
  if (name.endsWith('Workflow') && workflow && typeof workflow === 'object') {
    const path = `/workflows/${name.replace(/Workflow$/, '')}`;
    
    apiRouter.post(path, async (c) => {
      try {
        const body = await c.req.json();
        
        // ワークフロー実行
        const result = await workflow.execute(body);
        
        return c.json({
          success: true,
          message: `${name} executed successfully`,
          result
        });
      } catch (error) {
        console.error(`Error executing ${name}:`, error);
        
        if (error instanceof z.ZodError) {
          return c.json({
            success: false,
            error: 'Validation Error',
            message: 'Invalid input data',
            details: error.errors
          }, 400);
        }
        
        return c.json({
          success: false,
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }, 500);
      }
    });
  }
});

// ワークフロー一覧エンドポイント
apiRouter.get('/workflows', (c) => {
  const workflowList = Object.keys(workflows)
    .filter(name => name.endsWith('Workflow'))
    .map(name => ({
      id: name.replace(/Workflow$/, ''),
      name: name,
      endpoint: `/api/workflows/${name.replace(/Workflow$/, '')}`,
      description: workflows[name as keyof typeof workflows]?.description || 'No description available'
    }));
  
  return c.json({
    total: workflowList.length,
    workflows: workflowList
  });
});

// エラーハンドリング
apiRouter.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }, 500);
});

// 404ハンドリング
apiRouter.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  }, 404);
});

export default apiRouter;
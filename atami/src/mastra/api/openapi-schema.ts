/**
 * OpenAPI 3.0 Schema Generator for all Mastra Workflows
 * 
 * This file generates OpenAPI/OAS specification for all YouTube workflows
 * to enable API documentation and client generation.
 */

import { z } from 'zod';
import { generateOpenApiDocument } from '@mastra/core/api';
import * as workflows from '../workflows';

// OpenAPI情報
const openApiInfo = {
  openapi: '3.0.0',
  info: {
    title: 'YouTube Mastra Workflows API',
    version: '1.0.0',
    description: 'API for YouTube content creation and optimization workflows powered by Mastra',
    contact: {
      name: 'YouTube Mastra Support',
      email: 'support@youtube-mastra.com'
    }
  },
  servers: [
    {
      url: 'https://api.youtube-mastra.com/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:4111/api',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Content Creation',
      description: 'Workflows for creating YouTube content'
    },
    {
      name: 'Analytics',
      description: 'YouTube analytics and insights workflows'
    },
    {
      name: 'Optimization',
      description: 'Content optimization workflows'
    },
    {
      name: 'Planning',
      description: 'Channel and content planning workflows'
    },
    {
      name: 'Search',
      description: 'YouTube search functionality'
    }
  ]
};

// ワークフローカテゴリマッピング
const workflowCategories: Record<string, string> = {
  youtubeTitleGeneratorWorkflow: 'Optimization',
  youtubeChannelAnalyticsWorkflow: 'Analytics',
  youtubeVideoAnalyticsWorkflow: 'Analytics',
  inputCollectionWorkflow: 'Planning',
  youtubeChannelConceptWorkflow: 'Planning',
  youtubeThumbnailTitleGeneratorWorkflow: 'Optimization',
  youtubeVideoPlanningWorkflow: 'Planning',
  keywordResearchWorkflow: 'Planning',
  youtubeVideoScriptGeneratorWorkflow: 'Content Creation',
  youtubeLongFormRoadmapWorkflow: 'Content Creation',
  youtubeLongFormOsaruWorkflow: 'Content Creation',
  youtubeLongFormMoezoWorkflow: 'Content Creation',
  youtubeLongFormConversationWorkflow: 'Content Creation',
  youtubeContentScoringWorkflow: 'Optimization',
  youtubeShortsIdeationWorkflow: 'Content Creation',
  youtubeShortsScriptWorkflow: 'Content Creation',
  youtubeSearchWorkflow: 'Search'
};

// Zodスキーマを OpenAPI JSON Schema に変換
function zodToOpenApiSchema(schema: z.ZodType<any>): any {
  if (schema instanceof z.ZodString) {
    return { type: 'string' };
  } else if (schema instanceof z.ZodNumber) {
    return { type: 'number' };
  } else if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  } else if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToOpenApiSchema(schema._def.type)
    };
  } else if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToOpenApiSchema(value as z.ZodType<any>);
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  } else if (schema instanceof z.ZodOptional) {
    return zodToOpenApiSchema(schema._def.innerType);
  }
  
  return { type: 'any' };
}

// 単一ワークフローのOpenAPIパス生成
function generateWorkflowPath(workflowName: string, workflow: any) {
  const category = workflowCategories[workflowName] || 'General';
  const path = `/workflows/${workflowName.replace(/Workflow$/, '')}`;
  
  return {
    [path]: {
      post: {
        tags: [category],
        summary: workflow.description || `Execute ${workflowName}`,
        operationId: workflowName,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: zodToOpenApiSchema(workflow.inputSchema)
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful execution',
            content: {
              'application/json': {
                schema: zodToOpenApiSchema(workflow.outputSchema)
              }
            }
          },
          '400': {
            description: 'Bad Request - Invalid input',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    details: { type: 'object' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// すべてのワークフローのOpenAPIスキーマ生成
export function generateOpenApiSchema() {
  const paths: Record<string, any> = {};
  
  // 各ワークフローのパスを生成
  for (const [name, workflow] of Object.entries(workflows)) {
    if (name.endsWith('Workflow') && workflow && typeof workflow === 'object') {
      const workflowPath = generateWorkflowPath(name, workflow);
      Object.assign(paths, workflowPath);
    }
  }
  
  // 完全なOpenAPIドキュメント
  const openApiDocument = {
    ...openApiInfo,
    paths,
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object' }
          },
          required: ['error', 'message']
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: { type: 'object' }
          },
          required: ['success']
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] }
    ]
  };
  
  return openApiDocument;
}

// Swagger UI用のHTMLを生成
export function generateSwaggerHtml(openApiSpec: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>YouTube Mastra API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.19.0/swagger-ui.css">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .swagger-ui .topbar {
        display: none;
      }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.19.0/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.19.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          spec: ${JSON.stringify(openApiSpec, null, 2)},
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout"
        });
      };
    </script>
</body>
</html>
`;
}

// エクスポート用のOpenAPIスキーマ
export const openApiSchema = generateOpenApiSchema();

// CLIまたはビルド時にファイルとして出力
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = path.join(__dirname, '../../../docs/api');
  const openApiPath = path.join(outputDir, 'openapi.json');
  const swaggerPath = path.join(outputDir, 'swagger.html');
  
  // ディレクトリ作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // OpenAPI JSONファイル出力
  fs.writeFileSync(openApiPath, JSON.stringify(openApiSchema, null, 2));
  console.log(`✅ OpenAPI schema generated: ${openApiPath}`);
  
  // Swagger UI HTML出力
  fs.writeFileSync(swaggerPath, generateSwaggerHtml(openApiSchema));
  console.log(`✅ Swagger UI generated: ${swaggerPath}`);
}
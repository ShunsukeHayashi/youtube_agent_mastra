import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

/**
 * Standard memory configuration for YouTube agents
 * @param options Additional memory options
 * @returns Configured Memory instance
 */
export function createStandardMemory(options: {
  lastMessages?: number;
  semanticRecall?: boolean;
  generateTitle?: boolean;
} = {}) {
  return new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: options.lastMessages || 10,
      semanticRecall: options.semanticRecall || false,
      threads: {
        generateTitle: options.generateTitle || false,
      },
    },
  });
}

/**
 * Standard memory configuration for advanced agents (like orchestrator)
 * with semantic recall and title generation enabled
 * @returns Configured Memory instance
 */
export function createAdvancedMemory() {
  return createStandardMemory({
    lastMessages: 15,
    semanticRecall: true,
    generateTitle: true,
  });
}
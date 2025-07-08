// @ts-nocheck
// .envファイルを読み込む
import dotenv from 'dotenv';
dotenv.config();

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Minimal setup for deployment
export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: 'YouTube Mastra',
    level: 'info',
  }),
});

export default mastra;
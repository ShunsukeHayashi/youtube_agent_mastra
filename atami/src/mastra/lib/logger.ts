import { PinoLogger } from '@mastra/core/logger';

export const logger = new PinoLogger({ 
  name: "YouTube Agent Mastra", 
  level: "info" 
});

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface YouTubeAgentLogMessage {
  message: string;
  destinationPath?: string;
  type?: 'AGENT' | 'TOOL' | 'WORKFLOW' | 'API';
  agentName?: string;
  toolName?: string;
  workflowName?: string;
  duration?: number;
  error?: Error | string;
  metadata?: Record<string, any>;
}

export class YouTubeAgentLogger {
  private logger: PinoLogger;

  constructor(options?: { name?: string; level?: LogLevel }) {
    this.logger = new PinoLogger({
      name: options?.name || "YouTube Agent",
      level: options?.level || "info"
    });
  }

  debug(message: YouTubeAgentLogMessage | string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }

  info(message: YouTubeAgentLogMessage | string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  warn(message: YouTubeAgentLogMessage | string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  error(message: YouTubeAgentLogMessage | string, ...args: any[]) {
    this.logger.error(message, ...args);
  }

  logAgentStart(agentName: string, input?: any) {
    this.info({
      message: `Agent started: ${agentName}`,
      type: 'AGENT',
      agentName,
      destinationPath: 'agent-lifecycle',
      metadata: { input }
    });
  }

  logAgentComplete(agentName: string, output?: any, duration?: number) {
    this.info({
      message: `Agent completed: ${agentName}`,
      type: 'AGENT',
      agentName,
      destinationPath: 'agent-lifecycle',
      duration,
      metadata: { output }
    });
  }

  logAgentError(agentName: string, error: Error | string, duration?: number) {
    this.error({
      message: `Agent error: ${agentName}`,
      type: 'AGENT',
      agentName,
      destinationPath: 'agent-errors',
      duration,
      error
    });
  }

  logToolStart(toolName: string, input?: any) {
    this.info({
      message: `Tool started: ${toolName}`,
      type: 'TOOL',
      toolName,
      destinationPath: 'tool-usage',
      metadata: { input }
    });
  }

  logToolComplete(toolName: string, output?: any, duration?: number) {
    this.info({
      message: `Tool completed: ${toolName}`,
      type: 'TOOL',
      toolName,
      destinationPath: 'tool-usage',
      duration,
      metadata: { output }
    });
  }

  logToolError(toolName: string, error: Error | string, duration?: number) {
    this.error({
      message: `Tool error: ${toolName}`,
      type: 'TOOL',
      toolName,
      destinationPath: 'tool-errors',
      duration,
      error
    });
  }

  logWorkflowStart(workflowName: string, input?: any) {
    this.info({
      message: `Workflow started: ${workflowName}`,
      type: 'WORKFLOW',
      workflowName,
      destinationPath: 'workflow-lifecycle',
      metadata: { input }
    });
  }

  logWorkflowComplete(workflowName: string, output?: any, duration?: number) {
    this.info({
      message: `Workflow completed: ${workflowName}`,
      type: 'WORKFLOW',
      workflowName,
      destinationPath: 'workflow-lifecycle',
      duration,
      metadata: { output }
    });
  }

  logWorkflowError(workflowName: string, error: Error | string, duration?: number) {
    this.error({
      message: `Workflow error: ${workflowName}`,
      type: 'WORKFLOW',
      workflowName,
      destinationPath: 'workflow-errors',
      duration,
      error
    });
  }

  logAPICall(endpoint: string, method: string, duration?: number, status?: number) {
    this.info({
      message: `API call: ${method} ${endpoint}`,
      type: 'API',
      destinationPath: 'api-calls',
      duration,
      metadata: { endpoint, method, status }
    });
  }

  logAPIError(endpoint: string, method: string, error: Error | string, duration?: number) {
    this.error({
      message: `API error: ${method} ${endpoint}`,
      type: 'API',
      destinationPath: 'api-errors',
      duration,
      error,
      metadata: { endpoint, method }
    });
  }

  async cleanup() {
    if (this.logger.cleanup) {
      await this.logger.cleanup();
    }
  }
}

export const youtubeAgentLogger = new YouTubeAgentLogger({
  name: "YouTube Agent Mastra",
  level: "info"
});
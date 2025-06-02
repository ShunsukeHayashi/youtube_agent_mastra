/**
 * Types for workflow orchestration
 */

/**
 * Configuration for a workflow in a chain
 */
export interface ChainedWorkflowConfig {
  /** The workflow to execute */
  workflow: any;
  
  /** Input mapping from context to workflow input */
  inputMapping?: Record<string, string>;
  
  /** Output mapping from workflow output to context */
  outputMapping?: Record<string, string>;
  
  /** Whether this workflow is optional */
  optional?: boolean;
  
  /** Condition function that determines if this workflow should run */
  condition?: (data: any) => boolean;
  
  /** Whether this workflow can run in parallel with others */
  parallel?: boolean;
}

/**
 * Configuration for a workflow chain
 */
export interface WorkflowChainConfig {
  /** Unique identifier for the chain */
  id: string;
  
  /** Description of the chain's purpose */
  description: string;
  
  /** List of workflows in the chain */
  workflows: ChainedWorkflowConfig[];
}

/**
 * Status of a workflow chain execution
 */
export type ChainStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

/**
 * Status of a workflow in a chain
 */
export interface WorkflowExecutionStatus {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
}

/**
 * Complete state of a workflow chain execution
 */
export interface ChainExecutionState {
  chainId: string;
  status: ChainStatus;
  currentStepIndex: number;
  startTime: string;
  lastUpdateTime: string;
  endTime?: string;
  contextData: any;
  results: WorkflowExecutionStatus[];
}

/**
 * Configuration for chain executor
 */
export interface ChainExecutorConfig {
  onStepStart?: (stepIndex: number, workflowId: string) => void;
  onStepComplete?: (stepIndex: number, result: any) => void;
  onStepError?: (stepIndex: number, error: Error) => void;
  onChainComplete?: (result: any) => void;
}

/**
 * Configuration for error handling
 */
export interface ErrorHandlingConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackWorkflow?: any;
  continueOnError?: boolean;
  errorCallback?: (error: Error, context: any) => Promise<any>;
}
/**
 * Workflow Orchestration Example
 * 
 * This example demonstrates how to use the workflow orchestration module
 * to create and execute workflow chains.
 */
const { 
  WorkflowChain, 
  ChainExecutor, 
  chains 
} = require('../dist/src/mastra');

/**
 * Example 1: Using a pre-configured workflow chain
 */
async function runPreConfiguredChain() {
  console.log('Running pre-configured workflow chain...');
  
  // Create executor for the pre-configured long-form content chain
  const executor = new ChainExecutor(chains.youtubeLongFormContentChain, {
    onStepStart: (index, workflowId) => {
      console.log(`Starting step ${index}: ${workflowId}`);
    },
    onStepComplete: (index, result) => {
      console.log(`Completed step ${index}`);
    },
    onChainComplete: (result) => {
      console.log('Chain execution completed');
    }
  });
  
  // Execute the chain with initial input
  try {
    const result = await executor.execute({
      business: {
        name: 'Test Business',
        topic: 'JavaScript Programming',
      },
      presenter: {
        name: 'John Doe',
      },
      audience: {
        primary: 'Beginner programmers interested in web development',
      },
      goals: {
        primary: 'Educate and build authority',
      }
    });
    
    console.log('Chain result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Chain execution failed:', error);
  }
}

/**
 * Example 2: Creating a custom workflow chain
 */
async function createCustomChain() {
  console.log('Creating custom workflow chain...');
  
  // Import specific workflows
  const { 
    youtubeInputCollectionWorkflow,
    youtubeKeywordResearchWorkflow,
    youtubeVideoPlanningWorkflow
  } = require('../dist/src/mastra/workflows');
  
  // Create a custom workflow chain
  const customChain = new WorkflowChain({
    id: 'custom-youtube-research-chain',
    description: 'Custom chain for YouTube video research',
    workflows: [
      // 1. Input collection
      {
        workflow: youtubeInputCollectionWorkflow,
        outputMapping: {
          businessName: 'business.name',
          targetAudience: 'audience.primary',
        },
      },
      
      // 2. Keyword research (optional)
      {
        workflow: youtubeKeywordResearchWorkflow,
        optional: true,
        inputMapping: {
          keyword: 'business.topic',
          targetAudience: 'audience.primary',
        },
        outputMapping: {
          mainKeyword: 'keywords.main',
          relatedKeywords: 'keywords.related',
        },
      },
      
      // 3. Video planning (only if keywords were found)
      {
        workflow: youtubeVideoPlanningWorkflow,
        condition: (data) => data.keywords && data.keywords.main,
        inputMapping: {
          topicKeywords: 'keywords.main.keyword',
          targetAudience: 'audience.primary',
        },
        outputMapping: {
          videoPlan: 'content.plan',
        },
      },
    ],
  });
  
  // Create executor for the custom chain
  const executor = new ChainExecutor(customChain);
  
  // Execute the chain with initial input
  try {
    const result = await executor.execute({
      business: {
        name: 'Custom Business',
        topic: 'Data Science',
      },
      audience: {
        primary: 'Professionals looking to learn data science',
      }
    });
    
    console.log('Custom chain result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Custom chain execution failed:', error);
  }
}

// Run the examples
async function runExamples() {
  await runPreConfiguredChain();
  console.log('\n' + '-'.repeat(80) + '\n');
  await createCustomChain();
}

runExamples().catch(console.error);
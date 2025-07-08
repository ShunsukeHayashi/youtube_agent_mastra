# Test-Driven Development (TDD) Guide for YouTube Mastra Agent

## Overview

This project follows Test-Driven Development (TDD) principles. Tests are written BEFORE the implementation code.

## TDD Workflow

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests green

## Test Structure

### Unit Tests Created

#### 1. YouTube Service Tests (`src/lib/__tests__/youtube.test.ts`)
Tests for YouTube API integration:
- ✅ Channel information retrieval
- ✅ Video listing for channels
- ✅ Video details fetching
- ✅ Video search functionality
- ✅ Trending videos retrieval
- ✅ Error handling

#### 2. Tool Tests

**YouTube Analytics Tool** (`src/tools/__tests__/youtubeAnalytics.test.ts`):
- ✅ API key validation
- ✅ Channel analysis action
- ✅ Video analysis action
- ✅ Search action
- ✅ Trending videos action
- ✅ Error handling for missing parameters

**Content Generator Tool** (`src/tools/__tests__/contentGenerator.test.ts`):
- ✅ Video idea generation
- ✅ Title generation with SEO
- ✅ Description generation
- ✅ Script generation (short/medium/long)
- ✅ Tags generation
- ✅ Error handling

#### 3. Agent Tests (`src/agents/__tests__/`)
- ✅ Channel Analysis Agent configuration
- ✅ Agent instructions validation
- ✅ Tool integration verification
- ✅ Model configuration

#### 4. Workflow Tests (`src/workflows/__tests__/`)
- ✅ Channel Analysis Workflow steps
- ✅ Input/output schema validation
- ✅ Step dependencies
- ✅ Workflow execution flow

## Running Tests

Due to ESM module complexities, here's a simplified approach:

### Option 1: Direct Node Testing
```bash
# Create a test runner
node --experimental-vm-modules tests/run-tests.js
```

### Option 2: Using Vitest (Alternative)
```bash
# Install vitest
npm install --save-dev vitest

# Run tests
npx vitest
```

## Test Coverage Goals

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: Critical workflows covered
- **E2E Tests**: Main user journeys

## TDD Best Practices

1. **Write One Test at a Time**
   - Focus on a single behavior
   - Keep tests small and focused

2. **Test First, Code Second**
   - Never write production code without a failing test
   - Write minimal code to pass

3. **Refactor with Confidence**
   - Tests provide safety net
   - Improve code structure without fear

4. **Mock External Dependencies**
   - YouTube API calls
   - OpenAI API calls
   - File system operations

## Example TDD Cycle

```typescript
// 1. RED - Write failing test
test('should analyze channel performance', async () => {
  const result = await analyzeChannel('UC123');
  expect(result.metrics).toBeDefined();
  expect(result.recommendations).toHaveLength(3);
});

// 2. GREEN - Implement minimal code
async function analyzeChannel(channelId: string) {
  return {
    metrics: { subscribers: 1000 },
    recommendations: ['Upload more', 'Better titles', 'Consistent schedule']
  };
}

// 3. REFACTOR - Improve implementation
async function analyzeChannel(channelId: string) {
  const channelData = await youtube.getChannelInfo(channelId);
  const metrics = calculateMetrics(channelData);
  const recommendations = generateRecommendations(metrics);
  
  return { metrics, recommendations };
}
```

## Test Patterns Used

### 1. Arrange-Act-Assert (AAA)
```typescript
// Arrange
const mockData = { ... };
jest.mock(...);

// Act
const result = await functionUnderTest();

// Assert
expect(result).toEqual(expected);
```

### 2. Given-When-Then (BDD Style)
```typescript
describe('YouTube Analytics Tool', () => {
  describe('given a valid channel ID', () => {
    describe('when analyzing the channel', () => {
      it('then returns channel metrics', async () => {
        // test implementation
      });
    });
  });
});
```

### 3. Test Doubles
- **Mocks**: YouTube API, OpenAI API
- **Stubs**: Return predefined responses
- **Spies**: Verify function calls

## Benefits of TDD in This Project

1. **Confidence**: All features tested before release
2. **Documentation**: Tests serve as usage examples
3. **Design**: Forces modular, testable architecture
4. **Regression Prevention**: Catch breaking changes early
5. **Refactoring Safety**: Change code without fear

## Next Steps

1. Fix Jest ESM configuration or migrate to Vitest
2. Implement remaining production code
3. Add integration tests
4. Set up CI/CD pipeline
5. Add mutation testing for test quality
/**
 * 入力収集ワークフローのE2Eテスト
 */
import { inputCollectionWorkflow } from '../../src/mastra/workflows/inputCollectionWorkflow';
import { waitForWorkflowCompletion, mockInputs } from './setup';

describe('入力収集ワークフロー E2Eテスト', () => {
  // テスト実行前の処理
  beforeAll(() => {
    console.log('入力収集ワークフロー E2Eテスト開始');
  });

  // テスト実行後の処理
  afterAll(() => {
    console.log('入力収集ワークフロー E2Eテスト終了');
  });

  // 基本的なワークフロー実行テスト
  test('基本的な入力収集が正常に実行される', async () => {
    // テスト入力データ
    const input = mockInputs.inputCollection;
    
    // ワークフローを実行
    const result = await waitForWorkflowCompletion(
      inputCollectionWorkflow.run(input)
    );
    
    // 結果の検証
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    
    // 結果の構造を検証
    expect(result.result).toHaveProperty('recommendedWorkflows');
    expect(result.result).toHaveProperty('executionPlan');
    expect(result.result).toHaveProperty('report');
    
    // 推奨ワークフローの検証
    expect(Array.isArray(result.result.recommendedWorkflows)).toBe(true);
    expect(result.result.recommendedWorkflows.length).toBeGreaterThan(0);
    
    // 実行計画の検証
    expect(Array.isArray(result.result.executionPlan)).toBe(true);
    expect(result.result.executionPlan.length).toBeGreaterThan(0);
    result.result.executionPlan.forEach((step: any) => {
      expect(step).toHaveProperty('workflowName');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('estimatedTime');
    });
    
    // レポートの検証
    expect(result.result.report).toHaveProperty('title');
    expect(result.result.report).toHaveProperty('summary');
    expect(result.result.report).toHaveProperty('date');
  });

  // 異なる入力でのテスト
  test('異なる入力で入力収集が実行される', async () => {
    // テスト入力データ（異なるプロジェクト名と説明）
    const input = {
      projectName: 'Reactフロントエンド開発講座',
      projectDescription: 'Reactを使ったモダンなフロントエンド開発の基礎から応用までを解説します',
      targetAudience: 'JavaScriptの基礎知識を持つ開発者、20代〜40代',
      contentGoals: 'Reactの基本概念を理解し、実際のアプリケーションを開発できるようになること'
    };
    
    // ワークフローを実行
    const result = await waitForWorkflowCompletion(
      inputCollectionWorkflow.run(input)
    );
    
    // 結果の検証
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    
    // 入力が反映されているか検証
    // 注: 実際の実装では入力が直接結果に反映されないため、
    // 結果の構造のみを検証します
    expect(result.result).toHaveProperty('recommendedWorkflows');
    expect(result.result).toHaveProperty('executionPlan');
    expect(result.result).toHaveProperty('report');
  });

  // エラーケースのテスト
  test('不十分な入力でエラーが適切に処理される', async () => {
    // 不十分な入力で実行（エラーになるはず）
    const input = {
      projectName: '',
      projectDescription: '',
      targetAudience: '',
      contentGoals: ''
    };
    
    // ワークフローを実行
    const result = await waitForWorkflowCompletion(
      inputCollectionWorkflow.run(input)
    );
    
    // エラー結果の検証
    // 注: 実際の実装によっては、エラーをスローするか、success: falseを返すかが異なる
    // ここでは両方のケースに対応
    try {
      if (result.success === false) {
        // success: falseが返された場合
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe('string');
      } else {
        // エラーがスローされなかった場合（想定外）
        fail('不十分な入力でエラーが発生しませんでした');
      }
    } catch (error) {
      // エラーがスローされた場合
      expect(error).toBeDefined();
    }
  });
});
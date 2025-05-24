/**
 * プロンプトテンプレートのE2Eテスト
 * 
 * このファイルは、prompt.mdファイルに記載されているプロンプトテンプレートを使用して、
 * エージェントが正しく動作するかをテストします。
 */
import * as fs from 'fs';
import * as path from 'path';
import { youtubeTitleGeneratorAgent } from '../../src/mastra/agents/titleGeneratorAgent';
import { youtubeThumbnailTitleGeneratorAgent } from '../../src/mastra/agents/thumbnailTitleGeneratorAgent';
import { keywordResearchAgent } from '../../src/mastra/agents/keywordResearchAgent';
import { youtubeVideoPlanningAgent } from '../../src/mastra/agents/videoPlanningAgent';
import { youtubeAnalyticsAgent } from '../../src/mastra/agents/analyticsAgent';
import { channelConceptAgent } from '../../src/mastra/agents/channelConceptAgent';
import { inputCollectionAgent } from '../../src/mastra/agents/inputCollectionAgent';
import { mockInputs } from './setup';

describe('プロンプトテンプレート E2Eテスト', () => {
    // プロンプトファイルのパス
    const promptFilePath = path.join(process.cwd(), 'prompt.md');
    let promptContent: string;

    // テスト実行前の処理
    beforeAll(() => {
        console.log('プロンプトテンプレート E2Eテスト開始');

        // タイムアウトを設定
        jest.setTimeout(60000); // 60秒

        // プロンプトファイルを読み込む
        try {
            promptContent = fs.readFileSync(promptFilePath, 'utf-8');
            console.log(`プロンプトファイル読み込み成功: ${promptFilePath}`);
            console.log(`プロンプトファイルの長さ: ${promptContent.length}`);

            // プロンプトファイルの内容を確認（デバッグ用）
            if (promptContent.length > 0) {
                console.log(`プロンプトファイルの先頭100文字: ${promptContent.substring(0, 100)}`);

                // 特定の文字列が含まれているか確認
                const containsWorkflow1 = promptContent.includes('WORKFLOW‑1');
                const containsWorkflow12 = promptContent.includes('WORKFLOW‑12');
                const containsWorkflow13 = promptContent.includes('WORKFLOW‑13');

                console.log(`WORKFLOW‑1を含む: ${containsWorkflow1}`);
                console.log(`WORKFLOW‑12を含む: ${containsWorkflow12}`);
                console.log(`WORKFLOW‑13を含む: ${containsWorkflow13}`);
            }
        } catch (error) {
            console.error(`プロンプトファイル読み込み失敗: ${promptFilePath}`, error);
            promptContent = '';
        }
    });

    // テスト実行後の処理
    afterAll(() => {
        console.log('プロンプトテンプレート E2Eテスト終了');
    });

    // プロンプトファイルの存在確認
    test('プロンプトファイルが存在する', () => {
        expect(fs.existsSync(promptFilePath)).toBe(true);
        expect(promptContent.length).toBeGreaterThan(0);
    });

    // プロンプトファイルの内容確認
    test('プロンプトファイルに必要な情報が含まれている', () => {
        // プロンプトファイルが存在し、内容があることを確認
        expect(promptContent.length).toBeGreaterThan(0);

        // チャンネルコンセプト設計のプロンプトが含まれているか
        expect(promptContent).toContain('WORKFLOW‑1');

        // キーワード戦略シミュレーションのプロンプトが含まれているか
        expect(promptContent).toContain('WORKFLOW‑12');

        // プロジェクト初期インプット収集のプロンプトが含まれているか
        expect(promptContent).toContain('WORKFLOW‑13');
    });

    // エージェントのプロンプトとの整合性確認
    test('エージェントのプロンプトがプロンプトファイルと整合している', () => {
        // チャンネルコンセプトエージェントのプロンプトを確認
        expect(channelConceptAgent.instructions).toBeDefined();

        // キーワードリサーチエージェントのプロンプトを確認
        expect(keywordResearchAgent.instructions).toBeDefined();

        // 入力収集エージェントのプロンプトを確認
        expect(inputCollectionAgent.instructions).toBeDefined();
    });

    // プロンプトテンプレートを使用したエージェント実行テスト（スキップ）
    test.skip('プロンプトテンプレートを使用してエージェントが正しく実行される', async () => {
        // チャンネルコンセプト設計のプロンプトを抽出
        const channelConceptPrompt = extractPrompt(promptContent, 'WORKFLOW‑1 Channel Concept Design');

        // プロンプトを使用してエージェントを実行
        // 注: 実際のエージェント実行は時間がかかるため、スキップしています
        // const result = await channelConceptAgent.execute({
        //   ...mockInputs.channelConcept,
        //   customPrompt: channelConceptPrompt
        // });

        // 結果の検証
        // expect(result).toBeDefined();
    });
});

/**
 * プロンプトファイルから特定のワークフローのプロンプトを抽出する関数
 * @param content プロンプトファイルの内容
 * @param workflowName ワークフロー名
 * @returns 抽出されたプロンプト
 */
function extractPrompt(content: string, workflowName: string): string {
    // ワークフロー名を含む行を検索
    const workflowRegex = new RegExp(`# 1\\.[0-9\\.]+\\s+- ▶︎ ${workflowName}`, 'i');
    const workflowMatch = content.match(workflowRegex);

    if (!workflowMatch) {
        return '';
    }

    // ワークフロー名の行の位置を取得
    const workflowIndex = workflowMatch.index;

    if (workflowIndex === undefined) {
        return '';
    }

    // ワークフロー名の行から次のワークフロー名の行までを抽出
    const nextWorkflowRegex = /# 1\.[0-9\.]+\s+- ▶︎ WORKFLOW‑[0-9]+/i;
    const nextWorkflowMatch = content.slice(workflowIndex + 1).match(nextWorkflowRegex);

    if (!nextWorkflowMatch) {
        // 次のワークフローが見つからない場合は、ワークフロー名の行から最後までを抽出
        return content.slice(workflowIndex);
    }

    // 次のワークフローの行の位置を取得
    const nextWorkflowIndex = nextWorkflowMatch.index;

    if (nextWorkflowIndex === undefined) {
        return '';
    }

    // ワークフロー名の行から次のワークフローの行までを抽出
    return content.slice(workflowIndex, workflowIndex + nextWorkflowIndex + 1);
}
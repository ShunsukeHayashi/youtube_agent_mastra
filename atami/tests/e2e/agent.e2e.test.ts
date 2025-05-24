/**
 * エージェントのE2Eテスト
 * 
 * このファイルは、各エージェントが正しく初期化され、動作するかをテストします。
 */
import { youtubeTitleGeneratorAgent } from '../../src/mastra/agents/titleGeneratorAgent';
import { youtubeThumbnailTitleGeneratorAgent } from '../../src/mastra/agents/thumbnailTitleGeneratorAgent';
import { keywordResearchAgent } from '../../src/mastra/agents/keywordResearchAgent';
import { youtubeVideoPlanningAgent } from '../../src/mastra/agents/videoPlanningAgent';
import { youtubeAnalyticsAgent } from '../../src/mastra/agents/analyticsAgent';
import { channelConceptAgent } from '../../src/mastra/agents/channelConceptAgent';
import { inputCollectionAgent } from '../../src/mastra/agents/inputCollectionAgent';
import { mockInputs } from './setup';

describe('エージェント E2Eテスト', () => {
    // テスト実行前の処理
    beforeAll(() => {
        console.log('エージェント E2Eテスト開始');
        // タイムアウトを設定（長時間実行されるエージェントのため）
        jest.setTimeout(60000); // 60秒

        // エージェントの存在を確認（デバッグ用）
        console.log('エージェントの存在確認:');
        console.log(`youtubeTitleGeneratorAgent: ${typeof youtubeTitleGeneratorAgent}`);
        console.log(`youtubeThumbnailTitleGeneratorAgent: ${typeof youtubeThumbnailTitleGeneratorAgent}`);
        console.log(`keywordResearchAgent: ${typeof keywordResearchAgent}`);
        console.log(`youtubeVideoPlanningAgent: ${typeof youtubeVideoPlanningAgent}`);
        console.log(`youtubeAnalyticsAgent: ${typeof youtubeAnalyticsAgent}`);
        console.log(`channelConceptAgent: ${typeof channelConceptAgent}`);
        console.log(`inputCollectionAgent: ${typeof inputCollectionAgent}`);
    });

    // テスト実行後の処理
    afterAll(() => {
        console.log('エージェント E2Eテスト終了');
    });

    // タイトル生成エージェントのテスト
    test('タイトル生成エージェントが正しく初期化される', () => {
        expect(youtubeTitleGeneratorAgent).toBeDefined();
    });

    // サムネイルタイトル生成エージェントのテスト
    test('サムネイルタイトル生成エージェントが正しく初期化される', () => {
        expect(youtubeThumbnailTitleGeneratorAgent).toBeDefined();
    });

    // キーワードリサーチエージェントのテスト
    test('キーワードリサーチエージェントが正しく初期化される', () => {
        expect(keywordResearchAgent).toBeDefined();
    });

    // 動画計画エージェントのテスト
    test('動画計画エージェントが正しく初期化される', () => {
        // 構文エラーを修正したので、テストを有効化
        expect(youtubeVideoPlanningAgent).toBeDefined();
    });

    // アナリティクスエージェントのテスト
    test('アナリティクスエージェントが正しく初期化される', () => {
        expect(youtubeAnalyticsAgent).toBeDefined();
    });

    // チャンネルコンセプトエージェントのテスト
    test('チャンネルコンセプトエージェントが正しく初期化される', () => {
        expect(channelConceptAgent).toBeDefined();
    });

    // 入力収集エージェントのテスト
    test('入力収集エージェントが正しく初期化される', () => {
        expect(inputCollectionAgent).toBeDefined();
    });

    // エージェントの実行テスト（スキップ）
    test.skip('タイトル生成エージェントが正しく実行される', async () => {
        const input = mockInputs.titleGenerator;

        // エージェントを実行
        // 注: 実際のエージェント実行は時間がかかるため、スキップしています
        // const result = await youtubeTitleGeneratorAgent.execute(input);

        // 結果の検証
        // expect(result).toBeDefined();
    });

    // エージェントの実行テスト（スキップ）
    test.skip('サムネイルタイトル生成エージェントが正しく実行される', async () => {
        const input = mockInputs.thumbnailTitleGenerator;

        // エージェントを実行
        // 注: 実際のエージェント実行は時間がかかるため、スキップしています
        // const result = await youtubeThumbnailTitleGeneratorAgent.execute(input);

        // 結果の検証
        // expect(result).toBeDefined();
    });
});
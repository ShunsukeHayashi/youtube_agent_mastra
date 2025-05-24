import { youtubeTitleGeneratorChain } from '../../../src/mastra/workflows/titleGeneratorWorkflow.langchain';

// モックデータ
const mockInput = {
    videoTopic: 'プログラミング初心者向けのJavaScript入門',
    targetAudience: 'プログラミング初心者、20代〜30代',
    contentType: '教育',
    keyPoints: ['変数の基本', '関数の使い方', '条件分岐'],
    competitorTitles: [
        'JavaScript入門講座 - 初心者でも分かる基礎から応用まで',
        '【初心者向け】JavaScriptの基本を1時間で学ぼう',
        'プログラミング未経験者でも分かるJavaScript入門'
    ],
    titleCount: 5
};

// 期待される出力の構造
interface ExpectedOutput {
    success: boolean;
    message: string;
    result?: {
        titles: string[];
        thumbnailTexts: string[];
        analysis: string;
    };
}

describe('YouTubeTitleGeneratorWorkflow (Langchain)', () => {
    // タイムアウトを延長（LLM呼び出しに時間がかかるため）
    jest.setTimeout(30000);

    it('should generate titles and thumbnail texts based on input', async () => {
        // チェーンの作成
        const chain = await youtubeTitleGeneratorChain.create();

        // チェーンの実行
        const result = await chain.invoke(mockInput);

        // 結果の検証
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.message).toBeDefined();

        // 結果の構造を検証
        if (result.result) {
            expect(Array.isArray(result.result.titles)).toBe(true);
            expect(result.result.titles.length).toBeGreaterThanOrEqual(mockInput.titleCount);
            expect(Array.isArray(result.result.thumbnailTexts)).toBe(true);
            expect(result.result.thumbnailTexts.length).toBeGreaterThanOrEqual(mockInput.titleCount);
            expect(typeof result.result.analysis).toBe('string');
        }
    });

    it('should handle input without competitor titles', async () => {
        // 競合タイトルなしの入力
        const inputWithoutCompetitors = {
            ...mockInput,
            competitorTitles: []
        };

        // チェーンの作成
        const chain = await youtubeTitleGeneratorChain.create();

        // チェーンの実行
        const result = await chain.invoke(inputWithoutCompetitors);

        // 結果の検証
        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // 結果の構造を検証
        if (result.result) {
            expect(Array.isArray(result.result.titles)).toBe(true);
            expect(result.result.titles.length).toBeGreaterThanOrEqual(inputWithoutCompetitors.titleCount);
        }
    });

    it('should handle minimal input', async () => {
        // 最小限の入力
        const minimalInput = {
            videoTopic: 'JavaScript入門',
            targetAudience: 'プログラミング初心者',
            titleCount: 3
        };

        // チェーンの作成
        const chain = await youtubeTitleGeneratorChain.create();

        // チェーンの実行
        const result = await chain.invoke(minimalInput);

        // 結果の検証
        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // 結果の構造を検証
        if (result.result) {
            expect(Array.isArray(result.result.titles)).toBe(true);
            expect(result.result.titles.length).toBeGreaterThanOrEqual(minimalInput.titleCount);
        }
    });

    it('should handle invalid input', async () => {
        // 無効な入力（videoTopicなし）
        const invalidInput = {
            targetAudience: 'プログラミング初心者',
            titleCount: 3
        };

        // チェーンの作成
        const chain = await youtubeTitleGeneratorChain.create();

        try {
            // チェーンの実行
            await chain.invoke(invalidInput as any);
            // ここに到達すべきではない
            fail('Expected to throw an error but did not');
        } catch (error) {
            // エラーが発生することを確認
            expect(error).toBeDefined();
        }
    });
});
/**
 * YouTube動画スクリプト生成ツール
 *
 * キーワードやトピックに基づいて、
 * YouTube動画のスクリプトを生成します。
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 定数定義
const SCRIPT_STYLES = ['教育的', 'エンターテイメント', '解説', 'ストーリーテリング', 'チュートリアル'] as const;
const SCRIPT_TONES = ['カジュアル', 'プロフェッショナル', '親しみやすい', '熱意的', '冷静'] as const;
const DEFAULT_SCRIPT_LENGTH = 'medium'; // short, medium, long

// 型定義
type ScriptStyle = typeof SCRIPT_STYLES[number];
type ScriptTone = typeof SCRIPT_TONES[number];

/**
 * スクリプトセクションのインターフェース
 */
interface ScriptSection {
    title: string;
    content: string;
    duration: string;
    purpose: string;
}

/**
 * スクリプトメタデータのインターフェース
 */
interface ScriptMetadata {
    estimatedDuration: string;
    wordCount: number;
    targetAudience: string;
    keywordsUsed: string[];
    processingTime: number;
}

/**
 * 動画スクリプトの出力データインターフェース
 */
interface VideoScriptOutput {
    title: string;
    introduction: string;
    sections: ScriptSection[];
    conclusion: string;
    callToAction: string;
    fullScript: string;
    metadata: ScriptMetadata;
}

/**
 * 文字列の単語数を数える
 */
function countWords(text: string): number {
    // 空白で分割して単語数を数える
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * スクリプトから使用されたキーワードを抽出する
 */
function extractKeywordsUsed(script: string, keywords: string[]): string[] {
    // スクリプト内で使用されているキーワードを抽出
    return keywords.filter(keyword => script.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * 動画の推定時間を計算する
 */
function estimateVideoDuration(scriptLength: string, fullScript: string): string {
    // 単語数に基づいて推定時間を計算
    const wordCount = countWords(fullScript);

    // 平均的な話速（1分あたりの単語数）
    const wordsPerMinute = 150;

    // 推定時間（分）
    const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute);

    // スクリプトの長さに応じて調整
    let adjustedMinutes;
    switch (scriptLength) {
        case 'short':
            adjustedMinutes = Math.min(estimatedMinutes, 5);
            break;
        case 'medium':
            adjustedMinutes = Math.min(Math.max(estimatedMinutes, 7), 12);
            break;
        case 'long':
            adjustedMinutes = Math.min(Math.max(estimatedMinutes, 15), 20);
            break;
        default:
            adjustedMinutes = estimatedMinutes;
    }

    return `約${adjustedMinutes}分`;
}

/**
 * スクリプトのタイトルを生成する
 */
function generateScriptTitle(topic: string, keywords: string[]): string {
    // キーワードを使ってタイトルを生成
    const keywordToUse = keywords.length > 0 ? keywords[0] : '';

    const titleTemplates = [
        `【完全ガイド】${topic}の基本から応用まで`,
        `${topic}を徹底解説！初心者でもわかる${keywordToUse}入門`,
        `知らないと損する${topic}の${keywordToUse}テクニック`,
        `【保存版】${topic}のすべてがわかる${keywordToUse}ガイド`,
        `${topic}マスターになる方法 - ${keywordToUse}のプロが教える秘訣`,
    ];

    // ランダムにテンプレートを選択
    const randomIndex = Math.floor(Math.random() * titleTemplates.length);
    return titleTemplates[randomIndex];
}

/**
 * イントロダクションを生成する
 */
function generateIntroduction(
    topic: string,
    targetAudience: string,
    scriptStyle: ScriptStyle,
    scriptTone: ScriptTone
): string {
    let intro = '';

    // スタイルに応じたイントロダクションを生成
    switch (scriptStyle) {
        case '教育的':
            intro = `こんにちは、皆さん。今日は${topic}について詳しく解説していきます。この動画を見終わる頃には、${topic}の基本から応用まで、しっかりと理解できるようになっているでしょう。`;
            break;
        case 'エンターテイメント':
            intro = `やあ、みんな！今日は${topic}についての面白い話をシェアしていきます。驚きの事実や意外な裏話も満載なので、最後まで見てくださいね！`;
            break;
        case '解説':
            intro = `皆さん、こんにちは。今回は多くの方から質問をいただいている${topic}について、徹底的に解説していきます。複雑に見えるこのトピックも、順を追って説明していくので安心してください。`;
            break;
        case 'ストーリーテリング':
            intro = `${topic}について考えたことはありますか？今日は、私自身の経験を交えながら、${topic}についての興味深いストーリーをお話しします。`;
            break;
        case 'チュートリアル':
            intro = `こんにちは！今日は${topic}の具体的な方法をステップバイステップで解説していきます。この動画を見れば、あなたも簡単に実践できるようになりますよ。`;
            break;
        default:
            intro = `こんにちは、今日は${topic}について話していきます。`;
    }

    // ターゲットオーディエンスに合わせた文言を追加
    intro += `\n\nこの動画は特に${targetAudience}の方に向けて作りました。`;

    // トーンに応じた文言を追加
    switch (scriptTone) {
        case 'カジュアル':
            intro += `\n\nリラックスして見てくださいね！難しい話は一切なしで、楽しく${topic}について学んでいきましょう。`;
            break;
        case 'プロフェッショナル':
            intro += `\n\n信頼性の高い情報と専門的な知見に基づいて、${topic}の本質に迫ります。`;
            break;
        case '親しみやすい':
            intro += `\n\n友達と話すような感覚で、${topic}について一緒に考えていきましょう。`;
            break;
        case '熱意的':
            intro += `\n\n${topic}の素晴らしさを皆さんと共有できることに、心から興奮しています！`;
            break;
        case '冷静':
            intro += `\n\n客観的な視点から${topic}を分析し、バランスの取れた情報をお届けします。`;
            break;
        default:
            intro += `\n\nそれでは、${topic}について見ていきましょう。`;
    }

    // 動画の内容予告
    intro += `\n\nこの動画では、以下のことについて話していきます：`;

    return intro;
}

/**
 * セクションの内容を生成する
 */
function generateSectionContent(
    sectionTitle: string,
    topic: string,
    keywords: string[],
    scriptStyle: ScriptStyle,
    sectionIndex: number
): string {
    // キーワードを使用
    const keywordsToUse = keywords.slice(0, 3);
    const keywordText = keywordsToUse.length > 0
        ? `特に${keywordsToUse.join('、')}といった重要なポイントに注目しながら、`
        : '';

    // スタイルに応じた内容を生成
    let content = '';
    switch (scriptStyle) {
        case '教育的':
            content = `${sectionTitle}について説明します。${keywordText}${topic}の${sectionTitle.replace(`${topic}の`, '')}を理解することは非常に重要です。\n\n`;
            content += `まず、${sectionTitle.replace(`${topic}の`, '')}の定義から始めましょう。これは...（詳細な説明）\n\n`;
            content += `次に、具体例を見てみましょう。例えば...（例の説明）\n\n`;
            content += `最後に、${sectionTitle.replace(`${topic}の`, '')}の重要なポイントをまとめると...（ポイントのまとめ）`;
            break;
        case 'エンターテイメント':
            content = `さて、${sectionTitle}についての面白い話です！${keywordText}あなたが知らなかったかもしれない事実をお伝えします。\n\n`;
            content += `実は...（驚きの事実）\n\n`;
            content += `さらに面白いことに...（興味深い情報）\n\n`;
            content += `信じられないかもしれませんが...（意外な結論）`;
            break;
        case '解説':
            content = `${sectionTitle}について詳しく解説します。${keywordText}一つ一つ丁寧に説明していきます。\n\n`;
            content += `${sectionTitle.replace(`${topic}の`, '')}の背景には...（背景説明）\n\n`;
            content += `これが重要な理由は...（重要性の説明）\n\n`;
            content += `具体的には次のようになります...（詳細な解説）`;
            break;
        case 'ストーリーテリング':
            content = `${sectionTitle}に関する興味深いストーリーをお話しします。${keywordText}私の経験を交えながら説明します。\n\n`;
            content += `あるとき...（ストーリーの導入）\n\n`;
            content += `そして...（ストーリーの展開）\n\n`;
            content += `最終的に...（ストーリーの結論と教訓）`;
            break;
        case 'チュートリアル':
            content = `${sectionTitle}の具体的な方法を説明します。${keywordText}ステップバイステップで進めていきましょう。\n\n`;
            content += `ステップ1: ...（最初のステップ）\n\n`;
            content += `ステップ2: ...（次のステップ）\n\n`;
            content += `ステップ3: ...（最後のステップ）\n\n`;
            content += `これらのステップを実行すれば、${sectionTitle.replace(`${topic}の`, '')}を簡単に実現できます。`;
            break;
        default:
            content = `${sectionTitle}について説明します。${keywordText}重要なポイントを見ていきましょう。`;
    }

    return content;
}

/**
 * スクリプトのセクションを生成する
 */
function generateScriptSections(
    topic: string,
    keywords: string[],
    scriptStyle: ScriptStyle,
    scriptLength: string,
    includeTimestamps: boolean,
    videoPlanningData?: any
): ScriptSection[] {
    // セクション数を決定
    let sectionCount;
    switch (scriptLength) {
        case 'short':
            sectionCount = 3;
            break;
        case 'medium':
            sectionCount = 5;
            break;
        case 'long':
            sectionCount = 7;
            break;
        default:
            sectionCount = 5;
    }

    // 動画企画データがある場合はそれを利用
    if (videoPlanningData && videoPlanningData.contentStructure) {
        return videoPlanningData.contentStructure.map((section: any, index: number) => {
            return {
                title: section.section,
                content: generateSectionContent(section.section, topic, keywords, scriptStyle, index),
                duration: section.duration,
                purpose: section.purpose,
            };
        });
    }

    // セクションのテンプレート
    const sectionTemplates = [
        { title: `${topic}の基本概念`, purpose: '視聴者に基礎知識を提供する' },
        { title: `${topic}の重要性`, purpose: 'トピックの価値を強調する' },
        { title: `${topic}の主な特徴`, purpose: '主要な特徴を説明する' },
        { title: `${topic}の実践方法`, purpose: '実践的なステップを提供する' },
        { title: `${topic}の一般的な誤解`, purpose: '誤解を解消する' },
        { title: `${topic}の応用例`, purpose: '実世界での応用を示す' },
        { title: `${topic}の将来展望`, purpose: '今後の発展について考察する' },
        { title: `${topic}に関するよくある質問`, purpose: '一般的な疑問に答える' },
        { title: `${topic}の専門家の見解`, purpose: '専門家の意見を紹介する' },
        { title: `${topic}のケーススタディ`, purpose: '具体的な事例を分析する' },
    ];

    // セクションを生成
    const sections: ScriptSection[] = [];
    for (let i = 0; i < sectionCount; i++) {
        const templateIndex = i % sectionTemplates.length;
        const template = sectionTemplates[templateIndex];

        // 動画の長さに応じてセクションの長さを調整
        let duration;
        switch (scriptLength) {
            case 'short':
                duration = `${Math.floor(Math.random() * 30 + 30)}秒`;
                break;
            case 'medium':
                duration = `${Math.floor(Math.random() * 60 + 60)}秒`;
                break;
            case 'long':
                duration = `${Math.floor(Math.random() * 120 + 120)}秒`;
                break;
            default:
                duration = `${Math.floor(Math.random() * 60 + 60)}秒`;
        }

        // タイムスタンプを含める場合
        let title = template.title;
        if (includeTimestamps) {
            // 簡易的なタイムスタンプを生成
            const minutes = Math.floor(i * 2);
            const seconds = Math.floor(Math.random() * 60);
            title = `[${minutes}:${seconds.toString().padStart(2, '0')}] ${title}`;
        }

        sections.push({
            title,
            content: generateSectionContent(template.title, topic, keywords, scriptStyle, i),
            duration,
            purpose: template.purpose,
        });
    }

    return sections;
}

/**
 * 結論を生成する
 */
function generateConclusion(topic: string, scriptStyle: ScriptStyle): string {
    let conclusion = '';

    // スタイルに応じた結論を生成
    switch (scriptStyle) {
        case '教育的':
            conclusion = `以上、${topic}について解説しました。今回学んだ内容をまとめると：\n\n`;
            conclusion += `1. ${topic}の基本概念\n`;
            conclusion += `2. ${topic}の重要性\n`;
            conclusion += `3. ${topic}の実践方法\n\n`;
            conclusion += `これらの知識を活用して、ぜひ${topic}に取り組んでみてください。`;
            break;
        case 'エンターテイメント':
            conclusion = `いかがでしたか？${topic}についての面白い事実や裏話をお届けしました。\n\n`;
            conclusion += `特に驚きだったのは...（ハイライトの要約）\n\n`;
            conclusion += `${topic}の世界はまだまだ奥深く、これからも新たな発見があるでしょう。`;
            break;
        case '解説':
            conclusion = `今回は${topic}について徹底的に解説しました。重要なポイントを振り返ると：\n\n`;
            conclusion += `・${topic}の本質は...（本質の要約）\n`;
            conclusion += `・注意すべき点は...（注意点の要約）\n`;
            conclusion += `・最も効果的な方法は...（効果的な方法の要約）\n\n`;
            conclusion += `これらの情報が${topic}の理解に役立てば幸いです。`;
            break;
        case 'ストーリーテリング':
            conclusion = `${topic}についてのストーリーはいかがでしたか？このストーリーから学べることは：\n\n`;
            conclusion += `・${topic}は...（教訓1）\n`;
            conclusion += `・私たちは...（教訓2）\n`;
            conclusion += `・最終的に...（教訓3）\n\n`;
            conclusion += `このストーリーがあなたの${topic}への理解を深める一助となれば嬉しいです。`;
            break;
        case 'チュートリアル':
            conclusion = `以上が${topic}の方法です。今回のチュートリアルで学んだことをまとめると：\n\n`;
            conclusion += `1. まず...（ステップ1の要約）\n`;
            conclusion += `2. 次に...（ステップ2の要約）\n`;
            conclusion += `3. 最後に...（ステップ3の要約）\n\n`;
            conclusion += `これらのステップを実践すれば、${topic}を簡単に実現できるはずです。`;
            break;
        default:
            conclusion = `以上、${topic}についてでした。今回の内容が参考になれば幸いです。`;
    }

    return conclusion;
}

/**
 * コール・トゥ・アクションを生成する
 */
function generateCallToAction(scriptTone: ScriptTone): string {
    let cta = '';

    // トーンに応じたCTAを生成
    switch (scriptTone) {
        case 'カジュアル':
            cta = `この動画が役に立ったら、ぜひチャンネル登録とグッドボタンをポチっとお願いします！コメント欄にも感想や質問を書いてくれると嬉しいです。次回の動画もお楽しみに！`;
            break;
        case 'プロフェッショナル':
            cta = `本日の内容が皆様のお役に立てば幸いです。より詳しい情報は、動画説明欄のリンクからご確認いただけます。チャンネル登録いただくと、今後も質の高い情報をお届けいたします。ご視聴ありがとうございました。`;
            break;
        case '親しみやすい':
            cta = `今日はここまで！この動画が少しでも参考になったなら、チャンネル登録と高評価をしてもらえると嬉しいです。コメント欄でも皆さんの意見や質問を待ってます。また次回お会いしましょう！`;
            break;
        case '熱意的':
            cta = `いかがでしたか？この素晴らしいトピックについてもっと知りたい方は、今すぐチャンネル登録ボタンを押して、通知ベルをオンにしてください！次回の動画も絶対に見逃せない内容になっています。コメント欄でも皆さんの熱い感想をお待ちしています！`;
            break;
        case '冷静':
            cta = `本日の内容は以上となります。より詳細な情報や参考資料は、動画説明欄に記載しております。ご質問やご意見がございましたら、コメント欄にお寄せください。チャンネル登録いただくと、今後の更新をお知らせいたします。ご視聴ありがとうございました。`;
            break;
        default:
            cta = `チャンネル登録と高評価をよろしくお願いします。コメント欄でも皆さんの意見をお待ちしています。ご視聴ありがとうございました。`;
    }

    return cta;
}

/**
 * 完全なスクリプトを組み立てる
 */
function assembleFullScript(
    introduction: string,
    sections: ScriptSection[],
    conclusion: string,
    callToAction: string
): string {
    let fullScript = introduction + '\n\n';

    // セクションの内容を追加
    sections.forEach((section, index) => {
        fullScript += `## ${section.title}\n\n`;
        fullScript += `${section.content}\n\n`;
    });

    // 結論とCTAを追加
    fullScript += `## まとめ\n\n`;
    fullScript += conclusion + '\n\n';
    fullScript += `## 最後に\n\n`;
    fullScript += callToAction;

    return fullScript;
}

/**
 * YouTube動画スクリプトを生成する主要関数
 */
async function generateYoutubeVideoScript(
    topic: string,
    targetAudience: string,
    keywords: string[] = [],
    scriptStyle: ScriptStyle = '教育的',
    scriptTone: ScriptTone = 'カジュアル',
    scriptLength: string = DEFAULT_SCRIPT_LENGTH,
    includeTimestamps: boolean = false,
    videoPlanningData?: any
): Promise<VideoScriptOutput> {
    try {
        console.log(`Generating script for topic: ${topic}, style: ${scriptStyle}, tone: ${scriptTone}, length: ${scriptLength}`);

        // ステップ1: タイトルを生成
        const title = generateScriptTitle(topic, keywords);

        // ステップ2: イントロダクションを生成
        const introduction = generateIntroduction(topic, targetAudience, scriptStyle, scriptTone);

        // ステップ3: セクションを生成
        const sections = generateScriptSections(topic, keywords, scriptStyle, scriptLength, includeTimestamps, videoPlanningData);

        // ステップ4: 結論を生成
        const conclusion = generateConclusion(topic, scriptStyle);

        // ステップ5: コール・トゥ・アクションを生成
        const callToAction = generateCallToAction(scriptTone);

        // ステップ6: 完全なスクリプトを組み立て
        const fullScript = assembleFullScript(introduction, sections, conclusion, callToAction);

        // ステップ7: メタデータを生成
        const metadata: ScriptMetadata = {
            estimatedDuration: estimateVideoDuration(scriptLength, fullScript),
            wordCount: countWords(fullScript),
            targetAudience,
            keywordsUsed: extractKeywordsUsed(fullScript, keywords),
            processingTime: 0, // 後で更新される
        };

        // 結果を返す
        return {
            title,
            introduction,
            sections,
            conclusion,
            callToAction,
            fullScript,
            metadata,
        };
    } catch (error) {
        console.error('Error generating YouTube video script:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`動画スクリプト生成中にエラーが発生しました: ${errorMessage}`);
    }
}

export const youtubeVideoScriptGeneratorTool = createTool({
    id: 'youtube-video-script-generator',
    description: 'Generate a complete script for YouTube videos based on topic and keywords',
    inputSchema: z.object({
        topic: z.string().describe('The main topic of the video'),
        keywords: z.array(z.string()).optional().describe('Keywords to include in the script'),
        targetAudience: z.string().describe('Description of the target audience'),
        scriptStyle: z.enum(['教育的', 'エンターテイメント', '解説', 'ストーリーテリング', 'チュートリアル']).optional().describe('Style of the script'),
        scriptTone: z.enum(['カジュアル', 'プロフェッショナル', '親しみやすい', '熱意的', '冷静']).optional().describe('Tone of the script'),
        scriptLength: z.enum(['short', 'medium', 'long']).optional().describe('Length of the script (short: 3-5 min, medium: 7-12 min, long: 15-20 min)'),
        includeTimestamps: z.boolean().optional().describe('Whether to include timestamps in the script'),
        videoPlanningData: z.any().optional().describe('Optional video planning data from the video planning tool'),
    }),
    outputSchema: z.object({
        title: z.string(),
        introduction: z.string(),
        sections: z.array(z.object({
            title: z.string(),
            content: z.string(),
            duration: z.string(),
            purpose: z.string(),
        })),
        conclusion: z.string(),
        callToAction: z.string(),
        fullScript: z.string(),
        metadata: z.object({
            estimatedDuration: z.string(),
            wordCount: z.number(),
            targetAudience: z.string(),
            keywordsUsed: z.array(z.string()),
            processingTime: z.number(),
        }),
    }),
    execute: async (params) => {
        try {
            const context = params.context;
            console.log(`Generating video script for topic: ${context.topic}`);
            const startTime = Date.now();

            // 必須入力の検証
            if (!context.topic) {
                throw new Error('動画トピックは必須です');
            }

            if (!context.targetAudience) {
                throw new Error('ターゲットオーディエンスは必須です');
            }

            // 動画スクリプトを生成
            const result = await generateYoutubeVideoScript(
                context.topic,
                context.targetAudience,
                context.keywords || [],
                context.scriptStyle || '教育的',
                context.scriptTone || 'カジュアル',
                context.scriptLength || DEFAULT_SCRIPT_LENGTH,
                context.includeTimestamps || false,
                context.videoPlanningData
            );

            // 処理時間を計算
            const endTime = Date.now();
            const processingTime = (endTime - startTime) / 1000; // 秒単位

            // 結果を返す
            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    processingTime,
                }
            };
        } catch (error) {
            console.error('Error in youtubeVideoScriptGeneratorTool:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`動画スクリプト生成中にエラーが発生しました: ${errorMessage}`);
        }
    },
});

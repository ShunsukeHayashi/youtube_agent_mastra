import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const youtubeVideoScriptGeneratorTool = createTool({
  id: 'youtube-video-script-generator',
  description: 'Generate comprehensive YouTube video scripts based on topics and requirements',
  inputSchema: z.object({
    topic: z.string().describe('The main topic of the video'),
    keywords: z.array(z.string()).optional().default([]).describe('Keywords to include in the script'),
    targetAudience: z.string().describe('Description of the target audience'),
    scriptStyle: z.enum(['教育的', 'エンターテイメント', '解説', 'ストーリーテリング', 'チュートリアル']).optional().default('教育的').describe('Style of the script'),
    scriptTone: z.enum(['カジュアル', 'プロフェッショナル', '親しみやすい', '熱意的', '冷静']).optional().default('カジュアル').describe('Tone of the script'),
    scriptLength: z.enum(['short', 'medium', 'long']).optional().default('medium').describe('Length of the script'),
    includeTimestamps: z.boolean().optional().default(false).describe('Whether to include timestamps in the script'),
    videoPlanningData: z.any().optional().describe('Additional video planning data to enhance script'),
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
  execute: async ({ context }) => {
    const startTime = Date.now();
    
    // Generate script content based on input parameters
    const {
      topic,
      keywords = [],
      targetAudience,
      scriptStyle = '教育的',
      scriptTone = 'カジュアル',
      scriptLength = 'medium',
      includeTimestamps = false,
      videoPlanningData,
    } = context;

    // Determine script parameters based on length
    const lengthConfig = {
      short: { 
        sections: 3, 
        wordsPerSection: 200,
        estimatedDuration: '5-8分',
        totalWords: 600
      },
      medium: { 
        sections: 5, 
        wordsPerSection: 250,
        estimatedDuration: '10-15分',
        totalWords: 1250
      },
      long: { 
        sections: 7, 
        wordsPerSection: 300,
        estimatedDuration: '15-25分',
        totalWords: 2100
      }
    };

    const config = lengthConfig[scriptLength];

    // Generate title
    const title = generateTitle(topic, keywords, scriptStyle);

    // Generate introduction
    const introduction = generateIntroduction(topic, targetAudience, scriptTone);

    // Generate sections
    const sections = generateSections(topic, keywords, config.sections, scriptStyle, scriptTone, config.wordsPerSection, includeTimestamps);

    // Generate conclusion
    const conclusion = generateConclusion(topic, scriptStyle, scriptTone);

    // Generate call to action
    const callToAction = generateCallToAction(targetAudience, scriptTone);

    // Compile full script
    const fullScript = compileFullScript(title, introduction, sections, conclusion, callToAction, includeTimestamps);

    // Calculate metadata
    const processingTime = Date.now() - startTime;
    const wordCount = fullScript.split(' ').length;
    const keywordsUsed = extractUsedKeywords(fullScript, keywords);

    return {
      title,
      introduction,
      sections,
      conclusion,
      callToAction,
      fullScript,
      metadata: {
        estimatedDuration: config.estimatedDuration,
        wordCount,
        targetAudience,
        keywordsUsed,
        processingTime,
      },
    };
  },
});

function generateTitle(topic: string, keywords: string[], style: string): string {
  const styleMap = {
    '教育的': ['学ぶ', '完全ガイド', '徹底解説', 'マスター'],
    'エンターテイメント': ['面白い', '驚きの', '知られざる', '衝撃の'],
    '解説': ['解説', '分析', '詳しく', '理解'],
    'ストーリーテリング': ['物語', 'ストーリー', '体験談', '実話'],
    'チュートリアル': ['やり方', '方法', 'ステップ', 'ガイド'],
  };

  const styleWords = styleMap[style as keyof typeof styleMap] || styleMap['教育的'];
  const styleWord = styleWords[Math.floor(Math.random() * styleWords.length)];
  
  return `${topic}の${styleWord}【${keywords.slice(0, 2).join('・')}】`;
}

function generateIntroduction(topic: string, targetAudience: string, tone: string): string {
  const toneMap = {
    'カジュアル': '皆さん、こんにちは！',
    'プロフェッショナル': 'ご視聴いただき、ありがとうございます。',
    '親しみやすい': 'みなさん、お疲れ様です！',
    '熱意的': '皆さん、今日も素晴らしい一日ですね！',
    '冷静': '本日の動画をご視聴いただき、誠にありがとうございます。',
  };

  const greeting = toneMap[tone as keyof typeof toneMap] || toneMap['カジュアル'];
  
  return `${greeting}

今回は「${topic}」について詳しく解説していきます。

この動画は${targetAudience}の方々に向けて制作しており、${topic}について包括的に理解していただけるような内容になっています。

最後まで見ていただければ、きっと新しい発見があるはずです。それでは、さっそく始めていきましょう！`;
}

function generateSections(topic: string, keywords: string[], numSections: number, style: string, tone: string, wordsPerSection: number, includeTimestamps: boolean): Array<{title: string, content: string, duration: string, purpose: string}> {
  const sections = [];
  const sectionTitles = [
    `${topic}とは何か？基本概念の理解`,
    `${topic}の重要なポイント`,
    `${topic}の具体的な活用方法`,
    `${topic}のメリットとデメリット`,
    `${topic}を成功させるためのコツ`,
    `${topic}のトレンドと将来性`,
    `${topic}でよくある間違いと対策`,
  ];

  for (let i = 0; i < numSections; i++) {
    const title = sectionTitles[i] || `${topic}について - パート${i + 1}`;
    const content = generateSectionContent(title, keywords, style, tone, wordsPerSection);
    const duration = calculateSectionDuration(wordsPerSection);
    const purpose = generateSectionPurpose(i, numSections);

    sections.push({
      title,
      content,
      duration,
      purpose,
    });
  }

  return sections;
}

function generateSectionContent(title: string, keywords: string[], style: string, tone: string, targetWords: number): string {
  // Generate content based on style and tone
  const baseContent = `${title}について詳しく見ていきましょう。

この部分では、${keywords.slice(0, 3).join('、')}などの重要な要素を中心に説明します。

まず最初に理解しておきたいのは、基本的な概念と仕組みです。これらを押さえることで、より深い理解につながります。

次に、実際の活用例や具体的な方法について見ていきます。理論だけでなく、実践的な側面も重要です。

最後に、注意すべきポイントや成功のためのコツについてもお話しします。`;

  // Adjust content length to approximate target word count
  const currentWords = baseContent.split(' ').length;
  if (currentWords < targetWords) {
    const additionalContent = '\n\nさらに詳しく説明すると、この分野では継続的な学習と実践が重要になってきます。最新の情報を常にキャッチアップし、自分なりの方法を見つけることが成功への鍵となります。';
    return baseContent + additionalContent;
  }

  return baseContent;
}

function calculateSectionDuration(words: number): string {
  // Assuming 150 words per minute speaking rate
  const minutes = Math.ceil(words / 150);
  return `約${minutes}分`;
}

function generateSectionPurpose(index: number, total: number): string {
  const purposes = [
    '基礎知識の確立',
    '重要ポイントの理解',
    '実践的な応用',
    'メリット・デメリットの把握',
    '成功要因の理解',
    '将来展望の共有',
    '注意点の確認',
  ];

  return purposes[index] || `セクション${index + 1}の目的`;
}

function generateConclusion(topic: string, style: string, tone: string): string {
  return `いかがでしたでしょうか？

今回は${topic}について詳しく解説させていただきました。

重要なポイントをまとめると：
- 基本的な概念と仕組みの理解
- 実践的な活用方法
- 成功のためのコツと注意点

これらの内容が皆さんのお役に立てれば幸いです。`;
}

function generateCallToAction(targetAudience: string, tone: string): string {
  return `もしこの動画が役に立ったと思っていただけましたら、ぜひ「いいね」ボタンを押していただけると嬉しいです！

また、チャンネル登録もお忘れなく。通知ベルも一緒に押していただくと、新しい動画の情報をすぐにお届けできます。

コメント欄では、皆さんの質問や感想をお待ちしています。できる限りお返事させていただきますので、お気軽にどうぞ！

それでは、次回の動画でまたお会いしましょう。最後までご視聴いただき、ありがとうございました！`;
}

function compileFullScript(title: string, introduction: string, sections: Array<{title: string, content: string}>, conclusion: string, callToAction: string, includeTimestamps: boolean): string {
  let script = `【${title}】

${introduction}

`;

  sections.forEach((section, index) => {
    if (includeTimestamps) {
      const timestamp = `[${String(index * 3).padStart(2, '0')}:00]`;
      script += `${timestamp} ${section.title}\n\n${section.content}\n\n`;
    } else {
      script += `## ${section.title}\n\n${section.content}\n\n`;
    }
  });

  script += `## まとめ\n\n${conclusion}\n\n`;
  script += `## 最後に\n\n${callToAction}`;

  return script;
}

function extractUsedKeywords(script: string, keywords: string[]): string[] {
  return keywords.filter(keyword => 
    script.toLowerCase().includes(keyword.toLowerCase())
  );
}
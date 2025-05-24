/**
 * APIエンドポイントのテスト
 */
const http = require('http');

function testApi() {
    console.log('APIエンドポイントにリクエストを送信中...');

    const data = JSON.stringify({
        videoTopic: 'プログラミング初心者向けのJavaScript入門講座',
        targetAudience: 'プログラミング初心者、20代〜30代',
        contentType: '教育',
        keyPoints: ['変数の基本', '関数の使い方', '条件分岐', 'ループ処理'],
        titleCount: 3
    });

    const options = {
        hostname: 'localhost',
        port: 4111,
        path: '/title-generator',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`ステータスコード: ${res.statusCode}`);

        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            try {
                const parsedData = JSON.parse(responseData);
                console.log('レスポンス:', JSON.stringify(parsedData, null, 2));
            } catch (e) {
                console.error('JSONのパースに失敗しました:', e);
                console.log('生のレスポンス:', responseData);
            }
        });
    });

    req.on('error', (error) => {
        console.error('エラーが発生しました:', error);
    });

    req.write(data);
    req.end();
}

// テストの実行
testApi();
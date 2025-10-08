// api/analyze.js - 後端處理 DeepSeek AI 分析
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

module.exports = async (req, res) => {
    // 設置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 請求' });
    }

    try {
        const { action, constitution, element_balance, yong_shen, symptoms, hexagram_info } = req.body;

        if (action === 'ai_tcm_analysis') {
            const analysis = await getDeepSeekTCMAnalysis({
                constitution,
                element_balance, 
                yong_shen,
                symptoms,
                hexagram_info
            });
            return res.json({ success: true, data: analysis });
        } else {
            return res.status(400).json({ error: '未知的操作類型' });
        }
    } catch (error) {
        console.error('API 錯誤:', error);
        return res.status(500).json({ error: '伺服器內部錯誤' });
    }
};

// 調用 DeepSeek API 進行中醫分析
async function getDeepSeekTCMAnalysis(data) {
    const prompt = generateTCMPrompt(data);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: '你是一位資深中醫師，精通易經卦象與中醫五行理論。請根據用戶提供的卦象資訊和五行旺弱，進行專業的中醫體質分析和養生建議。'
                },
                {
                    role: 'user', 
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        throw new Error(`DeepSeek API 錯誤: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    // 解析 AI 回應為結構化數據
    return parseAIResponse(aiResponse);
}

// 生成給 AI 的提示詞
function generateTCMPrompt(data) {
    return `
請根據以下易經卦象和中醫五行資訊，進行專業的中醫體質分析：

## 卦象資訊：
- 卦宮五行：${data.constitution}
- 用神：${data.yong_shen}
- 上卦：${data.hexagram_info.upper}
- 下卦：${data.hexagram_info.lower}
- 動爻位置：${data.hexagram_info.moving_yao.map((mv, i) => mv ? i+1 : null).filter(Boolean).join('、') || '無'}
- 四柱：${data.hexagram_info.pillars.year} ${data.hexagram_info.pillars.month} ${data.hexagram_info.pillars.day} ${data.hexagram_info.pillars.hour}

## 五行旺弱分析：
${Object.entries(data.element_balance).map(([elem, score]) => 
    `- ${elem}：${score}/10 ${score >= 8 ? '（過旺）' : score <= 4 ? '（偏弱）' : '（平和）'}`
).join('\n')}

## 症狀描述：
${data.symptoms || '無具體症狀描述'}

## 請提供以下結構化分析：
1. 辨證診斷（基於五行和卦象）
2. 經絡氣血分析
3. 中藥建議（2-3種）
4. 穴位按摩建議
5. 生活調養建議
6. 飲食建議
7. 風險等級評估（高/中/低）
8. 注意事項

請用專業但易懂的中文回答，並確保建議的實用性。
    `;
}

// 解析 AI 回應為結構化數據
function parseAIResponse(aiText) {
    // 這裡可以根據 AI 的回應格式進行解析
    // 簡單版本：直接返回文本，或者使用更複雜的解析邏輯
    return {
        diagnosis: extractSection(aiText, '辨證診斷'),
        meridian_analysis: extractSection(aiText, '經絡氣血分析'),
        pattern_type: '待AI分析', // 從文本中提取
        risk_level: '中', // 從文本中提取
        recommendations: {
            herbs: [
                { name: '待AI建議', function: '調理氣血', usage: '請遵醫囑' }
            ],
            acupoints: [
                { name: '待AI建議', function: '疏通經絡' }
            ],
            lifestyle: ['規律作息', '適度運動'],
            diet: ['均衡飲食', '避免生冷']
        },
        warning: '本分析僅供參考，具體診療請諮詢專業中醫師'
    };
}

function extractSection(text, sectionName) {
    const regex = new RegExp(`${sectionName}[：:]\\s*([^]*?)(?=\\d+\\.|$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : 'AI未提供具體分析';
}

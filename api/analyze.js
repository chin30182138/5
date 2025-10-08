// api/analyze.js - 適用於 Vercel
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
    // 在 Vercel 中直接使用 process.env
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API Key 未設定');
    }

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
    
    return parseAIResponse(aiResponse);
}

// 其他函數保持不變...
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

function parseAIResponse(aiText) {
    // 簡單解析邏輯
    return {
        diagnosis: extractSection(aiText, '辨證診斷') || '基於卦象分析，您的體質需要進一步調理。',
        meridian_analysis: extractSection(aiText, '經絡氣血分析') || '經絡氣血運行需要關注。',
        pattern_type: extractPatternType(aiText),
        risk_level: extractRiskLevel(aiText),
        recommendations: {
            herbs: extractHerbs(aiText),
            acupoints: extractAcupoints(aiText),
            lifestyle: extractLifestyle(aiText),
            diet: extractDiet(aiText)
        },
        warning: '本分析僅供參考，具體診療請諮詢專業中醫師。',
        raw_analysis: aiText // 保留原始分析文本
    };
}

// 輔助解析函數
function extractSection(text, sectionName) {
    const lines = text.split('\n');
    let inSection = false;
    let content = [];
    
    for (const line of lines) {
        if (line.includes(sectionName)) {
            inSection = true;
            continue;
        }
        if (inSection) {
            if (line.match(/^\d+\./) || line.includes('：') || line.trim() === '') {
                break;
            }
            content.push(line.trim());
        }
    }
    
    return content.filter(line => line).join(' ') || null;
}

function extractPatternType(text) {
    if (text.includes('氣虛') || text.includes('氣不足')) return '氣虛證';
    if (text.includes('血虛')) return '血虛證';
    if (text.includes('陰虛')) return '陰虛證';
    if (text.includes('陽虛')) return '陽虛證';
    if (text.includes('濕熱')) return '濕熱證';
    if (text.includes('氣滯')) return '氣滯證';
    return '複合證型';
}

function extractRiskLevel(text) {
    if (text.includes('高風險') || text.includes('嚴重') || text.includes('立即就醫')) return '高';
    if (text.includes('中度') || text.includes('注意')) return '中';
    return '低';
}

function extractHerbs(text) {
    // 簡單提取中藥建議
    const herbs = [];
    if (text.includes('黃芪')) herbs.push({ name: '黃芪', function: '補氣固表', usage: '請遵醫囑' });
    if (text.includes('當歸')) herbs.push({ name: '當歸', function: '補血活血', usage: '請遵醫囑' });
    if (text.includes('枸杞')) herbs.push({ name: '枸杞', function: '滋補肝腎', usage: '適量泡水' });
    if (text.includes('茯苓')) herbs.push({ name: '茯苓', function: '健脾利濕', usage: '請遵醫囑' });
    
    return herbs.length > 0 ? herbs : [{ name: '請諮詢中醫師', function: '個人化配方', usage: '需專業診斷' }];
}

function extractAcupoints(text) {
    const points = [];
    if (text.includes('足三里')) points.push({ name: '足三里', function: '健脾益氣' });
    if (text.includes('合谷')) points.push({ name: '合谷穴', function: '疏風解表' });
    if (text.includes('太衝')) points.push({ name: '太衝穴', function: '疏肝理氣' });
    
    return points.length > 0 ? points : [{ name: '請諮詢中醫師', function: '個人化穴位配方' }];
}

function extractLifestyle(text) {
    const advice = ['保持規律作息', '適度運動', '情緒調節'];
    if (text.includes('熬夜')) advice.push('避免熬夜');
    if (text.includes('壓力')) advice.push('減輕壓力');
    return advice;
}

function extractDiet(text) {
    const advice = ['均衡飲食', '多喝溫水'];
    if (text.includes('生冷')) advice.push('避免生冷食物');
    if (text.includes('辛辣')) advice.push('減少辛辣刺激');
    return advice;
}

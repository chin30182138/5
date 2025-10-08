// api/analyze.js - 後端分析 API
const TCM_API_KEY = process.env.TCM_API_KEY; // 從環境變數讀取 API Key

module.exports = async (req, res) => {
    // 設置 CORS 頭部
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
        const { action, constitution, element_balance, symptoms } = req.body;

        if (action === 'tcm_advice') {
            const advice = await getTCMAdvice(constitution, element_balance, symptoms || []);
            return res.json(advice);
        } else {
            return res.status(400).json({ error: '未知的操作類型' });
        }
    } catch (error) {
        console.error('API 錯誤:', error);
        return res.status(500).json({ error: '伺服器內部錯誤' });
    }
};

// 中醫建議函數
async function getTCMAdvice(constitution, element_balance, symptoms) {
    // 如果有 API Key，使用外部中醫 API
    if (TCM_API_KEY && TCM_API_KEY !== 'your_actual_tcm_api_key_here') {
        try {
            const externalResponse = await fetch('https://api.tcmadvisor.com/v1/diagnosis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TCM_API_KEY}`
                },
                body: JSON.stringify({
                    constitution,
                    element_balance,
                    symptoms,
                    language: 'zh-TW'
                })
            });

            if (externalResponse.ok) {
                const data = await externalResponse.json();
                return formatTCMResponse(data);
            }
        } catch (error) {
            console.log('外部中醫 API 失敗，使用本地建議:', error);
        }
    }

    // 使用本地中醫建議
    return getLocalTCMAdvice(constitution);
}

function formatTCMResponse(data) {
    return {
        diagnosis: data.diagnosis || [],
        recommended_departments: data.recommended_departments || [],
        herbal_recommendations: data.herbal_prescriptions || [],
        acupuncture_points: data.acupuncture_points || [],
        lifestyle_advice: data.lifestyle_advice || [],
        diet_recommendations: data.diet_recommendations || []
    };
}

function getLocalTCMAdvice(meElem) {
    const MAP = {
        '木': { 
            zang: '肝', 
            fu: '膽', 
            dept: ['肝膽科', '情志科', '睡眠門診', '骨科/復健科'], 
            patterns: ['肝氣鬱結', '肝火上炎', '肝血不足', '肝腎陰虛', '肝陽上亢'], 
            self: [
                '規律作息，避免熬夜',
                '適度舒展拉筋運動',
                '減少酒精、辛辣食物',
                '保持情緒舒暢，避免過度壓力',
                '可練習太極、瑜伽等舒緩運動'
            ],
            diet: ['綠色蔬菜', '酸味食物', '枸杞', '菊花茶']
        },
        '火': { 
            zang: '心', 
            fu: '小腸', 
            dept: ['心臟內科', '精神科', '睡眠中心', '中醫心系科'], 
            patterns: ['心火亢盛', '心脾兩虛', '心陰不足', '心血瘀阻', '心腎不交'], 
            self: [
                '避免過度興奮刺激',
                '減少咖啡、濃茶攝取',
                '練習冥想、靜坐',
                '保持午間小憩習慣',
                '適度有氧運動但避免過度'
            ],
            diet: ['紅色食物', '苦味食物', '蓮子', '百合', '小麥']
        },
        '土': { 
            zang: '脾', 
            fu: '胃', 
            dept: ['腸胃科', '消化內科', '營養門診', '中醫脾胃科'], 
            patterns: ['脾胃虛弱', '濕困脾胃', '胃氣上逆', '脾不統血', '脾虛濕盛'], 
            self: [
                '定時定量用餐',
                '避免生冷、油膩食物',
                '飯後適度散步',
                '練習腹式呼吸',
                '保持心情愉快避免思慮過度'
            ],
            diet: ['黃色食物', '甘味食物', '山藥', '薏仁', '紅棗']
        },
        '金': { 
            zang: '肺', 
            fu: '大腸', 
            dept: ['胸腔內科', '過敏科', '皮膚科', '耳鼻喉科'], 
            patterns: ['肺氣虛', '肺陰虛', '風寒犯肺', '風熱犯肺', '燥邪傷肺'], 
            self: [
                '避免空氣污染環境',
                '適度深呼吸練習',
                '保持居住環境濕度',
                '規律運動增強肺活量',
                '注意保暖避免感冒'
            ],
            diet: ['白色食物', '辛味食物', '梨子', '蜂蜜', '杏仁']
        },
        '水': { 
            zang: '腎', 
            fu: '膀胱', 
            dept: ['腎臟科', '泌尿科', '內分泌科', '中醫腎系科'], 
            patterns: ['腎陽虛', '腎陰虛', '腎氣不足', '腎精虧虛', '腎不納氣'], 
            self: [
                '保持充足睡眠',
                '避免過度勞累',
                '注意腰部保暖',
                '適度練習腰部運動',
                '避免恐懼驚嚇情緒'
            ],
            diet: ['黑色食物', '鹹味食物', '黑豆', '核桃', '海參']
        }
    };
    
    return MAP[meElem] || MAP['土'];
}

// 五行平衡分析
function analyzeElementBalance(element_balance) {
    const analysis = {
        imbalances: [],
        recommendations: []
    };
    
    // 分析五行強弱
    const elements = Object.entries(element_balance);
    const maxElement = elements.reduce((max, [elem, value]) => value > max.value ? {elem, value} : max, {elem: '', value: 0});
    const minElement = elements.reduce((min, [elem, value]) => value < min.value ? {elem, value} : min, {elem: '', value: 10});
    
    if (maxElement.value >= 8) {
        analysis.imbalances.push(`${maxElement.elem}氣過旺`);
    }
    
    if (minElement.value <= 4) {
        analysis.imbalances.push(`${minElement.elem}氣不足`);
    }
    
    // 根據不平衡給出建議
    if (analysis.imbalances.length > 0) {
        analysis.recommendations.push('建議尋求專業中醫師進行體質調理');
    }
    
    return analysis;
}

export default async function handler(req, res) {
  // 設定 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const { hexagram, request } = req.body;

    if (!hexagram) {
      return res.status(400).json({ error: '卦象數據不能為空' });
    }

    console.log('進行中醫易經分析...', hexagram.name);
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一位精通易經和中醫的專家。請根據用戶提供的易經卦象，從中醫角度分析：
            
1. 對應的體質類型（如陰陽平衡、氣虛、血瘀等）
2. 相關的經絡和臟腑影響
3. 健康養生建議
4. 飲食調理方向
5. 生活作息建議

請用專業但易懂的中文回答，結合傳統中醫理論和易經智慧。`
          },
          {
            role: 'user',
            content: `卦象：${hexagram.name}
描述：${hexagram.description}
卦爻：${hexagram.lines.map(line => line === 1 ? '陽爻' : '陰爻').join('、')}

${request || '請從中醫角度分析這個卦象對應的健康狀況和養生建議。'}`
          }
        ],
        stream: false,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 錯誤:', response.status, errorText);
      throw new Error(`分析服務錯誤: ${response.status}`);
    }

    const data = await response.json();
    console.log('中醫分析完成');
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('伺服器錯誤:', error);
    res.status(500).json({ 
      error: '分析服務暫時不可用',
      details: error.message 
    });
  }
}

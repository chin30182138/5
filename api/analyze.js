export default async function handler(req, res) {
  // 設定 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '訊息內容不能為空' });
    }

    console.log('發送請求到 DeepSeek API...');
    
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
            role: 'user',
            content: message
          }
        ],
        stream: false,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 錯誤:', response.status, errorText);
      throw new Error(`DeepSeek API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek API 回應成功');
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('伺服器錯誤:', error);
    res.status(500).json({ 
      error: '內部伺服器錯誤',
      details: error.message 
    });
  }
}

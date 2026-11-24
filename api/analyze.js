// api/analyze.js － 部署在 Vercel 的後端（GitHub Pages 無法執行）
// 需在 Vercel 專案設定環境變數 DEEPSEEK_API_KEY
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: '只支援 POST' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body.action !== 'ai_tcm_analysis') {
      return res.status(400).json({ success: false, error: '未知的操作類型' });
    }
    const text = await callDeepSeek(buildPrompt(body));
    return res.json({ success: true, data: { raw_analysis: text, model: 'deepseek-chat' } });
  } catch (err) {
    console.error('API 錯誤:', err);
    return res.status(500).json({ success: false, error: err.message || '伺服器內部錯誤' });
  }
};

async function callDeepSeek(prompt) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY 未設定');
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.6,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            '你是精通六爻納甲與中醫五行的老師，使用台灣繁體中文。根據排盤資料，以用神、世爻、官鬼（病象）、子孫（醫藥）的旺衰、空破、動變，配合五行強弱做體質與養生分析。' +
            '不可下醫療診斷、不可開具藥方劑量；需要就醫時直接建議就醫，並以「仍以醫囑為主」作結。輸出使用 Markdown，以 ### 作小標題。'
        },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!r.ok) throw new Error(`DeepSeek API 錯誤 ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

function buildPrompt(d) {
  const h = d.hexagram_info || {};
  const p = h.pillars || {};
  const moving = (h.moving_yao || []).map((m, i) => (m ? i + 1 : null)).filter(Boolean);
  const wx = d.element_balance || {};
  return `## 排盤
- 所問：${h.question || '健康'}
- 本卦：${h.name || ''}（${h.palace || ''}，卦宮五行 ${d.constitution || ''}）${h.bian_name ? `，變卦：${h.bian_name}` : ''}
- 四柱：${p.year || ''}年 ${p.month || ''}月 ${p.day || ''}日 ${p.hour || ''}時，旬空 ${h.kong || ''}
- 動爻：${moving.length ? moving.join('、') + ' 爻' : '無'}
- 用神：${d.yong_shen || '未指定'}

## 各爻（初爻到上爻）
${(h.lines || []).map(l => `- ${l}`).join('\n')}

## 五行力量（1-10）
${Object.entries(wx).map(([k, v]) => `- ${k}：${v}${v >= 8 ? '（偏旺）' : v <= 3 ? '（偏弱）' : ''}`).join('\n')}

## 自述狀況
${d.symptoms || '未提供'}

請依序寫：
### 五行概況
### 世爻與用神
### 官鬼病象與部位
### 子孫醫藥與轉機
### 調養建議（作息、飲食、穴位按摩，各 2-3 點）
### 注意事項`;
}

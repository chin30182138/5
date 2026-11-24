// api/analyze.js － 部署在 Vercel 的後端（GitHub Pages 無法執行）
// 需在 Vercel 專案設定環境變數 DEEPSEEK_API_KEY
// 判斷準則：阿青師《六爻健康預測講義》（仙人指路占卜研究學會）

const RULES = `【六爻健康預測判斷準則（阿青師講義）】
一、取用神：自己看世爻；父母長輩看父母；妻子看妻財；丈夫看官鬼；子女看子孫；兄弟朋友看兄弟；他人看應爻。用神兩現，取動爻（或持世、旺相者），被捨者可輔助提取資訊。
二、疾病不單以官鬼論（官鬼為病、子孫為醫藥是舊法）。依疾病心智圖找「病」：
 1. 用神為病：被日月剋（與剋用之日月同五行入卦亦為病）；空不受元神生；月破（月建可為病）；見病地（十二長生病位：木巳、火申、金亥、水土寅，病地亦可為病）；入墓（木未、火戌、金丑、水土辰，墓庫之爻為病）。
 2. 元神為病：被日月剋；空不能生用；被合貪合忘生；月破；見病地；化空、化破、化退；化出元神空破。
 3. 仇神動來剋元神為病；忌神動來剋用神為病，忌神亦可為墓庫。
 4. 動爻化出官鬼，以化出官鬼為病；化出忌神，以變爻為病。
 5. 官鬼旺相為閒神可當病看；官鬼為墓庫可當病看。
 6. 獨發之爻表原因、性質（以六獸定性質），亦主吉凶、應期，可占此應彼。
 7. 伏藏：用神伏為臥病之象；飛神剋伏為用神被壓；飛神為官鬼以飛神為病。
 8. 主卦卦宮看病類；過旺（用神、元神無剋洩）要反看，物極必反。
三、定部位與病症：將焦點爻的「爻位、內外卦八卦、五行、六親、六獸、地支經絡」取交集。
 爻位：初腳；二腿膝、生殖器、膀胱、大腸肛門；三腹部（肝膽腎膀胱子宮脾胃）、腰、臀；四胸（乳房肺心）、背、脾胃；五臉面五官、咽喉、手臂、胸肺心；上頭、肩、脖子。
 五行：木肝膽神經風疾；火心眼小腸血液；土脾胃皮膚；金肺大腸骨頭；水腎膀胱尿血。
 六親：父母頭面胸背腹臀；兄弟腿腳、肩臂、牙、胃；子孫管路（五官、食道腸、呼吸道、血管、生殖器）、乳房；妻財飲食與流動之物（血液、汗、尿、津液）、腰；官鬼病竈病毒、憂愁。
 六獸：青龍喜氣酒色、痛過敏；朱雀口舌、氣滯、炎症發熱、眼病；勾陳腫瘤增生結石、脾胃皮膚、遲緩癡呆；螣蛇驚恐失眠、萎縮貧血抽筋、細菌病毒、怪病；白虎血病婦科、手術外傷車禍、脾氣；玄武男女科隱疾、濕（風濕潰瘍寒症）、暈眩憂鬱。
 地支經絡：子膽、丑肝、寅肺、卯大腸、辰胃、巳脾、午心、未小腸、申膀胱、酉腎、戌心包、亥三焦。
 狀態取象：空（缺少空洞穿孔不足暈眩）；破（裂縫傷口潰爛折斷）；合（沾黏淤積堵塞拖延）；沖（晃動轉移碰撞）；進（膨脹變大發展）；退（萎縮衰退失效）。
 卦象：反吟病情反覆難去根；伏吟臥床堵塞痛在深處；遊魂病情不穩、擴散、精神不清；歸魂在家治病、病在體內好得慢；六沖近病癒久病凶（月破除外）；六合久病延壽、近病易成慢性留病根。
四、吉凶應期：近應日時，遠應年月。用神動逢值逢合；空待沖待實；破待合待實；被合待沖；忌神逢合之日可癒；久重病元神動必有期。
五、求醫問藥：應為醫藥、世為患者；子孫或元神五行定醫生方位（木東、火南、金西、水北）；子孫空破墓絕藥效差，化官鬼反生疾病，化子孫換藥換醫；子孫臨日旺相或持世不吃藥也會好。`;

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
      temperature: 0.5,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            '你是仙人指路占卜研究學會的六爻健康預測老師，使用台灣繁體中文，嚴格依照下列準則判斷，不可改用「官鬼即病」的舊法。' +
            '網頁已用程式依準則算出「規則判斷」，請以它為骨架，做交集推理，挑出最可能的一至兩個病處，說明理由，不要逐條重抄。' +
            '不可下醫療診斷、不可開具藥方劑量；需要就醫時直接建議就醫，並以「仍以醫囑為主」作結。輸出用 Markdown，以 ### 作小標題。\n\n' + RULES
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
  return `## 排盤
- 所問：${h.question || '健康'}（問誰：${d.patient || '自己'}；病程：${d.course || '不確定'}）
- 本卦：${h.name || ''}（${h.palace || ''}）${h.bian_name ? `，變卦：${h.bian_name}` : ''}
- 四柱：${p.year || ''}年 ${p.month || ''}月 ${p.day || ''}日 ${p.hour || ''}時，旬空 ${h.kong || ''}
- 動爻：${moving.length ? moving.join('、') + ' 爻' : '無'}
- 用神：${d.yong_shen || ''}

## 各爻（初爻到上爻）
${(h.lines || []).map(l => `- ${l}`).join('\n')}

## 規則判斷（程式依準則算出）
${d.rule_findings || '（無）'}

## 自述狀況
${d.symptoms || '未提供'}

請依序寫：
### 病處判斷（最可能的部位與病症，說明取交集的理由）
### 病因
### 吉凶與病程
### 應期
### 求醫與調養建議
### 注意事項`;
}

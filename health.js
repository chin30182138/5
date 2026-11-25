/* =====================================================================
   仙人指路｜六爻健康預測判斷引擎
   依據：阿青師《六爻健康預測講義》（仙人指路占卜研究學會，2024-06-08 印刷版）
   輸入：index.html 的 computeChart() 結果（ch）
   ===================================================================== */
(function (global) {
'use strict';

const ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
const ZHI_WX = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
const SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};
const KE    = {木:'土',土:'水',水:'火',火:'金',金:'木'};
const HE    = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
const chongOf = b => ZHI[(ZHI.indexOf(b) + 6) % 12];
const isChong = (a, b) => chongOf(a) === b;
const YAO = ['初爻','二爻','三爻','四爻','五爻','上爻'];
const KIN_ORDER = ['父母','兄弟','子孫','妻財','官鬼'];      // 依序相生
// 十二長生（六爻法：土隨水）
const MU   = {木:'未',火:'戌',金:'丑',水:'辰',土:'辰'};      // 墓庫
const BING = {木:'巳',火:'申',金:'亥',水:'寅',土:'寅'};      // 病地
const JUE  = {木:'申',火:'亥',金:'寅',水:'巳',土:'巳'};      // 絕地

/* ---------------- 講義對照表 ---------------- */
const T_TRIG = {
  乾:'頭部疾病、男科疾病、筋骨骨骼、胸部（上焦、肺病、傷寒）、大腸（便秘）、老年性疾病',
  兌:'口舌喉（氣管咳嗽痰多、食道飲食不納、牙痛口腔疾病）、膀胱、泌尿系統、肺（氣滯、氣逆喘疾）、外傷手術傷殘、大腸皮膚肛門、貧血、血壓低',
  離:'心臟（眼病、幻覺幻視、上焦失調）、血液病（月經不調、低血壓）、小腸、燒傷、熱病（中暑、發燒）、乳房婦科、肥大增生（心臟肥大、乳腺增生、攝護腺肥大）',
  震:'肝膽（肝火旺）、足部腿病、精神病（狂躁、受驚、多動、神經過敏、神經衰弱）、咳嗽咽炎、羊癲瘋、骨折（木空則折）',
  巽:'肝膽、風疾（中風、血管病）、腸病肛門、風寒（傳染病、傷風感冒、喘息哮喘）、坐骨神經（偏癱、大腿）、淋巴疾病、白眼',
  坎:'腎（背、腰、生殖器、遺精、性病）、膀胱泌尿、血病高血壓、腹瀉、消渴（糖尿病、內分泌失調）、中毒、耳、寒症',
  艮:'背、手臂、關節、氣血不通（血脈）、脾胃、皮膚、鼻子、突起（腫瘤、結石、痘疹、乳房）',
  坤:'脾胃（腹部之病）、消化不良（飲食不納）、婦科生育、更年期疾病、皮膚病'
};
const T_WX = {
  木:'肝、膽、直腸、風疾、神經（味酸、志怒、色青）',
  火:'心臟、眼病、小腸、血液病（味苦、志喜、色赤）',
  土:'脾、胃、皮膚（味甜、志思慮、色黃）',
  金:'肺、大腸、骨頭（味辣、志憂、色白）',
  水:'腎臟、膀胱、尿、血病（味鹹、志恐懼、色黑）'
};
const T_KIN = {
  父母:'頭、面部、胸、背、腹、臀部',
  兄弟:'膀胱、腿腳、肩手臂胳膊、牙、胃（飲食不納、消化不良）',
  子孫:'傳輸管路（耳眼鼻五官、食道腸、呼吸道毛孔、血管、生殖器小便、骨髓）、乳房',
  妻財:'飲食；流動之物（血液、呼吸、眼淚、屎尿、汗水、鼻涕、津液）、腰、毛髮、肛門',
  官鬼:'疾病、病竈病毒、災禍憂愁、功能'
};
const T_YAO = [
  '腳、腳後跟、腳脖子、腳趾（腳氣）',
  '腿膝、生殖器子宮、膀胱、大腸直腸肛門、肝膽',
  '腹部（肝膽、腎、膀胱、子宮、脾胃）、腰、肚臍、臀部',
  '胸（乳房、肺、心口心臟）、背、脾胃',
  '臉面（鼻、耳、口腔、眼睛）、脖子咽喉（食道、氣管）、手臂、胸肺、背脾、胸腔心臟',
  '頭（頭顱、大腦腦神經、面頰、頭髮）、肩膀、手、脖子'
];
const T_BEAST = {
  青龍:'喜氣（因喜得病、飲酒、食物中毒、樂極生悲、興奮過度）、情色（色慾、性病）、產後風、神經（痛、過敏癢、酸疼）',
  朱雀:'消息口舌（狂言亂語、神經失常、幻聽、吵架、官司）、氣滯氣瘀、火（內熱面赤、小便赤黃、炎症發熱燒傷、眼病）',
  勾陳:'突出（結石、癌症、併發症、增生息肉腫瘤、跌打腫脹、胸滿）、土（環境致病、脾胃不和、皮膚）、慢（記憶力下降、癡呆、行動不便）',
  螣蛇:'害怕（驚嚇、惡夢、失眠、心神不寧）、萎縮缺少（貧血、抽筋、營養失調、臟腑不全）、微小細長（腸病、細菌病毒）、怪異（疑難雜症、疤痕）',
  白虎:'血（血病、婦科、月經不調、血崩、懷孕產後）、生氣（易狂、脾氣不好心胸不暢）、路（車禍骨折）、金（刀、手術、槍傷）',
  玄武:'難以啟齒（男科、婦科、不易被發現、生殖器疾病）、濕（風濕、結核、潰爛潰瘍、陰虛、寒症）、暈眩、陰暗（憂鬱症）'
};
const T_ZHI = {
  子:'足少陽膽經 23-01時：頭痛、額痛、目外眥痛、失眠、惱怒',
  丑:'足厥陰肝經 01-03時：腰痛不能俯仰、疝氣／小腹腫脹、喉嚨乾、面色灰暗',
  寅:'手太陰肺經 03-05時：肺部漲悶、咳喘、咽喉腫痛、視物模糊',
  卯:'手陽明大腸經 05-07時：齒痛、面頰腫、流鼻血、肩及上肢痛、腹痛腸鳴、拉肚子',
  辰:'足陽明胃經 07-09時：咽喉腫痛、齒痛、胸腹及下肢外側痛、足背痛、腹脹滿、鼻塞流鼻血、膝腫',
  巳:'足太陰脾經 09-11時：舌根強痛、食後發嘔、胃脘痛、腹脹、身重乏力、食不下嚥、不能安睡',
  午:'手少陰心經 11-13時：眼睛昏黃、脇痛、手臂內側痛、掌心熱、心痛心悸、失眠、渴而欲飲',
  未:'手太陽小腸經 13-15時：咽喉痛、耳聾、眼黃、面頰腫、肩部牽痛、上臂痛',
  申:'足太陽膀胱經 15-17時：頭重痛、後項牽引、脊背腰痛、股關節難彎、小腿痛、外踝麻木冷痛',
  酉:'足少陰腎經 17-19時：飢不欲食、面色黑、咳嗽氣喘、痰中帶血、視線模糊、惶恐不安',
  戌:'手厥陰心包經 19-21時：手心熱、腋下腫、胸脇脹滿、胸悶、心悸、嘻笑不止',
  亥:'手少陽三焦經 21-23時：耳聾耳鳴、咽喉腫痛、前臂外側痛；水主腎膀胱、血（月經不順、閉經、血崩）'
};
const T_HUA = {  // 六親互化（本爻六親 → 變出六親）
  兄弟:{子孫:'花錢買藥、四肢無力',官鬼:'手腳有傷、行動不便',妻財:'強行飲食、借錢看病',父母:'腳力漸增、手腳怕冷、花錢住院',進:'醫療費用高、吃不下東西、疾病難好',退:'手腳萎縮、軟弱無力'},
  子孫:{子孫:'換藥方、同時服幾種藥',兄弟:'藥物管用、藥有後勁',妻財:'服藥後脾胃大開、食療',官鬼:'樂極生悲、藥物致病、舊病不去添新病、喝酒或娛樂得病',父母:'醫藥無效、不願服藥、病人脾氣變壞',進:'藥漸漸有效',退:'藥漸漸無效'},
  妻財:{子孫:'進食不止、以食代藥',官鬼:'因食致病、血液感染、呼吸道傳染、因藥物錢財得病',兄弟:'飲食不進、花錢很多',父母:'飲食影響藥力',進:'飲食日增、血液循環好、呼吸暢通',退:'飲食漸少、逆經、嘔吐'},
  官鬼:{子孫:'子孫回頭剋：病好轉、藥見效、憂愁消除',妻財:'病來自飲食或女人、生病還吃東西、病加重',兄弟:'手腳不靈活、手腳之傷、因病吃不下',父母:'愁苦悲傷、治療奔波、病來自長輩／車船／消息文書',進:'病加重、添新病、疾病惡化',退:'病變輕、心緒安定'},
  父母:{官鬼:'操勞憂心得病、小病不治成大病、因車船或生氣得病、精力不足',子孫:'藥來之不易、停藥另換',妻財:'雙親病危、到處借錢、病人不想住院',兄弟:'口舌相侵、脈搏減弱',進:'有藥難進、脈搏加快',退:'心情漸開朗、醫院不願繼續治療'}
};
const T_CAUSE_KIN = {
  父母:'憂心、操勞、車船、建築、長輩、衣服寒暖失調、延誤看病、住房不適',
  兄弟:'賭博、爭財、飲食不當、女人、朋友兄弟',
  妻財:'飲食失調、女人、血液輸血、花草樹木',
  子孫:'飲酒、旅遊、房事過度、小孩、動物、出家人、吃藥、營養失調',
  官鬼:'疾病本身、憂愁'
};
const T_CAUSE_BEAST = {
  青龍:'飲酒、房事過度、貪色、中毒、興奮過度、赴宴、探親訪友、因財致病、喜事、胎產做月子',
  朱雀:'生氣發怒、口舌是非、官司、書信消息、火災燒傷、被詛咒',
  勾陳:'修造、跌打損傷、失飢傷飽、房屋氣場失調',
  螣蛇:'憂傷驚恐、思慮傷神、噩夢、怪事邪事、迷戀事物',
  白虎:'打架鬥毆、悲傷過度、刃器所傷、交通事故、喪事',
  玄武:'色慾過度、忍飢冒雨、風寒潮濕、失物被盜'
};
const T_GUI_KE_SHI = {木:'風疾、跌撲、刑杖',火:'燒燙傷',水:'雨淋、溺水、中毒',金:'利器所傷',土:'土石所傷'};
const T_SHAPE = {
  空:'缺少、空洞、穿孔、缺損、不足、出不來、暈眩；心態不安、心慌',
  破:'分離、裂縫、裂痕、傷口、腐爛潰爛、折斷、破裂、起皮',
  合:'沾黏、纏綿、不暢通、遮蓋、壓住、淤積、堵塞、植入、拖延',
  沖:'不安、晃動眩暈、轉移跳動、碰撞、打擊、穿孔、分離、情緒波動',
  進:'膨脹、變大、浮腫、發展、不停、興奮',
  退:'萎縮、衰退、軟弱、害怕膽小、倒退、失效減弱'
};
const T_GUA = {
  反吟:'病情反覆、癒而再病、病難去根、舊病復發、扭曲錯位變形、更換醫療手段、到處求醫、輾轉於床',
  伏吟:'臥床痛苦、呻吟不斷、病灶轉移、內部變化、堵塞淤積粘連、鬱鬱寡歡、有苦說不出、痛在深處、有病在家',
  遊魂:'病情不穩定、心緒不寧、精神不清、記憶減退、暈眩、病灶擴散蔓延、疾病反覆、傳染給人、外出治療、表皮',
  歸魂:'在家治病、病在體內好得慢、情緒穩定、保守治療；重症需防迴光返照'
};
const T_MED = {
  木:{dir:'東方',name:'姓帶草或木',drug:'草藥、酸味藥'},
  火:{dir:'南方',name:'姓帶日或火',drug:'灸、火罐、放血、苦味藥'},
  土:{dir:'中央、本地',name:'姓帶土',drug:'散藥、沖劑、甜味藥'},
  金:{dir:'西方',name:'姓帶金',drug:'辛辣藥、發麻藥'},
  水:{dir:'北方',name:'姓帶水',drug:'鹹味藥'}
};

/* ---------------- 工具 ---------------- */
function kinWx(meWx, kin){
  return {兄弟:meWx, 子孫:SHENG[meWx], 妻財:KE[meWx],
          官鬼:Object.keys(KE).find(e => KE[e] === meWx),
          父母:Object.keys(SHENG).find(e => SHENG[e] === meWx)}[kin];
}
function relKins(k){
  const i = KIN_ORDER.indexOf(k);
  return {yuan:KIN_ORDER[(i+4)%5], ji:KIN_ORDER[(i+3)%5], chou:KIN_ORDER[(i+2)%5]};
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lineName = r => `${YAO[r.pos-1]}${r.kin}${r.br}${r.wx}`;

/* ---------------- 主分析 ---------------- */
function analyze(ch, opt){
  opt = opt || {};
  const P = ch.P, rows = ch.rows, base = ch.base;
  const meWx = base.palaceWx;
  const mWx = ZHI_WX[P.monthZhi], dWx = ZHI_WX[P.dayZhi];
  const moving = rows.filter(r => r.moving);
  const course = opt.course || '';           // 'near' | 'long' | ''
  const out = {findings:[], focus:new Map(), sections:[], timing:[], verdict:[]};

  // 用神六親
  const ysSel = opt.yong || '世';
  const shiRow = rows[base.shi-1];
  const ysKin = (ysSel === '世' || ysSel === '應') ? rows[(ysSel==='世'?base.shi:base.ying)-1].kin : ysSel;
  const ysWx = kinWx(meWx, ysKin);
  const rel = relKins(ysKin);
  const yuanWx = kinWx(meWx, rel.yuan), jiWx = kinWx(meWx, rel.ji), chouWx = kinWx(meWx, rel.chou);

  const addFocus = (key, label, why, kind) => {
    if (!out.focus.has(key)) out.focus.set(key, {label, why:[], kind});
    out.focus.get(key).why.push(why);
  };
  const F = (cat, text) => out.findings.push({cat, text});

  // 生扶剋制
  const helped = (wx) => SHENG[mWx]===wx || mWx===wx || SHENG[dWx]===wx || dWx===wx || moving.some(m => SHENG[m.wx]===wx);
  const hurt   = (wx) => KE[mWx]===wx || KE[dWx]===wx;
  const strong = r => ['旺','相'].includes(r.season) || dWx===r.wx || SHENG[dWx]===r.wx;

  /* ---------- 取用神 ---------- */
  let Y = null, yAlt = [], yFu = null;
  if (ysSel === '世') Y = shiRow;
  else if (ysSel === '應') Y = rows[base.ying-1];
  else {
    const c = rows.filter(r => r.kin === ysKin);
    if (c.length){
      const score = r => (r.moving?100:0) + (r.shi?20:0) + (r.ying?10:0) + (strong(r)?5:0) - (r.kong?3:0) - (r.yuePo?3:0);
      c.sort((a,b) => score(b) - score(a));
      Y = c[0]; yAlt = c.slice(1);
    } else {
      yFu = rows.find(r => r.fu && r.fu.kin === ysKin);
    }
  }
  const yBr = Y ? Y.br : (yFu ? yFu.fu.br : null);
  const yLabel = Y ? lineName(Y) : (yFu ? `伏神${ysKin}${yFu.fu.br}${yFu.fu.wx}（伏於${YAO[yFu.pos-1]}${yFu.kin}${yFu.br}下）` : `${ysKin}（卦中不現）`);

  out.ys = {kin:ysKin, wx:ysWx, label:yLabel, rel};
  if (yAlt.length) F('用神兩現', `用神兩現，取${lineName(Y)}；${yAlt.map(lineName).join('、')}為被捨者，可輔助提取資訊（有時一個表病症、一個表應期）。`);

  /* ---------- 1. 用神為病 ---------- */
  if (Y){
    const yKey = 'r'+Y.pos;
    if (KE[mWx] === ysWx || KE[dWx] === ysWx){
      const by = [KE[mWx]===ysWx?`月建${P.monthZhi}`:'', KE[dWx]===ysWx?`日辰${P.dayZhi}`:''].filter(Boolean).join('、');
      F('用神為病', `用神${lineName(Y)}被${by}剋，以用神為病。`);
      addFocus(yKey, lineName(Y), '用神被日月剋', 'ys');
      const keWx = KE[mWx]===ysWx ? mWx : dWx;
      rows.filter(r => r.wx === keWx && r !== Y).forEach(r => {
        F('用神為病', `${lineName(r)}與剋用神的日月同屬${keWx}，入卦亦可為病。`);
        addFocus('r'+r.pos, lineName(r), `與剋用神之日月同五行（${keWx}）入卦`, 'side');
      });
    }
    const yuanMoving = moving.filter(m => SHENG[m.wx] === ysWx);
    if (Y.kong && !yuanMoving.length){
      F('用神為病', `用神${lineName(Y)}旬空，空不受元神生，以用神為病。`);
      addFocus(yKey, lineName(Y), '用神空不受元神生', 'ys');
    }
    if (Y.yuePo){
      F('用神為病', `用神${lineName(Y)}月破，以用神為病，月建${P.monthZhi}${mWx}亦可為病。`);
      addFocus(yKey, lineName(Y), '用神月破', 'ys');
      addFocus('m', `月建${P.monthZhi}${mWx}`, '沖破用神之月建', 'side');
    }
    checkBingDi(Y, '用神', yKey);
    // 入墓
    const mu = MU[ysWx];
    if (P.dayZhi === mu){ F('用神為病', `用神入日墓（日辰${mu}為${ysWx}之墓庫），主淤塞、遮蓋、臥床。`); addFocus(yKey, lineName(Y), '用神入日墓', 'ys'); addFocus('d', `日辰${mu}（墓庫）`, '用神之墓', 'side'); }
    moving.filter(m => m.br === mu && m !== Y).forEach(m => { F('用神為病', `用神入動墓：${lineName(m)}發動為用神墓庫，以墓庫之爻為病。`); addFocus('r'+m.pos, lineName(m), '用神之墓庫發動', 'cause'); });
    if (Y.moving && Y.bBr === mu){ F('用神為病', `用神化墓（化出${mu}），主淤積、堵塞、病藏體內。`); addFocus(yKey, lineName(Y), '用神化墓', 'ys'); }
  } else if (yFu){
    F('伏藏', `用神${ysKin}不上卦，伏於${YAO[yFu.pos-1]}${yFu.kin}${yFu.br}${yFu.wx}之下：用神伏藏為臥病之象。`);
    const fly = yFu, fuWx = yFu.fu.wx;
    if (KE[fly.wx] === fuWx) F('伏藏', `飛神${fly.br}${fly.wx}剋伏神，用神被壓。`);
    if (fly.kin === '官鬼'){ F('伏藏', `飛神為官鬼，以飛神為病。`); addFocus('r'+fly.pos, lineName(fly), '飛神官鬼壓用神', 'cause'); }
    else addFocus('r'+fly.pos, lineName(fly), '用神伏於此爻下', 'ys');
    if (fly.kong || fly.yuePo) F('伏藏', '飛神空破，伏神易於引拔出現，有病無妨。');
  }

  function checkBingDi(r, who, key){
    const bd = BING[r.wx];
    const hits = [];
    moving.forEach(m => { if (m.br === bd && m !== r) hits.push({k:'r'+m.pos, l:lineName(m)}); if (m.bBr === bd) hits.push({k:'b'+m.pos, l:`${YAO[m.pos-1]}變出${m.bKin}${bd}`}); });
    if (P.dayZhi === bd) hits.push({k:'d', l:`日辰${bd}`});
    if (P.monthZhi === bd) hits.push({k:'m', l:`月建${bd}`});
    if (!hits.length && who === '用神') rows.filter(x => x.br === bd && x !== r).forEach(x => hits.push({k:'r'+x.pos, l:lineName(x)}));
    if (hits.length){
      F(`${who}為病`, `${who}${lineName(r)}見病地${bd}（${hits.map(h=>h.l).join('、')}），以${who}為病，病地亦可為病。`);
      addFocus(key, lineName(r), `${who}見病地`, who==='用神'?'ys':'yuan');
      hits.forEach(h => addFocus(h.k, h.l, `${who}之病地`, 'side'));
    }
  }

  /* ---------- 2. 元神為病 ---------- */
  const yuanRows = rows.filter(r => r.kin === rel.yuan);
  yuanRows.forEach(r => {
    const key = 'r'+r.pos, nm = lineName(r);
    if (KE[mWx] === r.wx || KE[dWx] === r.wx){ F('元神為病', `元神${nm}被日月來剋，不能生用神，以元神為病。`); addFocus(key, nm, '元神被日月剋', 'yuan'); }
    if (r.kong){ F('元神為病', `元神${nm}旬空，空不能生用，以元神為病。`); addFocus(key, nm, '元神空', 'yuan'); }
    if (r.moving && (r.riHe || moving.some(m => m !== r && HE[m.br] === r.br))){ F('元神為病', `元神${nm}發動被合，貪合忘生，不能生用。`); addFocus(key, nm, '元神貪合忘生', 'yuan'); }
    if (r.yuePo){ F('元神為病', `元神${nm}月破，以元神為病，月建亦可為病。`); addFocus(key, nm, '元神月破', 'yuan'); }
    if (r.moving && r.hua && (r.hua.includes('化空') || r.hua.includes('化退') || isChong(r.bBr, P.monthZhi))){
      const h = [r.hua.includes('化空')?'化空':'', isChong(r.bBr,P.monthZhi)?'化破':'', r.hua.includes('化退')?'化退':''].filter(Boolean).join('、');
      F('元神為病', `元神${nm}${h}，以元神為病。`); addFocus(key, nm, `元神${h}`, 'yuan');
    }
    if (r.moving || strong(r)) checkBingDi(r, '元神', key);
  });

  moving.filter(r => r.bKin === rel.yuan && r.kin !== rel.yuan).forEach(r => {
    const bad = [r.hua.includes('化空')?'空亡':'', isChong(r.bBr, P.monthZhi)?'月破':''].filter(Boolean).join('、');
    if (bad){ F('元神為病', `${lineName(r)}化出元神${r.bKin}${r.bBr}${bad}，元神不能生用，以元神為病。`); addFocus('b'+r.pos, `${YAO[r.pos-1]}化出元神${r.bKin}${r.bBr}${ZHI_WX[r.bBr]}`, `化出元神${bad}`, 'yuan'); }
  });

  /* ---------- 3. 仇神、忌神 ---------- */
  moving.filter(r => r.kin === rel.chou).forEach(r => {
    if (yuanRows.length){ F('仇神為病', `仇神${lineName(r)}發動來剋元神，以仇神為病。`); addFocus('r'+r.pos, lineName(r), '仇神動剋元神', 'cause'); }
  });
  moving.filter(r => r.kin === rel.ji).forEach(r => {
    F('忌神為病', `忌神${lineName(r)}發動來剋用神，以忌神為病${r.br===MU[ysWx]?'（又為用神墓庫）':''}。`);
    addFocus('r'+r.pos, lineName(r), '忌神動剋用神', 'cause');
  });

  /* ---------- 4. 動爻化出官鬼、忌神 ---------- */
  moving.forEach(r => {
    if (r.bKin === '官鬼' && r.kin !== '官鬼'){ F('動爻為病', `${lineName(r)}動化官鬼${r.bBr}，以化出的官鬼為病。`); addFocus('b'+r.pos, `${YAO[r.pos-1]}化出官鬼${r.bBr}${ZHI_WX[r.bBr]}`, '動化官鬼', 'cause'); }
    else if (r.bKin === rel.ji && r.kin !== rel.ji){ F('動爻為病', `${lineName(r)}動化忌神${r.bKin}${r.bBr}，以變爻為病。`); addFocus('b'+r.pos, `${YAO[r.pos-1]}化出${r.bKin}${r.bBr}${ZHI_WX[r.bBr]}`, '動化忌神', 'cause'); }
  });

  /* ---------- 5. 官鬼 ---------- */
  const guiRows = rows.filter(r => r.kin === '官鬼');
  const roleKins = [ysKin, rel.yuan, rel.ji, rel.chou];
  guiRows.forEach(r => {
    if (!roleKins.includes('官鬼') && strong(r) && !r.kong && !r.yuePo){
      F('官鬼', `官鬼${lineName(r)}旺相為閒神，可當病看。`); addFocus('r'+r.pos, lineName(r), '官鬼旺相（閒神）', 'cause');
    }
    if (r.br === MU[ysWx]) { F('官鬼', `官鬼${lineName(r)}為用神墓庫，可當病看。`); addFocus('r'+r.pos, lineName(r), '官鬼為用神墓庫', 'cause'); }
  });
  if (!guiRows.length){
    const gf = rows.find(r => r.fu && r.fu.kin === '官鬼');
    if (gf) F('官鬼', `官鬼不上卦，伏於${YAO[gf.pos-1]}${gf.kin}${gf.br}下：病症深藏，病因與「${gf.kin}」有關（${T_CAUSE_KIN[gf.kin]}）。`);
  }

  /* ---------- 6. 獨發 ---------- */
  if (moving.length === 1){
    const r = moving[0];
    F('獨發之爻', `${lineName(r)}一爻獨發，表疾病的原因、性質（看六獸：${r.beast}），亦主吉凶與應期，並可占此應彼。`);
    addFocus('r'+r.pos, lineName(r), '獨發之爻（原因、性質）', 'cause');
  }

  /* ---------- 7. 過旺 ---------- */
  [[Y,'用神'], ...yuanRows.filter(r=>r.moving).map(r=>[r,'元神'])].forEach(([r, who]) => {
    if (!r) return;
    const same = rows.filter(x => x.wx === r.wx).length + (mWx===r.wx?1:0) + (dWx===r.wx?1:0) + moving.filter(m=>m.bBr && ZHI_WX[m.bBr]===r.wx).length;
    const supported = ['旺','相'].includes(r.season) && (dWx===r.wx || SHENG[dWx]===r.wx);
    const noKe = !moving.some(m => KE[m.wx] === r.wx || SHENG[r.wx] === m.wx) && !hurt(r.wx);
    if (supported && noKe && same >= 4){
      F('過旺', `${who}${lineName(r)}得月日生扶，${r.wx}在卦中連日月共${same}見而無剋洩，過旺要反看——物極必反，亦主病（如${T_WX[r.wx].split('（')[0]}）。`);
      addFocus('r'+r.pos, lineName(r), `${who}過旺`, who==='用神'?'ys':'yuan');
    }
  });

  /* ---------- 8. 卦宮、卦象 ---------- */
  const palace = base.palace;
  F('主卦卦宮', `本卦屬${palace}宮：${T_TRIG[palace]}。`);
  const gua = [];
  if (ch.pair) gua.push(ch.pair);
  if (base.gen === '遊魂' || base.gen === '歸魂') gua.push(base.gen);
  let fanFu = [];
  if (ch.bian){
    const b0 = base.branches, b1 = ch.bian.branches;
    const part = (s,e) => ({chong: [s,s+1,s+2].every(i => isChong(b0[i], b1[i])), same:[s,s+1,s+2].every(i => b0[i]===b1[i])});
    const inn = part(0), outr = part(3);
    if (inn.chong) fanFu.push('內卦反吟'); if (outr.chong) fanFu.push('外卦反吟');
    if (inn.same && ch.rows.slice(0,3).some(r=>r.moving)) fanFu.push('內卦伏吟');
    if (outr.same && ch.rows.slice(3).some(r=>r.moving)) fanFu.push('外卦伏吟');
    if (ch.bian.gen === '遊魂' || ch.bian.gen === '歸魂') gua.push(`變${ch.bian.gen}`);
  }

  /* ---------- 吉凶與病程 ---------- */
  const V = s => out.verdict.push(s);
  if (Y){
    const st = strong(Y), ke = hurt(ysWx) || moving.some(m => KE[m.wx] === ysWx);
    const sheng = moving.some(m => SHENG[m.wx] === ysWx) || SHENG[dWx]===ysWx || SHENG[mWx]===ysWx;
    if (st && !Y.yuePo) V(`用神${lineName(Y)}月令${Y.season}${sheng?'、得生扶':''}，有根有救${ke?'，雖受剋仍可支撐':''}。`);
    else if (ke && !sheng) V(`用神${lineName(Y)}休囚受剋而無生扶，病勢較重，宜積極就醫。`);
    else V(`用神${lineName(Y)}旺衰平平，病情可調，關鍵在元神、忌神的動靜。`);
    if (Y.moving && Y.hua){
      if (Y.hua.includes('化退')) V(st ? '用神旺相化退神，當令不退，吉。' : '用神化退：體力、功能漸退。');
      if (Y.hua.includes('化進')) V('用神化進：力量漸增（若已過旺，反主病勢擴張）。');
      if (Y.hua.includes('回頭剋')) V('用神動化回頭剋，凶象，需特別留意。');
    }
    if (Y.kong) V(course==='long' ? '久病逢用神旬空：沖空、實空之時反為凶期。' : course==='near' ? '近病逢用神旬空：沖空、實空之時可癒。' : '用神旬空：近病（三個月內）沖空實空時癒；久病（三個月以上）沖空實空時凶。');
  } else if (yFu){
    V(`用神伏藏不現，主臥病在家；伏神${yFu.fu.br}${seasonOf(yFu.fu.wx)}，出伏之時（值${yFu.fu.br}或沖開飛神${yFu.br}）轉機。`);
  }
  moving.filter(r => r.kin === '官鬼').forEach(r => {
    if (r.hua.includes('化進')) V('官鬼化進：病加重、添新病、憂慮重重。');
    if (r.hua.includes('化退')) V('官鬼化退：病變輕、心緒安定。');
    if (r.bKin === '子孫') V('官鬼化子孫回頭剋：病好轉、藥見效。');
  });
  moving.filter(r => r.kin === rel.ji && r.hua && r.hua.includes('化退')).forEach(r => {
    if (r.br === P.dayZhi || r.br === P.monthZhi) V('忌神動化退神而臨日月，退不了，凶。');
    else V('忌神化退：剋用之力漸減，吉。');
  });
  if (yuanRows.some(r => r.moving) && !yuanRows.some(r => r.kong || r.yuePo)) V('元神發動來生用神，有轉機；久、重病元神動必有期。');
  if (ch.pair === '六沖卦'){
    const po = Y && Y.yuePo;
    if (course==='long') V('久病逢六沖卦：凶。');
    else if (course==='near') V(po ? '近病逢六沖卦本主癒，但用神月破，不佳。' : '近病逢六沖卦：易癒。');
    else V('六沖卦：近病主癒（用神月破則不佳），久病主凶。');
  }
  if (ch.pair === '六合卦'){
    if (course==='long') V('久病逢六合卦：延壽、疾病癒合。');
    else if (course==='near') V(Y && strong(Y) ? '近病逢六合卦而用神旺：易成慢性病、留病根。' : '近病逢六合卦而用神休囚：不宜，拖延難好。');
    else V('六合卦：久病主延壽癒合；近病不宜，易拖延、留病根。');
  }

  function seasonOf(wx){
    const m = mWx;
    if (wx===m) return '旺'; if (SHENG[m]===wx) return '相'; if (SHENG[wx]===m) return '休'; if (KE[wx]===m) return '囚'; return '死';
  }

  /* ---------- 應期 ---------- */
  const TM = (s) => out.timing.push(s);
  if (Y){
    if (Y.moving) TM(`用神發動：逢值${Y.br}或逢合${HE[Y.br]}之日／月。`);
    if (Y.kong) TM(`用神旬空：沖空（${chongOf(Y.br)}）或實空（${Y.br}）之時。`);
    if (Y.yuePo) TM(`用神月破：合破（${HE[Y.br]}）或實破（${Y.br}）之時；近應時日，遠應年月。`);
    if (Y.riHe || moving.some(m => m!==Y && HE[m.br]===Y.br)) TM(`用神被合：待沖開（${chongOf(Y.br)}）之時。`);
    if (Y.moving && Y.hua && Y.hua.includes('回頭剋')) TM(`用神化回頭剋：事應於沖、剋、合變爻（${Y.bBr}）之時。`);
    if (Y.moving && Y.hua && Y.hua.includes('化空')) TM(`用神化空：應在變爻地支${Y.bBr}或沖之${chongOf(Y.bBr)}。`);
  } else if (yFu){
    TM(`用神伏藏：出伏之時——值伏神${yFu.fu.br}，或沖飛神${chongOf(yFu.br)}。`);
  }
  yuanRows.filter(r => r.moving).forEach(r => {
    TM(`元神${r.br}${r.wx}（${YAO[r.pos-1]}）發動：逢值${r.br}或逢合${HE[r.br]}之時為轉機。`);
    if (r.riHe || moving.some(m => m!==r && HE[m.br]===r.br)) TM(`元神被合：沖元神（${chongOf(r.br)}）或合元神之地支時應。`);
  });
  moving.filter(r => r.kin === rel.ji).forEach(r => {
    TM(`忌神${r.br}${r.wx}（${YAO[r.pos-1]}）發動：逢合（${HE[r.br]}）之日合住忌神，可癒；忌神值日（${r.br}）需防加重。`);
  });

  /* ---------- 病因 ---------- */
  const causes = [];
  [...(ysKin === '官鬼' ? [] : guiRows), ...moving.filter(r => r.kin === rel.ji)].forEach(r => {
    const t = r.kin === '官鬼' ? '官鬼' : '忌神';
    causes.push(`${t}${lineName(r)}臨${r.beast}：${T_CAUSE_BEAST[r.beast]}`);
    if (r.br === P.monthZhi) causes.push(`${t}臨月建：久病`);
    if (r.br === P.dayZhi) causes.push(`${t}臨日辰：急病、暴病`);
    if (r.shi) causes.push(`${t}持世：舊病復發`);
    if (r.ying) causes.push(`${t}臨應：他處染病`);
    if (r.kin === '官鬼' && Y && KE[r.wx] === ysWx && r.moving) causes.push(`官鬼${r.wx}動剋用神：${T_GUI_KE_SHI[r.wx]}`);
  });
  if (ysKin !== '官鬼') rows.filter(r => r.fu && r.fu.kin === '官鬼').forEach(r => causes.push(`官鬼伏於${r.kin}之下：${T_CAUSE_KIN[r.kin]}`));
  moving.filter(r => (r.bKin === '官鬼' || r.bKin === rel.ji) && r.kin !== '官鬼').forEach(r => causes.push(`${r.kin}動化${r.bKin}：${T_CAUSE_KIN[r.kin]}`));
  const zi = rows.filter(r => r.kin === '子孫');
  if (!zi.length || zi.every(r => r.kong)) causes.push('子孫空絕或不現：營養失調');
  out.causes = [...new Set(causes)];

  /* ---------- 求醫問藥 ---------- */
  const med = [];
  const ziMain = zi.find(r => r.moving) || zi[0];
  const docWx = ziMain ? ziMain.wx : yuanWx;
  const M = T_MED[docWx];
  med.push(`醫藥方向：依${ziMain ? '子孫' : '元神'}五行${docWx}，宜往${M.dir}求醫（${M.name}者）；適合${M.drug}。`);
  if (!zi.length) med.push('子孫不上卦：較難遇上好醫生。');
  zi.forEach(r => {
    if (r.kong || r.yuePo) med.push(`子孫${r.br}${r.kong?'旬空':'月破'}：藥效不顯。`);
    if (r.moving && r.bKin === '官鬼') med.push('子孫動化官鬼：藥物致病，宜換藥。');
    if (r.moving && r.bKin === '子孫') med.push('子孫化子孫：換藥、換醫生才可見效。');
    if (r.moving && r.bKin === '父母') med.push('子孫化父母回頭剋：醫藥無效、用藥失誤，宜審慎。');
    if (r.moving && r.hua && r.hua.includes('化進')) med.push('子孫化進：藥漸漸有效。');
    if (r.moving && r.hua && r.hua.includes('化退')) med.push('子孫化退：藥漸漸無效。');
    if ((r.br === P.dayZhi && strong(r)) || r.shi) med.push('子孫臨日旺相或持世：不吃藥也會好。');
  });
  if (zi.filter(r => r.moving).length >= 2) med.push('子孫兩現發動：換藥、換醫生才可見效。');
  if (moving.some(r => r.kin === '父母') || rows.some(r => r.kin==='父母' && (r.season==='旺'))) med.push('父母發動或旺：剋子孫，求醫較難順利。');
  const ying = rows[base.ying-1];
  if (ying.kong || ying.yuePo) med.push('應爻（醫藥）空破：非良醫、不利病人。');
  if (ying.kin === '子孫') med.push('應臨子孫：醫藥得力。');
  if (ying.kin === '官鬼' && ying.moving && KE[ying.wx] === shiRow.wx) med.push('應持官鬼動剋世：庸醫，宜換。');
  if (guiRows.some(r => r.kong) || rows.some(r => r.fu && r.fu.kin === '官鬼')) med.push('官鬼伏、空：病症深藏，藥雖好難去根，宜藥物與心靈調養雙管齊下。');
  out.med = med;

  /* ---------- 部位與病症（焦點爻） ---------- */
  const detail = [];
  const P_ORDER = {ys:0, yuan:1, cause:2, side:3};
  [...out.focus.entries()].sort((a,b) => P_ORDER[a[1].kind]-P_ORDER[b[1].kind]).forEach(([k, f]) => {
    let r = null, br = null, wx, kin, beast, pos, inner, isBian = false;
    if (k[0] === 'r'){ r = rows[+k.slice(1)-1]; br = r.br; wx = r.wx; kin = r.kin; beast = r.beast; pos = r.pos; }
    else if (k[0] === 'b'){ const rr = rows[+k.slice(1)-1]; br = rr.bBr; wx = ZHI_WX[br]; kin = rr.bKin; beast = rr.beast; pos = rr.pos; isBian = true; }
    else if (k === 'm'){ br = P.monthZhi; wx = mWx; }
    else if (k === 'd'){ br = P.dayZhi; wx = dWx; }
    const items = [];
    if (pos){
      items.push(['爻位', `${YAO[pos-1]}：${T_YAO[pos-1]}`]);
      const tri = isBian ? (pos<=3?ch.bian.lo:ch.bian.up) : (pos<=3?base.lo:base.up);
      items.push([`${pos<=3?'內':'外'}卦${tri}`, T_TRIG[tri]]);
    }
    items.push(['五行'+wx, T_WX[wx]]);
    if (kin) items.push(['六親'+kin, T_KIN[kin]]);
    if (beast) items.push(['六獸'+beast, T_BEAST[beast]]);
    if (br) items.push(['地支'+br, T_ZHI[br]]);
    if (r){
      const st = [];
      if (r.kong) st.push(`空（${T_SHAPE.空}）`);
      if (r.yuePo) st.push(`月破（${T_SHAPE.破}）`);
      if (r.riHe) st.push(`日合（${T_SHAPE.合}）`);
      if (r.riChong) st.push(`日沖（${T_SHAPE.沖}）`);
      if (r.moving && r.hua){
        if (r.hua.includes('化進')) st.push(`化進（${T_SHAPE.進}）`);
        if (r.hua.includes('化退')) st.push(`化退（${T_SHAPE.退}）`);
        const tbl = T_HUA[r.kin] || {};
        const m = r.hua.includes('化進') ? tbl.進 : r.hua.includes('化退') ? tbl.退 : null;
        if (m) st.push(`${r.kin}化${r.hua.includes('化進')?'進':'退'}：${m}`);
        if (tbl[r.bKin]) st.push(`${r.kin}化${r.bKin}：${tbl[r.bKin]}`);
      }
      if (st.length) items.push(['狀態取象', st.join('；')]);
    }
    detail.push({label:f.label, why:[...new Set(f.why)], kind:f.kind, items});
  });
  out.detail = detail;
  out.gua = {tags:gua, fanFu};
  return out;
}

/* ---------------- 輸出：HTML ---------------- */
function toHtml(res, ch, opt){
  const h = [];
  const kindTag = {ys:'用神', yuan:'元神', cause:'病因', side:'相關'};
  h.push(`<h4>用神</h4><p>${esc(res.ys.label)}　<span class="tag g">元神 ${res.ys.rel.yuan}</span><span class="tag w">忌神 ${res.ys.rel.ji}</span><span class="tag">仇神 ${res.ys.rel.chou}</span></p>`);
  h.push('<h4>疾病判斷（依疾病心智圖）</h4><ul>' + res.findings.filter(f => f.cat !== '主卦卦宮').map(f => `<li><b>${esc(f.cat)}</b>：${esc(f.text)}</li>`).join('') + '</ul>');
  if (!res.findings.some(f => !['主卦卦宮','用神兩現'].includes(f.cat))) h.push('<p>用神、元神未見明顯受傷，卦中無直接病象，可從卦宮與獨發、官鬼細看，或屬輕症。</p>');
  if (res.detail.length){
    h.push('<h4>部位與病症推斷</h4>');
    res.detail.slice(0, 5).forEach(d => {
      h.push(`<div class="hx"><div class="hx-h"><span class="tag ${d.kind==='ys'?'g':d.kind==='cause'?'w':''}">${kindTag[d.kind]}</span><b>${esc(d.label)}</b><small>${esc(d.why.join('、'))}</small></div><dl>` +
        d.items.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('') + '</dl></div>');
    });
    h.push('<p class="hint">請將上列各項「交集」起來看：同時出現在爻位、五行、六親、六獸、地支的部位，最可能是病處。</p>');
  }
  const palace = ch.base.palace;
  const gt = [`本卦${palace}宮：${T_TRIG[palace]}`];
  res.gua.tags.forEach(t => { const k = t.replace('變',''); if (T_GUA[k]) gt.push(`${t}：${T_GUA[k]}`); else if (t==='六沖卦') gt.push(`六沖卦：${T_SHAPE.沖}`); else if (t==='六合卦') gt.push(`六合卦：${T_SHAPE.合}`); });
  res.gua.fanFu.forEach(t => gt.push(`${t}：${T_GUA[t.slice(2)]}`));
  h.push('<h4>卦象</h4><ul>' + gt.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>');
  if (res.verdict.length) h.push('<h4>吉凶與病程</h4><ul>' + res.verdict.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>');
  if (res.timing.length) h.push('<h4>應期</h4><ul>' + res.timing.map(s => `<li>${esc(s)}</li>`).join('') + '</ul><p class="hint">近應日時，遠應年月；需配合用神吉凶判定。</p>');
  if (res.causes.length) h.push('<h4>病因</h4><ul>' + res.causes.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>');
  h.push('<h4>求醫問藥</h4><ul>' + res.med.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>');
  if (opt && opt.symptoms) h.push(`<h4>自述狀況</h4><p>「${esc(opt.symptoms)}」——請對照上方「部位與病症推斷」中的交集部位。</p>`);
  return h.join('');
}

/* ---------------- 輸出：給 AI 的文字摘要 ---------------- */
function toText(res, ch){
  const L = [];
  L.push(`用神：${res.ys.label}（元神${res.ys.rel.yuan}、忌神${res.ys.rel.ji}、仇神${res.ys.rel.chou}）`);
  res.findings.forEach(f => L.push(`[${f.cat}] ${f.text}`));
  res.detail.slice(0,5).forEach(d => L.push(`焦點：${d.label}（${d.why.join('、')}）— ` + d.items.map(([k,v]) => `${k}：${v}`).join('｜')));
  if (res.gua.tags.length || res.gua.fanFu.length) L.push('卦象：' + [...res.gua.tags, ...res.gua.fanFu].join('、'));
  res.verdict.forEach(s => L.push('吉凶：' + s));
  res.timing.forEach(s => L.push('應期：' + s));
  res.causes.forEach(s => L.push('病因：' + s));
  res.med.forEach(s => L.push('求醫：' + s));
  return L.join('\n');
}

/* ---------------- 疾病比對用特徵 ---------------- */
const KIND_W = {ys:1, yuan:0.8, cause:0.8, side:0.5};
function chartFeatures(res, ch){
  const f = {};
  const add = (k, w) => { f[k] = Math.max(f[k] || 0, w); };
  res.detail.forEach(d => {
    const w = KIND_W[d.kind] || 0.5;
    const key = [...res.focus.entries()].find(([k, v]) => v.label === d.label);
    if (!key) return;
    const k = key[0];
    let r = null, br, wx, kin, beast, pos, tri;
    if (k[0] === 'r'){ r = ch.rows[+k.slice(1)-1]; br = r.br; wx = r.wx; kin = r.kin; beast = r.beast; pos = r.pos; tri = pos<=3 ? ch.base.lo : ch.base.up; }
    else if (k[0] === 'b'){ const rr = ch.rows[+k.slice(1)-1]; br = rr.bBr; wx = ZHI_WX[br]; kin = rr.bKin; beast = rr.beast; pos = rr.pos; tri = pos<=3 ? ch.bian.lo : ch.bian.up; }
    else { br = k === 'm' ? ch.P.monthZhi : ch.P.dayZhi; wx = ZHI_WX[br]; }
    add('wx:'+wx, w); add('br:'+br, w*0.6);
    if (pos){ add('pos:'+pos, w); add('tri:'+tri, w*0.7); add(pos<=3 ? 'side:內' : 'side:外', w*0.5); }
    if (kin) add('kin:'+kin, w);
    if (beast) add('beast:'+beast, w);
    if (r){
      if (r.kong) add('st:空', w); if (r.yuePo) add('st:破', w);
      if (r.riHe) add('st:合', w*0.6); if (r.riChong) add('st:沖', w*0.6);
      if (r.moving && r.hua){ if (r.hua.includes('化進')) add('st:進', w); if (r.hua.includes('化退')) add('st:退', w); }
    }
  });
  add('palace:'+ch.base.palace, 0.6);
  (res.gua.tags || []).forEach(t => add('gua:'+t.replace('變',''), 0.6));
  (res.gua.fanFu || []).forEach(t => add('gua:'+t.slice(2), 0.6));
  return f;
}

/* ---------------- 疾病分科比對（王虎應《六爻測病分科詳解》） ---------------- */
const FEAT_NAME = k => {
  const [a, b] = k.split(':');
  return {palace:`${b}宮`, pos:YAO[+b-1], wx:`五行${b}`, kin:b, beast:b, st:{空:'旬空',破:'月破',合:'日合',沖:'日沖',進:'化進',退:'化退'}[b] || b, gua:b}[a] || b;
};
function matchDiseases(res, ch, opt){
  const DB = global.DISEASE_DB; if (!DB) return null;
  opt = opt || {};
  const f0 = chartFeatures(res, ch), f = {};
  Object.keys(f0).forEach(k => { if (!/^(br|side|tri):/.test(k)) f[k] = f0[k]; });
  const sym = (opt.symptoms || '').trim();
  const out = [];
  DB.diseases.forEach(d => {
    if (opt.sex === '男' && d.cat === '婦科常見疾病') return;
    if (opt.sex === '女' && d.cat === '男科常見疾病') return;
    if (opt.age === 'adult' && d.cat === '兒科常見疾病') return;
    const tot = d.n + DB.A + 1;
    let score = 0; const why = [];
    Object.entries(f).forEach(([k, w]) => {
      const pr = d.prior.includes(k) ? 1 : 0;
      const v = Math.log(((d.num[k] || 0) + DB.A * pr + DB.sm) / tot / (((DB.g[k] || 0) + 1) / (DB.N + 2)));
      score += w * v;
      if (v > 0.35) why.push({k, v: w * v, book: !!pr});
    });
    let symHit = [];
    if (sym){
      if (d.core && sym.includes(d.core)) { score += 6; symHit.push(d.core); }
      else if (d.core && d.core.length >= 2 && [...d.core].some(c => '心肝脾肺腎胃腸膽膀眼耳鼻喉牙舌頭腰腿肩頸乳皮骨'.includes(c) && sym.includes(c))) { score += 2.5; symHit.push([...d.core].filter(c => sym.includes(c)).join('')); }
      d.kw.forEach(w => { if (w.length >= 2 && sym.includes(w)) { score += 1.2; symHit.push(w); } });
    }
    if (opt.age === 'child' && d.cat === '兒科常見疾病') score += 2;
    out.push({d, score, why: why.sort((a,b) => b.v - a.v).slice(0, 5), sym: [...new Set(symHit)]});
  });
  out.sort((a, b) => b.score - a.score);
  const cats = {};
  out.slice(0, 15).forEach((x, i) => { cats[x.d.cat] = (cats[x.d.cat] || 0) + 1/(i+1); });
  const catRank = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0, 3).map(([c]) => c);
  return {top: out.slice(0, 8), catRank};
}
function matchHtml(m){
  if (!m) return '';
  const max = m.top[0].score, min = m.top[m.top.length-1].score;
  const h = ['<h4>疾病分科比對 <small style="font-weight:400;color:var(--muted);font-size:12px">依王虎應《六爻測病分科詳解》870 則卦例與各病歸納特徵</small></h4>'];
  h.push(`<p>最接近的科別：${m.catRank.map((c,i) => `<span class="tag ${i?'':'g'}">${esc(c.replace('常見疾病','').replace('疾病',''))}</span>`).join('')}</p>`);
  h.push('<div class="dz">');
  m.top.slice(0, 6).forEach((x, i) => {
    const pct = max === min ? 100 : Math.round(30 + 70 * (x.score - min) / (max - min));
    const why = x.why.map(w => `<span class="tag ${w.book?'w':''}">${esc(FEAT_NAME(w.k))}</span>`).join('');
    const tg = Object.entries(x.d.tags).map(([k,v]) => `${k}：${v.join('、')}`).join('；');
    h.push(`<div class="dz-r"><div class="dz-h"><b>${i+1}. ${esc(x.d.name)}</b><small>${esc(x.d.cat)}・書中卦例 ${x.d.n} 則</small></div>
      <div class="dz-bar"><i style="width:${pct}%"></i></div>
      <div class="dz-w">相符特徵：${why || '—'}${x.sym.length ? `　症狀吻合：${x.sym.map(s=>`<span class="tag g">${esc(s)}</span>`).join('')}` : ''}</div>
      ${tg ? `<div class="dz-t">書中歸納：${esc(tg)}</div>` : ''}</div>`);
  });
  h.push('</div><p class="hint">紅色標籤為書中歸納的特徵。比對結果是依卦象統計出的「接近程度」，用來提示判斷方向，不是診斷；同一卦常同時反映多種病，請配合問診與上方部位推斷取捨。</p>');
  return h.join('');
}

global.HealthEngine = {analyze, toHtml, toText, chartFeatures, matchDiseases, matchHtml, tables:{T_TRIG,T_WX,T_KIN,T_YAO,T_BEAST,T_ZHI}};
})(typeof window !== 'undefined' ? window : globalThis);

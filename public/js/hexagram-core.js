// public/js/hexagram-core.js
class HexagramCore {
  constructor() {
    this.GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    this.ZHI_ELEM = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
    this.GONG_ELEM = { 乾: '金', 坤: '土', 震: '木', 巽: '木', 坎: '水', 離: '火', 艮: '土', 兌: '金' };
    this.TRIG = { 
      乾: [1,1,1], 兌: [1,1,0], 離: [1,0,1], 震: [1,0,0], 
      巽: [0,1,1], 坎: [0,1,0], 艮: [0,0,1], 坤: [0,0,0] 
    };
    this.LIU_SHOU = ['青龍', '朱雀', '勾陳', '螣蛇', '白虎', '玄武'];
    this.NA_JIA = {
      乾: { 內: ['子', '寅', '辰'], 外: ['午', '申', '戌'] },
      坤: { 內: ['未', '巳', '卯'], 外: ['丑', '亥', '酉'] },
      震: { 內: ['子', '寅', '辰'], 外: ['午', '申', '戌'] },
      巽: { 內: ['丑', '亥', '酉'], 外: ['未', '巳', '卯'] },
      坎: { 內: ['寅', '辰', '午'], 外: ['申', '戌', '子'] },
      離: { 內: ['卯', '丑', '亥'], 外: ['酉', '未', '巳'] },
      艮: { 內: ['辰', '午', '申'], 外: ['戌', '子', '寅'] },
      兌: { 內: ['巳', '卯', '丑'], 外: ['亥', '酉', '未'] }
    };
    
    this.moving = [false, false, false, false, false, false];
    this.currentPillars = null;
    this.currentSixAnimals = [];
  }

  // 現有的核心函數移到這裡...
  calculateLiuQin(gongElement, branch) {
    const element = this.ZHI_ELEM[branch];
    if (!element) return '兄弟';
    
    if (element === gongElement) return '兄弟';
    if (this.isSheng(gongElement, element)) return '父母';
    if (this.isSheng(element, gongElement)) return '子孫';
    if (this.isKe(gongElement, element)) return '妻財';
    if (this.isKe(element, gongElement)) return '官鬼';
    
    return '兄弟';
  }

  isSheng(wu1, wu2) {
    const shengCycle = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    return shengCycle[wu1] === wu2;
  }

  isKe(wu1, wu2) {
    const keCycle = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    return keCycle[wu1] === wu2;
  }

  calculateSixAnimals(dayGan) {
    const startIndex = {
      '甲': 0, '乙': 0, '丙': 1, '丁': 1, '戊': 2, 
      '己': 3, '庚': 4, '辛': 4, '壬': 5, '癸': 5
    }[dayGan] || 0;
    
    const animals = [];
    for (let i = 0; i < 6; i++) {
      animals.push(this.LIU_SHOU[(startIndex + i) % 6]);
    }
    return animals;
  }

  getGuaName(upper, lower) {
    const guaMap = {
      '乾乾': '乾為天', '坤坤': '坤為地', '坎坎': '坎為水', '離離': '離為火',
      '震震': '震為雷', '艮艮': '艮為山', '巽巽': '巽為風', '兌兌': '兌為澤',
      '乾坎': '天水訟', '坎乾': '水天需', '坎坤': '水地比', '坤坎': '地水師'
    };
    return guaMap[upper + lower] || `${upper}${lower}卦`;
  }
}

// 導出為全局變量
window.HexagramCore = HexagramCore;

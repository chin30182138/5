// public/js/tcm-analyzer.js
class TCMAnalyzer {
  constructor() {
    this.tcmData = {
      '木': {
        constitution: '肝膽型體質',
        characteristics: ['易怒', '壓力敏感', '肩頸僵硬', '眼睛疲勞'],
        departments: ['肝膽科', '情志/睡眠', '骨傷/筋膜'],
        patterns: ['肝氣鬱結', '肝火上炎', '肝血不足', '肝腎陰虛'],
        recommendations: {
          diet: ['綠色蔬菜', '酸味食物', '枸杞', '菊花'],
          acupuncture: ['太衝穴', '行間穴', '風池穴'],
          lifestyle: ['規律運動', '情緒管理', '避免熬夜']
        }
      },
      '火': {
        constitution: '心小腸型體質',
        characteristics: ['心悸', '失眠', '口舌生瘡', '面色紅潤'],
        departments: ['心血管', '身心/睡眠'],
        patterns: ['心火亢盛', '心脾兩虛', '心陰不足'],
        recommendations: {
          diet: ['苦瓜', '蓮子', '小麥', '百合'],
          acupuncture: ['神門穴', '內關穴', '勞宮穴'],
          lifestyle: ['冥想靜坐', '避免辛辣', '保持涼爽']
        }
      }
      // ... 其他五行數據
    };
  }

  analyzeWuxing(wuxingData) {
    const elements = {
      '木': wuxingData.mu,
      '火': wuxingData.huo, 
      '土': wuxingData.tu,
      '金': wuxingData.jin,
      '水': wuxingData.shui
    };
    
    const dominantElement = this.findDominantElement(elements);
    const weakElement = this.findWeakElement(elements);
    const balanceScore = this.calculateBalanceScore(elements);
    
    return {
      dominantElement,
      weakElement,
      balanceScore,
      elements
    };
  }

  findDominantElement(elements) {
    return Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  findWeakElement(elements) {
    return Object.entries(elements).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  }

  calculateBalanceScore(elements) {
    const values = Object.values(elements);
    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    return Math.max(0, 100 - Math.sqrt(variance) * 20);
  }

  getConstitutionAdvice(dominantElement) {
    return this.tcmData[dominantElement] || this.tcmData['土'];
  }
}

window.TCMAnalyzer = TCMAnalyzer;

// public/js/api-client.js
class ApiClient {
  constructor() {
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : '/api';
    this.isOnline = true;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  async analyzeHexagram(hexagramData) {
    if (!this.isOnline) {
      return this.getOfflineAnalysis(hexagramData);
    }

    try {
      const response = await fetch(`${this.baseURL}/analyze/hexagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hexagramData)
      });
      
      if (!response.ok) throw new Error('API 請求失敗');
      return await response.json();
    } catch (error) {
      console.error('卦象分析失敗:', error);
      return this.getOfflineAnalysis(hexagramData);
    }
  }

  async analyzeTCM(wuxingData) {
    if (!this.isOnline) {
      return this.getOfflineTCMAnalysis(wuxingData);
    }

    try {
      const response = await fetch(`${this.baseURL}/analyze/tcm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wuxingData)
      });
      
      if (!response.ok) throw new Error('TCM API 請求失敗');
      return await response.json();
    } catch (error) {
      console.error('中醫分析失敗:', error);
      return this.getOfflineTCMAnalysis(wuxingData);
    }
  }

  async getSimilarCases(hexagramData) {
    if (!this.isOnline) return [];

    try {
      const response = await fetch(`${this.baseURL}/cases/similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hexagramData)
      });
      
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('獲取案例失敗:', error);
      return [];
    }
  }

  getOfflineAnalysis(hexagramData) {
    return {
      success: true,
      analysis: {
        overall: "離線分析模式 - 基礎卦象解讀",
        movingYao: "動爻影響需手動分析",
        yongShenAnalysis: "用神狀態分析（離線）",
        advice: ["保持耐心觀察", "記錄變化過程"],
        timing: "時機需自行把握"
      }
    };
  }

  getOfflineTCMAnalysis(wuxingData) {
    return {
      success: true,
      analysis: {
        constitution: "基礎體質分析（離線）",
        constitutionAnalysis: "請連接網絡獲取詳細分析",
        riskLevel: "medium",
        balanceScore: 65,
        keyElements: ["木", "土"],
        recommendedDepartments: [
          { name: "中醫內科", reason: "綜合調理" }
        ],
        herbalRecommendations: [
          {
            formula: "四君子湯",
            composition: "人參、白朮、茯苓、炙甘草",
            indication: "益氣健脾"
          }
        ],
        dietRecommendations: {
          foods: ["均衡飲食", "新鮮蔬果"],
          avoid: ["生冷", "油膩"]
        },
        lifestyleRecommendations: [
          "規律作息",
          "適度運動"
        ]
      }
    };
  }
}

window.ApiClient = ApiClient;

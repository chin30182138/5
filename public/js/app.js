// public/js/app.js
class LiuYaoApp {
  constructor() {
    this.hexagramCore = new HexagramCore();
    this.apiClient = new ApiClient();
    this.tcmAnalyzer = new TCMAnalyzer();
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    // 檢查API連接
    await this.apiClient.checkHealth();
    
    // 初始化界面
    this.initUI();
    this.bindEvents();
    
    // 初始渲染
    this.calcPillarsAndSix();
    this.drawHexagram();
    
    this.isInitialized = true;
    console.log('六爻排盤系統初始化完成');
  }

  initUI() {
    // 設置當前時間
    this.setCurrentTime();
    
    // 初始化動爻控制
    this.initMovingYaoControl();
    
    // 初始化五行雷達圖
    this.initRadarChart();
  }

  setCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('dt').value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  initMovingYaoControl() {
    const mvCtl = document.getElementById('mvCtl');
    mvCtl.innerHTML = [6, 5, 4, 3, 2, 1].map(p => 
      `<label><input type="checkbox" data-mv="${p-1}"> ${p === 6 ? '上' : p === 1 ? '初' : p}爻動</label>`
    ).join('');
  }

  // 其他核心方法...
  calcPillarsAndSix() {
    // 實現四柱計算...
  }

  drawHexagram() {
    // 實現卦圖繪製...
  }

  bindEvents() {
    // 綁定所有事件...
    document.getElementById('btnNow').addEventListener('click', () => {
      this.setCurrentTime();
      this.calcPillarsAndSix();
      this.drawHexagram();
    });

    document.getElementById('btnRandomHex').addEventListener('click', () => {
      this.generateRandomHexagram();
    });

    // 更多事件綁定...
  }

  generateRandomHexagram() {
    const trigrams = ['乾', '兌', '離', '震', '巽', '坎', '艮', '坤'];
    const randomUpper = trigrams[Math.floor(Math.random() * trigrams.length)];
    const randomLower = trigrams[Math.floor(Math.random() * trigrams.length)];
    
    document.getElementById('upper').value = randomUpper;
    document.getElementById('lower').value = randomLower;
    
    // 隨機動爻
    const checkboxes = document.querySelectorAll('#mvCtl input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = Math.random() < 0.3;
      this.hexagramCore.moving[parseInt(cb.dataset.mv)] = cb.checked;
    });
    
    this.calcPillarsAndSix();
    this.drawHexagram();
  }

  async performAdvancedAnalysis() {
    const hexagramData = this.collectHexagramData();
    const wuxingData = this.collectWuxingData();
    
    this.showLoadingState();
    
    try {
      const [hexagramAnalysis, tcmAnalysis, similarCases] = await Promise.all([
        this.apiClient.analyzeHexagram(hexagramData),
        this.apiClient.analyzeTCM(wuxingData),
        this.apiClient.getSimilarCases(hexagramData)
      ]);
      
      this.updateAdvancedAnalysis(hexagramAnalysis, tcmAnalysis, similarCases);
    } catch (error) {
      this.showErrorState('分析服務暫時不可用');
    }
  }

  collectHexagramData() {
    const upper = document.getElementById('upper').value;
    const lower = document.getElementById('lower').value;
    
    return {
      upperTrigram: upper,
      lowerTrigram: lower,
      hexagramName: this.hexagramCore.getGuaName(upper, lower),
      movingYao: this.hexagramCore.moving.map((isMoving, index) => ({
        position: index + 1,
        isMoving,
        isYang: [...this.hexagramCore.TRIG[lower], ...this.hexagramCore.TRIG[upper]][index] === 1
      })).filter(yao => yao.isMoving),
      question: document.getElementById('question').value,
      yongShen: document.getElementById('yongShen').value,
      pillars: this.hexagramCore.currentPillars,
      timestamp: new Date().toISOString()
    };
  }

  collectWuxingData() {
    return {
      mu: parseInt(document.getElementById('w5_mu').value),
      huo: parseInt(document.getElementById('w5_huo').value),
      tu: parseInt(document.getElementById('w5_tu').value),
      jin: parseInt(document.getElementById('w5_jin').value),
      shui: parseInt(document.getElementById('w5_shui').value)
    };
  }

  showLoadingState() {
    const tcmBox = document.getElementById('tcmBox');
    if (tcmBox) {
      tcmBox.innerHTML = `
        <h3>中醫體質分析與調理建議</h3>
        <div style="text-align: center; padding: 20px;">
          <div style="color: #3b82f6;">分析中...</div>
          <div class="muted">正在連接分析服務</div>
        </div>
      `;
    }
  }

  showErrorState(message) {
    const tcmBox = document.getElementById('tcmBox');
    if (tcmBox) {
      tcmBox.innerHTML = `
        <h3>中醫體質分析與調理建議</h3>
        <div style="text-align: center; padding: 20px; color: #ef4444;">
          <div>${message}</div>
          <button onclick="app.performAdvancedAnalysis()" style="margin-top: 10px;">重試</button>
        </div>
      `;
    }
  }

  updateAdvancedAnalysis(hexagramAnalysis, tcmAnalysis, similarCases) {
    if (tcmAnalysis && tcmAnalysis.success) {
      this.updateTCMWithApiData(tcmAnalysis);
    }
    
    if (hexagramAnalysis && hexagramAnalysis.success) {
      this.updateHexagramAnalysis(hexagramAnalysis);
    }
    
    if (similarCases && similarCases.length > 0) {
      this.showSimilarCases(similarCases);
    }
  }

  updateTCMWithApiData(tcmData) {
    // 更新中醫建議顯示
  }

  updateHexagramAnalysis(analysisData) {
    // 更新卦象分析顯示
  }

  showSimilarCases(cases) {
    // 顯示相似案例
  }
}

// 全局應用實例
window.app = new LiuYaoApp();

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  window.app.init();
});

// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // 服務前端靜態文件

// API 路由
app.use('/api/analyze', require('./api/analyze'));
app.use('/api/tcm', require('./api/tcm-analysis'));

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 靜態文件服務
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 六爻排盤服務器運行在端口 ${PORT}`);
  console.log(`📍 前端訪問: http://localhost:${PORT}`);
  console.log(`🔗 API 健康檢查: http://localhost:${PORT}/api/health`);
});

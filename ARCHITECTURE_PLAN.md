# 系統架構規劃：每天1萬人、同時1000人使用

## 📊 需求分析

### 流量估算
- **每日用戶數**：10,000 人
- **同時在線**：1,000 人
- **峰值流量**：假設集中在 4 小時（14:00-18:00）
  - 每小時約 2,500 人
  - 每分鐘約 42 人
  - 每秒約 0.7 人（峰值可能達到 2-3 人/秒）

### 數據存儲需求
- **用戶數據**：心靈筆記、任務進度、位置驗證記錄
- **統計數據**：訪問量、完成率、熱門任務
- **會話數據**：位置驗證狀態（5分鐘有效期）

---

## 🏗️ 架構設計

### 方案一：純靜態 + CDN（當前架構，適合初期）

#### 架構圖
```
用戶 → CDN (Cloudflare/CloudFront) → 靜態文件服務器
                                    ↓
                                瀏覽器 (localStorage)
```

#### 優點
- ✅ 成本低（幾乎免費）
- ✅ 部署簡單
- ✅ 無需維護服務器
- ✅ 高可用性（CDN 全球節點）

#### 缺點
- ❌ 數據無法跨設備同步
- ❌ 無法進行數據分析
- ❌ 無法防止數據丟失（清除瀏覽器數據）

#### 容量評估
- **CDN 帶寬**：假設平均頁面大小 500KB
  - 每天：10,000 × 500KB = 5GB
  - 峰值：1,000 × 500KB = 500MB（同時）
  - **推薦**：Cloudflare（免費 100GB/月）或 CloudFront（按量付費）

#### 成本估算
- **Cloudflare Pages**：免費
- **Cloudflare CDN**：免費（100GB/月）
- **總成本**：$0/月

---

### 方案二：靜態 + 後端 API（推薦，適合長期運營）

#### 架構圖
```
用戶 → CDN → 靜態文件服務器
         ↓
     API Gateway → 負載均衡器 → 應用服務器集群
                                    ↓
                                數據庫集群
                                    ↓
                                緩存層 (Redis)
```

#### 組件說明

##### 1. 前端層（靜態資源）
- **部署平台**：Cloudflare Pages / Vercel / Netlify
- **CDN**：Cloudflare（全球加速）
- **文件大小優化**：
  - HTML/CSS/JS 壓縮（Gzip/Brotli）
  - 圖片優化（WebP 格式）
  - 代碼分割（按需加載）

##### 2. API 層（後端服務）
- **技術選型**：
  - Node.js + Express / Fastify
  - Python + FastAPI
  - Go + Gin（高性能）
- **部署方式**：
  - 容器化（Docker + Kubernetes）
  - Serverless（AWS Lambda / Vercel Functions）
  - 傳統服務器（Nginx + PM2）

##### 3. 數據庫層
- **主數據庫**：PostgreSQL / MySQL
  - 用戶數據、任務進度、心靈筆記
  - 讀寫分離（1 主 + 2 從）
- **緩存層**：Redis
  - 會話數據（位置驗證狀態）
  - 熱點數據（任務配置）
  - 統計數據（實時計數器）

##### 4. 監控與日誌
- **應用監控**：Sentry / Datadog
- **性能監控**：New Relic / CloudWatch
- **日誌收集**：ELK Stack / CloudWatch Logs
- **CDN 分析**：Cloudflare Analytics

#### 容量規劃

##### API 服務器
- **單服務器處理能力**：假設 500 req/s
- **需要服務器數量**：1,000 並發 ÷ 500 = 2 台（建議 3-4 台做冗餘）
- **配置建議**：
  - CPU：4 核心
  - 內存：8GB
  - 帶寬：100Mbps

##### 數據庫
- **讀寫比例**：假設 9:1（讀多寫少）
- **讀操作**：900 req/s
- **寫操作**：100 req/s
- **配置建議**：
  - 主庫：4 核心，16GB 內存，SSD
  - 從庫：2 核心，8GB 內存，SSD（2 台）

##### Redis 緩存
- **內存需求**：假設每個會話 1KB
  - 1,000 並發 × 1KB = 1MB
  - 加上其他緩存，總計約 100MB
- **配置建議**：2GB 內存（預留擴展空間）

#### 成本估算（AWS 範例）

##### 方案 A：傳統 EC2
- **EC2 實例**（3 台 t3.medium）：$90/月
- **RDS PostgreSQL**（db.t3.medium）：$150/月
- **ElastiCache Redis**（cache.t3.micro）：$15/月
- **CloudFront CDN**：$10/月（5GB 流量）
- **S3 存儲**：$1/月
- **總計**：約 $266/月

##### 方案 B：Serverless（推薦）
- **Vercel/Netlify**：免費（或 Pro $20/月）
- **Supabase**（PostgreSQL + 實時）：免費（或 Pro $25/月）
- **Upstash Redis**：免費（或 Pro $10/月）
- **Cloudflare CDN**：免費
- **總計**：$0-55/月

---

## 🔧 技術實施建議

### 階段一：優化當前靜態架構（立即實施）

#### 1. CDN 配置
```javascript
// 添加緩存策略
Cache-Control: public, max-age=31536000  // 靜態資源
Cache-Control: public, max-age=3600      // HTML
```

#### 2. 資源優化
- **圖片壓縮**：使用 WebP 格式
- **代碼壓縮**：Minify CSS/JS
- **Gzip/Brotli**：啟用壓縮
- **HTTP/2**：啟用多路復用

#### 3. 監控添加
```html
<!-- 添加 Google Analytics 或 Cloudflare Web Analytics -->
<script>
  // 追蹤頁面訪問
  // 追蹤錯誤
  // 追蹤性能指標
</script>
```

### 階段二：添加後端 API（1-2 週）

#### 1. API 設計
```javascript
// RESTful API 設計
POST   /api/users              // 創建用戶
GET    /api/users/:id          // 獲取用戶
PUT    /api/users/:id          // 更新用戶
POST   /api/users/:id/notes    // 保存筆記
GET    /api/users/:id/notes    // 獲取筆記
POST   /api/users/:id/progress // 更新進度
GET    /api/stats              // 獲取統計
```

#### 2. 數據模型
```sql
-- 用戶表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 筆記表
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mission_key VARCHAR(50),
  content TEXT,
  emotion VARCHAR(50),
  created_at TIMESTAMP
);

-- 進度表
CREATE TABLE progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mission_key VARCHAR(50),
  completed BOOLEAN,
  completed_at TIMESTAMP
);
```

#### 3. 前端改造
```javascript
// 添加 API 客戶端
const API = {
  baseURL: 'https://api.yourdomain.com',
  
  async saveNote(userId, note) {
    return fetch(`${this.baseURL}/api/users/${userId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
  },
  
  async getNotes(userId) {
    return fetch(`${this.baseURL}/api/users/${userId}/notes`);
  }
};

// 修改現有代碼，從 localStorage 改為 API
// 添加離線支持（Service Worker）
```

### 階段三：擴展與優化（持續）

#### 1. 性能優化
- **數據庫索引**：為常用查詢添加索引
- **查詢優化**：避免 N+1 查詢
- **緩存策略**：熱點數據緩存 5-10 分鐘

#### 2. 高可用性
- **多區域部署**：主區域 + 備用區域
- **自動故障轉移**：數據庫主從切換
- **健康檢查**：每 30 秒檢查服務狀態

#### 3. 安全措施
- **HTTPS**：強制 HTTPS（已實現）
- **CORS**：配置正確的跨域策略
- **Rate Limiting**：API 限流（100 req/min/用戶）
- **數據加密**：敏感數據加密存儲

---

## 📈 監控指標

### 關鍵指標（KPI）
1. **可用性**：目標 99.9%（每月宕機 < 43 分鐘）
2. **響應時間**：
   - API：< 200ms（P95）
   - 頁面加載：< 2s
3. **錯誤率**：< 0.1%
4. **並發處理**：支持 1,000+ 同時在線

### 監控儀表板
- **實時流量**：當前在線用戶數
- **API 性能**：響應時間、錯誤率
- **數據庫性能**：查詢時間、連接數
- **CDN 性能**：緩存命中率、帶寬使用

---

## 🚀 部署建議

### 推薦方案：Serverless + 雲數據庫

#### 架構
```
用戶 → Cloudflare CDN → Vercel/Netlify (靜態)
                    ↓
                Supabase (PostgreSQL + 實時)
                    ↓
                Upstash (Redis)
```

#### 優點
- ✅ 自動擴展（無需擔心流量突增）
- ✅ 成本低（按使用量付費）
- ✅ 維護簡單（無需管理服務器）
- ✅ 全球加速（CDN + 邊緣計算）

#### 實施步驟
1. **第 1 週**：設置 Supabase 數據庫，設計數據模型
2. **第 2 週**：開發 API（使用 Supabase Edge Functions）
3. **第 3 週**：前端改造，添加 API 調用
4. **第 4 週**：測試、優化、部署

---

## 💰 成本對比

| 方案 | 月成本 | 擴展性 | 維護難度 |
|------|--------|--------|----------|
| 純靜態 + CDN | $0 | 低 | 極低 |
| Serverless | $0-55 | 高 | 低 |
| 傳統服務器 | $266+ | 中 | 中 |

---

## 📝 檢查清單

### 立即實施（本週）
- [ ] 配置 CDN（Cloudflare）
- [ ] 啟用 Gzip/Brotli 壓縮
- [ ] 添加 Google Analytics
- [ ] 優化圖片和代碼大小

### 短期實施（1 個月）
- [ ] 設置後端 API（Supabase）
- [ ] 設計數據庫結構
- [ ] 開發 API 接口
- [ ] 前端改造（localStorage → API）
- [ ] 添加錯誤監控（Sentry）

### 長期優化（持續）
- [ ] 性能監控和優化
- [ ] 數據分析儀表板
- [ ] A/B 測試框架
- [ ] 自動化測試
- [ ] CI/CD 流程

---

## 🔗 推薦工具與服務

### 免費/低成本方案
- **CDN**：Cloudflare（免費）
- **靜態託管**：Vercel / Netlify（免費）
- **數據庫**：Supabase（免費 500MB）
- **緩存**：Upstash Redis（免費 10K 命令/天）
- **監控**：Sentry（免費 5K 錯誤/月）

### 付費方案（需要時）
- **數據庫**：Supabase Pro（$25/月）
- **監控**：Datadog（$15/主機/月）
- **CDN**：Cloudflare Pro（$20/月）

---

**最後更新**：2024年
**狀態**：規劃中

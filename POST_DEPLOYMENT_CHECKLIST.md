# 部署後檢查清單與優化指南

## ✅ 第一步：確認部署成功

### 1. 檢查部署狀態

1. **進入 Cloudflare Dashboard**
   - 訪問：https://dash.cloudflare.com
   - 進入「Workers & Pages」→「Pages」
   - 選擇您的項目

2. **查看部署歷史**
   - 應該看到最新的部署記錄
   - 狀態應該是「Success」（綠色）
   - 如果有錯誤，點擊查看詳細日誌

3. **訪問網站**
   - 點擊部署記錄中的「View deployment」
   - 或訪問：`https://yourproject.pages.dev`
   - 確認網站可以正常訪問

### 2. 測試基本功能

打開網站後，測試以下功能：

- [ ] 頁面可以正常加載
- [ ] 樣式表（CSS）正常顯示
- [ ] JavaScript 功能正常
- [ ] 多語言切換正常
- [ ] 響應式設計（手機版）正常

---

## 🔧 第二步：優化 Cloudflare 設定

### 1. 啟用性能優化

進入 Cloudflare Dashboard → 您的域名 → Speed：

#### Auto Minify（自動壓縮）
- ✅ JavaScript
- ✅ CSS  
- ✅ HTML

#### 壓縮設定
- ✅ 啟用 Brotli
- ✅ 確保 Gzip 已啟用

#### 協議設定
- ✅ HTTP/2
- ✅ HTTP/3 (QUIC)

### 2. 設定緩存規則

進入「Caching」→「Configuration」：

#### 緩存級別
- 選擇「Standard」或「Aggressive」

#### Browser Cache TTL
- 選擇「Respect Existing Headers」或「4 hours」

#### 創建 Page Rules（免費版 3 條）

**規則 1：靜態資源長期緩存**
```
URL: *yourproject.pages.dev/*.{css,js,jpg,png,gif,webp,svg,woff,woff2}
設定：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

**規則 2：HTML 文件短期緩存**
```
URL: *yourproject.pages.dev/*.html
設定：
- Cache Level: Standard
- Edge Cache TTL: 1 hour
```

**規則 3：根路徑**
```
URL: yourproject.pages.dev/
設定：
- Cache Level: Standard
- Edge Cache TTL: 1 hour
```

### 3. 安全設定

進入「Security」：

#### 安全級別
- 選擇「Medium」（平衡安全性和可用性）

#### Bot Fight Mode
- ✅ 啟用（免費版自動啟用）

#### SSL/TLS 設定
- 進入「SSL/TLS」
- 選擇「Full」或「Full (strict)」
- ✅ 啟用「Always Use HTTPS」
- ✅ 啟用「Automatic HTTPS Rewrites」

---

## 🧪 第三步：測試關鍵功能

### 1. HTTPS 功能測試

您的項目需要 HTTPS 才能正常運作以下功能：

#### 測試語音功能
1. 打開任意任務頁面（如 `wave.html`）
2. 點擊「🎤 開始引導」
3. 確認：
   - [ ] 瀏覽器請求麥克風權限（需要 HTTPS）
   - [ ] 語音合成可以播放
   - [ ] 語音識別可以工作

#### 測試 GPS 定位
1. 打開任意任務頁面
2. 確認：
   - [ ] 瀏覽器請求位置權限（需要 HTTPS）
   - [ ] 位置驗證功能正常
   - [ ] 測試模式可以正常使用

### 2. 多語言測試

測試所有語言版本：
- [ ] 繁體中文
- [ ] 簡體中文
- [ ] English
- [ ] 日本語
- [ ] 한국어

確認：
- [ ] 語言切換正常
- [ ] 所有文字正確顯示
- [ ] 語音引導使用正確語言

### 3. 響應式設計測試

在不同設備上測試：
- [ ] 桌面版（1920x1080）
- [ ] 平板（768x1024）
- [ ] 手機（375x667）

確認：
- [ ] 布局正常
- [ ] 按鈕大小合適
- [ ] 文字清晰可讀
- [ ] 位置驗證遮罩正常顯示

---

## 📊 第四步：添加監控和分析

### 1. Cloudflare Web Analytics（免費）

1. **啟用 Web Analytics**
   - 進入「Analytics & Logs」→「Web Analytics」
   - 點擊「Add a site」
   - 選擇您的域名或 Pages 項目
   - 複製提供的 JavaScript 代碼

2. **添加到網站**
   - 編輯 `index.html`
   - 在 `</head>` 之前添加：

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
```

3. **查看數據**
   - 訪問：Analytics & Logs → Web Analytics
   - 查看訪問量、頁面瀏覽、國家/地區等

### 2. Google Analytics（可選）

如果需要更詳細的分析：

1. **創建 Google Analytics 帳號**
   - 訪問：https://analytics.google.com
   - 創建帳號和屬性
   - 獲取 Measurement ID（格式：G-XXXXXXXXXX）

2. **添加到網站**
   - 編輯 `index.html`
   - 在 `</head>` 之前添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. 錯誤監控（可選，推薦）

考慮添加 Sentry 進行錯誤追蹤：

1. **註冊 Sentry**
   - 訪問：https://sentry.io
   - 創建免費帳號

2. **添加到網站**
   - 在 `index.html` 的 `</head>` 之前添加：

```html
<!-- Sentry Error Tracking -->
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"
        integrity="sha-xxx"
        crossorigin="anonymous"></script>
<script>
  Sentry.init({
    dsn: "YOUR_DSN_HERE",
    environment: "production"
  });
</script>
```

---

## 🚀 第五步：性能優化

### 1. 檢查頁面速度

使用以下工具測試：

- **PageSpeed Insights**：https://pagespeed.web.dev/
- **WebPageTest**：https://www.webpagetest.org/
- **GTmetrix**：https://gtmetrix.com/

目標：
- ✅ Performance Score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s

### 2. 優化資源

#### 圖片優化
- [ ] 將圖片轉換為 WebP 格式
- [ ] 壓縮圖片大小
- [ ] 使用適當的圖片尺寸

#### 代碼優化
- [ ] 確認 Cloudflare Auto Minify 已啟用
- [ ] 檢查是否有未使用的代碼
- [ ] 考慮代碼分割（如果文件很大）

### 3. 添加 Service Worker（可選）

實現離線支持和更快的加載：

1. **創建 `sw.js` 文件**
```javascript
const CACHE_NAME = 'lanyang-hero-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/i18n.js',
  // 添加其他重要文件
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

2. **註冊 Service Worker**
   - 在 `index.html` 的 `</body>` 之前添加：

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed'));
    });
  }
</script>
```

---

## 🔗 第六步：設定自定義域名（可選）

如果您有自定義域名：

### 1. 在 Cloudflare Pages 添加域名

1. **進入 Pages 設定**
   - 選擇您的項目
   - 進入「Custom domains」

2. **添加域名**
   - 點擊「Set up a custom domain」
   - 輸入您的域名（例如：`yourdomain.com`）
   - 按照指示設定 DNS

### 2. 設定 DNS 記錄

在 Cloudflare DNS 設定中添加：

```
類型：CNAME
名稱：@
目標：yourproject.pages.dev
代理狀態：已代理（橙色）
```

### 3. 等待生效

- 通常 5-30 分鐘
- 最多 48 小時

---

## 📝 第七步：文檔和維護

### 1. 創建 README.md

在 GitHub Repository 根目錄創建 `README.md`：

```markdown
# 擺渡蘭陽英雄之旅

## 功能特色
- 十關英雄旅程
- AI 語音引導
- 多語言支持
- GPS 位置驗證

## 技術棧
- 純前端（HTML/CSS/JavaScript）
- Cloudflare Pages 部署
- 瀏覽器原生 API

## 訪問地址
- 生產環境：https://yourproject.pages.dev
- 開發環境：本地開發

## 部署
自動部署：推送到 main 分支自動部署
```

### 2. 設定自動部署

Cloudflare Pages 已自動設定：
- ✅ 推送到 main 分支 → 自動部署
- ✅ 預覽部署：Pull Request 會創建預覽

### 3. 設定環境變數（如果需要）

如果未來需要 API 端點：

1. **進入 Pages 設定**
   - 選擇「Settings」→「Environment variables」

2. **添加變數**
   ```
   API_URL=https://api.yourdomain.com
   API_KEY=your-api-key
   ```

3. **在代碼中使用**
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'default-url';
   ```

---

## ✅ 最終檢查清單

### 功能檢查
- [ ] 網站可以正常訪問
- [ ] HTTPS 正常工作
- [ ] 語音功能正常（需要 HTTPS）
- [ ] GPS 定位正常（需要 HTTPS）
- [ ] 多語言切換正常
- [ ] 響應式設計正常
- [ ] 所有按鈕可點擊
- [ ] 位置驗證功能正常

### 性能檢查
- [ ] 頁面加載速度 < 2 秒
- [ ] 靜態資源已緩存
- [ ] 圖片已優化
- [ ] 代碼已壓縮

### 安全檢查
- [ ] HTTPS 已啟用
- [ ] SSL 證書有效
- [ ] 安全級別已設定
- [ ] Bot 防護已啟用

### 監控檢查
- [ ] Web Analytics 已添加
- [ ] 錯誤監控已設定（可選）
- [ ] 性能監控已設定（可選）

---

## 🎯 下一步建議

### 短期（1 週內）
1. ✅ 完成上述所有檢查
2. ✅ 測試所有功能
3. ✅ 優化性能
4. ✅ 添加監控

### 中期（1 個月內）
1. 收集用戶反饋
2. 分析訪問數據
3. 優化用戶體驗
4. 考慮添加後端 API（如果需要數據持久化）

### 長期（持續）
1. 定期更新內容
2. 監控性能指標
3. 優化 SEO
4. 擴展功能

---

## 🆘 常見問題

### Q: 部署後網站顯示 404？
**A:** 
- 檢查 Build output directory 是否正確（應該是 `/`）
- 確認 `index.html` 在根目錄
- 檢查文件路徑是否正確

### Q: 語音功能不工作？
**A:**
- 確認使用 HTTPS（Cloudflare 自動提供）
- 檢查瀏覽器是否支持（Chrome/Edge 最佳）
- 確認用戶已允許麥克風權限

### Q: 緩存更新不及時？
**A:**
- 進入 Cloudflare → Caching → Purge Cache
- 選擇「Purge Everything」
- 等待 30 秒後重新訪問

### Q: 如何回滾到之前的版本？
**A:**
- 進入 Pages → Deployments
- 找到之前的部署
- 點擊「Retry deployment」或「Rollback」

---

## 📞 需要幫助？

- **Cloudflare 文檔**：https://developers.cloudflare.com/pages/
- **Cloudflare 社區**：https://community.cloudflare.com/
- **GitHub Issues**：在您的 Repository 創建 Issue

---

**最後更新**：2024年
**狀態**：部署後優化指南

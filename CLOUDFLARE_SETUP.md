# Cloudflare 設定指南

## 📋 前置準備

### 需要的資訊
- ✅ Cloudflare 帳號（已申請）
- ✅ 域名（如果有的話）
- ✅ 靜態網站託管平台帳號（Vercel/Netlify/GitHub Pages）

---

## 🚀 設定步驟

### 方案 A：使用自定義域名（推薦）

#### 步驟 1：添加網站到 Cloudflare

1. **登入 Cloudflare Dashboard**
   - 訪問：https://dash.cloudflare.com
   - 使用您的帳號登入

2. **添加網站**
   - 點擊右上角「Add a Site」
   - 輸入您的域名（例如：`yourdomain.com`）
   - 點擊「Add site」

3. **選擇方案**
   - 選擇「Free」方案（免費版已足夠）
   - 點擊「Continue」

4. **掃描 DNS 記錄**
   - Cloudflare 會自動掃描現有的 DNS 記錄
   - 檢查記錄是否正確
   - 點擊「Continue」

5. **更新 Nameservers**
   - Cloudflare 會提供兩個 Nameservers（例如：`ns1.cloudflare.com`）
   - 到您的域名註冊商（如 GoDaddy、Namecheap）更新 Nameservers
   - 等待 24-48 小時生效

---

#### 步驟 2：DNS 設定

1. **進入 DNS 設定**
   - 在 Cloudflare Dashboard 選擇您的域名
   - 點擊左側「DNS」選單

2. **添加記錄（根據您的託管平台）**

##### 如果使用 Vercel/Netlify：
```
類型：CNAME
名稱：@ 或 www
目標：cname.vercel-dns.com（Vercel）
     或 cname.vercel-dns.com（Netlify）
代理狀態：已代理（橙色雲朵）
```

##### 如果使用 GitHub Pages：
```
類型：CNAME
名稱：@
目標：yourusername.github.io
代理狀態：已代理（橙色雲朵）

類型：CNAME
名稱：www
目標：yourusername.github.io
代理狀態：已代理（橙色雲朵）
```

##### 如果使用自定義服務器：
```
類型：A
名稱：@
IPv4 地址：您的服務器 IP
代理狀態：已代理（橙色雲朵）

類型：A
名稱：www
IPv4 地址：您的服務器 IP
代理狀態：已代理（橙色雲朵）
```

3. **確認代理狀態**
   - 確保記錄旁邊的雲朵圖標是**橙色**（已代理）
   - 灰色表示未代理，不會使用 Cloudflare CDN

---

#### 步驟 3：SSL/TLS 設定

1. **進入 SSL/TLS 設定**
   - 點擊左側「SSL/TLS」選單

2. **選擇加密模式**
   - 選擇「**Full (strict)**」或「**Full**」
   - **Full (strict)**：需要有效的 SSL 證書（推薦）
   - **Full**：允許自簽名證書
   - **Flexible**：僅加密到 Cloudflare（不推薦）

3. **啟用自動 HTTPS**
   - 在「Edge Certificates」區塊
   - 確保「Always Use HTTPS」已啟用
   - 啟用「Automatic HTTPS Rewrites」

4. **設定最低 TLS 版本**
   - 選擇「TLS 1.2」或更高（推薦 TLS 1.3）

---

#### 步驟 4：緩存設定（重要）

1. **進入 Caching 設定**
   - 點擊左側「Caching」選單

2. **設定緩存級別**
   - 選擇「Standard」或「Aggressive」
   - **Standard**：尊重原始服務器的 Cache-Control
   - **Aggressive**：更積極的緩存（適合靜態網站）

3. **設定 Browser Cache TTL**
   - 選擇「Respect Existing Headers」或「4 hours」
   - 對於靜態資源，可以選擇更長時間

4. **清除緩存（需要時）**
   - 點擊「Purge Everything」清除所有緩存
   - 或使用「Custom Purge」清除特定文件

---

#### 步驟 5：性能優化

1. **進入 Speed 設定**
   - 點擊左側「Speed」選單

2. **啟用 Auto Minify**
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML
   - 這會自動壓縮您的代碼

3. **啟用 Brotli 壓縮**
   - 在「Optimization」區塊
   - 啟用「Brotli」
   - 這會進一步壓縮文件大小

4. **啟用 HTTP/2 和 HTTP/3**
   - 在「Protocol」區塊
   - 確保 HTTP/2 和 HTTP/3（QUIC）已啟用

5. **啟用 Rocket Loader（可選）**
   - 可以改善 JavaScript 加載性能
   - 但可能與某些框架不兼容，建議先測試

---

#### 步驟 6：安全設定

1. **進入 Security 設定**
   - 點擊左側「Security」選單

2. **設定安全級別**
   - 選擇「Medium」或「High」
   - **Medium**：平衡安全性和可用性（推薦）
   - **High**：更嚴格，可能誤攔正常用戶

3. **啟用 Bot Fight Mode**
   - 在「Bots」區塊
   - 啟用「Bot Fight Mode」（免費版）
   - 這會自動阻擋惡意機器人

4. **設定 Rate Limiting（可選，需要 Pro 方案）**
   - 限制 API 請求頻率
   - 防止濫用

---

#### 步驟 7：頁面規則（進階優化）

1. **進入 Rules 設定**
   - 點擊左側「Rules」→「Page Rules」

2. **創建規則（免費版 3 條）**

##### 規則 1：靜態資源長期緩存
```
URL 模式：*yourdomain.com/*.css
設定：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

##### 規則 2：JavaScript 文件
```
URL 模式：*yourdomain.com/*.js
設定：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

##### 規則 3：圖片文件
```
URL 模式：*yourdomain.com/*.{jpg,png,gif,webp,svg}
設定：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

---

### 方案 B：使用 Cloudflare Pages（無需域名）

如果您沒有自定義域名，可以直接使用 Cloudflare Pages：

#### 步驟 1：連接 GitHub Repository

1. **進入 Cloudflare Pages**
   - 訪問：https://dash.cloudflare.com
   - 點擊左側「Workers & Pages」
   - 選擇「Pages」

2. **創建新項目**
   - 點擊「Create a project」
   - 選擇「Connect to Git」
   - 授權 GitHub/GitLab/Bitbucket

3. **選擇 Repository**
   - 選擇您的項目 Repository
   - 點擊「Begin setup」

4. **構建設定**
   - **Project name**：輸入項目名稱
   - **Production branch**：`main` 或 `master`
   - **Build command**：留空（純靜態網站）
   - **Build output directory**：`/` 或留空

5. **部署**
   - 點擊「Save and Deploy」
   - 等待部署完成
   - 您會獲得一個免費域名：`yourproject.pages.dev`

---

## 🔧 針對本項目的具體設定

### 1. 添加自定義 Headers

在 Cloudflare Dashboard → Rules → Transform Rules → Modify Response Header：

```
Header name: Cache-Control
Value: public, max-age=31536000, immutable
適用於：*.css, *.js, *.jpg, *.png, *.gif, *.webp, *.svg
```

### 2. 設定 HTML 緩存

創建 Page Rule：
```
URL: yourdomain.com/*.html
設定：
- Cache Level: Standard
- Edge Cache TTL: 1 hour
```

### 3. 啟用 Web Analytics（免費）

1. 進入「Analytics & Logs」→「Web Analytics」
2. 點擊「Add a site」
3. 選擇您的域名
4. 複製提供的 JavaScript 代碼
5. 添加到您的 `index.html`：

```html
<!-- 在 </head> 之前添加 -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

---

## 📊 驗證設定

### 檢查清單

- [ ] DNS 記錄已正確設定
- [ ] SSL/TLS 模式設為「Full」或「Full (strict)」
- [ ] Always Use HTTPS 已啟用
- [ ] Auto Minify 已啟用（JS、CSS、HTML）
- [ ] Brotli 壓縮已啟用
- [ ] HTTP/2 和 HTTP/3 已啟用
- [ ] 緩存規則已設定
- [ ] 安全級別已設定

### 測試工具

1. **SSL 測試**
   - https://www.ssllabs.com/ssltest/
   - 輸入您的域名，檢查 SSL 評級

2. **速度測試**
   - https://www.webpagetest.org/
   - 測試頁面加載速度

3. **CDN 測試**
   - 訪問：https://www.whatismyip.com/cdn-check/
   - 確認 CDN 是否生效

4. **緩存測試**
   ```bash
   # 檢查響應頭
   curl -I https://yourdomain.com/styles.css
   
   # 應該看到：
   # CF-Cache-Status: HIT (表示緩存命中)
   # Server: cloudflare
   ```

---

## 🎯 性能優化建議

### 1. 啟用 Cloudflare Workers（可選）

可以添加自定義邏輯，例如：
- 添加安全 Headers
- 重定向規則
- A/B 測試

### 2. 使用 Cloudflare Images（可選，付費）

自動優化圖片：
- 自動轉換為 WebP
- 自動調整大小
- 減少帶寬使用

### 3. 啟用 Argo Smart Routing（可選，付費）

優化路由，減少延遲：
- 自動選擇最快路徑
- 適合全球用戶

---

## ⚠️ 常見問題

### Q1: DNS 設定後多久生效？
**A:** 通常 5-30 分鐘，最多 48 小時。可以通過 `nslookup` 檢查。

### Q2: 為什麼網站顯示「522 錯誤」？
**A:** 這表示 Cloudflare 無法連接到您的原始服務器。檢查：
- 服務器是否運行
- 防火牆是否允許 Cloudflare IP
- SSL 證書是否正確

### Q3: 如何清除緩存？
**A:** 
- 進入 Caching → Purge Cache
- 選擇「Purge Everything」或「Custom Purge」
- 等待 30 秒生效

### Q4: 免費版有什麼限制？
**A:**
- ✅ 無限帶寬（合理使用）
- ✅ 基本 DDoS 防護
- ✅ SSL 證書
- ✅ CDN 加速
- ❌ 3 條 Page Rules
- ❌ 無 Rate Limiting
- ❌ 無 Argo Smart Routing

### Q5: 如何查看統計數據？
**A:**
- 進入「Analytics」→「Web Traffic」
- 查看訪問量、帶寬、請求數等
- 啟用 Web Analytics 可獲得更詳細數據

---

## 📝 下一步

設定完成後，建議：

1. **監控性能**
   - 定期檢查 Analytics
   - 關注錯誤率
   - 監控響應時間

2. **優化內容**
   - 壓縮圖片
   - 優化代碼
   - 減少 HTTP 請求

3. **測試功能**
   - 測試語音功能（需要 HTTPS）
   - 測試 GPS 定位
   - 測試多語言切換

---

## 🔗 相關資源

- **Cloudflare 文檔**：https://developers.cloudflare.com/
- **Cloudflare 社區**：https://community.cloudflare.com/
- **狀態頁面**：https://www.cloudflarestatus.com/

---

**最後更新**：2024年
**適用版本**：Cloudflare Free Plan

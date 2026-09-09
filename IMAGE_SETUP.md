# 圖片設置指南

## 📸 圖片需求

為了使用真實的壯圍沙丘圖片作為背景，請準備以下圖片：

### 1. 圖片規格

#### 桌面版（標準）
- **文件名**: `zhuangwei-sand-dune-bg.jpg`
- **建議尺寸**: 1920x1080 像素
- **格式**: JPG 或 WebP
- **檔案大小**: < 500KB（建議壓縮後）
- **內容**: 壯圍沙丘生態園區全景，包含藍天、建築、水面、草地

#### 手機版（優化）
- **文件名**: `zhuangwei-sand-dune-bg-mobile.jpg`
- **建議尺寸**: 768x1024 像素（或 1080x1920 豎屏）
- **格式**: JPG 或 WebP
- **檔案大小**: < 200KB
- **內容**: 與桌面版相同，但針對手機螢幕優化

#### 4K/高解析度版（可選）
- **文件名**: `zhuangwei-sand-dune-bg-4k.jpg`
- **建議尺寸**: 3840x2160 像素
- **格式**: JPG 或 WebP
- **檔案大小**: < 1MB
- **內容**: 高解析度版本，供大螢幕使用

### 2. 圖片優化建議

#### 使用 WebP 格式（推薦）
- 更好的壓縮率
- 保持相同品質，檔案更小
- 現代瀏覽器都支援

#### 壓縮工具
- **線上工具**: 
  - TinyPNG: https://tinypng.com/
  - Squoosh: https://squoosh.app/
  - ImageOptim: https://imageoptim.com/
- **建議壓縮率**: 70-85%（平衡品質與檔案大小）

#### 圖片內容建議
- ✅ 明亮的藍天白雲
- ✅ 平靜的水面（如果有）
- ✅ 綠色草地
- ✅ 沙丘景觀
- ✅ 現代建築（如果可見）
- ✅ 整體色調明亮、清晰

### 3. 檔案結構

將圖片放在專案根目錄的 `images` 資料夾中：

```
專案根目錄/
├── images/
│   ├── zhuangwei-sand-dune-bg.jpg          (桌面版)
│   ├── zhuangwei-sand-dune-bg-mobile.jpg   (手機版)
│   └── zhuangwei-sand-dune-bg-4k.jpg       (4K版，可選)
├── index.html
└── ...
```

### 4. 圖片來源建議

#### 免費圖片資源
1. **Unsplash**: https://unsplash.com/
   - 搜尋: "zhuangwei sand dune" 或 "taiwan coast"
   - 高品質、免費使用

2. **Pexels**: https://www.pexels.com/
   - 搜尋: "sand dune landscape" 或 "coastal park"

3. **Pixabay**: https://pixabay.com/
   - 搜尋: "sand dune" 或 "coastal landscape"

#### 自行拍攝
- 使用高解析度相機或手機
- 選擇光線良好的時段（上午或下午）
- 確保構圖包含天空、建築、水面、草地

### 5. 性能優化

#### 延遲加載（已實現）
- 圖片會在背景預載入
- 載入完成後才顯示，避免閃爍

#### 響應式圖片（已實現）
- 根據螢幕尺寸自動選擇合適的圖片
- 手機使用較小檔案，節省流量

#### 備用方案（已實現）
- 如果圖片載入失敗，自動使用漸變背景
- 確保頁面始終可正常顯示

### 6. 測試檢查清單

- [ ] 圖片檔案已放置在 `images/` 資料夾
- [ ] 檔案名稱正確（區分大小寫）
- [ ] 圖片尺寸符合建議規格
- [ ] 圖片已壓縮（檔案大小合理）
- [ ] 在不同裝置上測試（手機、平板、桌面）
- [ ] 測試網路較慢時的載入情況
- [ ] 檢查圖片載入失敗時的備用方案

### 7. 進階優化（可選）

#### 使用 CDN
如果圖片檔案較大，可以：
1. 上傳到 Cloudflare Images
2. 使用 Cloudflare 的圖片優化功能
3. 自動生成不同尺寸的版本

#### 使用 picture 元素（更精確控制）
如果需要更精確的響應式控制，可以改用 `<picture>` 元素：

```html
<picture>
  <source media="(min-width: 1920px)" srcset="images/bg-4k.jpg">
  <source media="(max-width: 768px)" srcset="images/bg-mobile.jpg">
  <img src="images/bg.jpg" alt="壯圍沙丘背景">
</picture>
```

---

## 🚀 快速開始

1. **準備圖片**
   - 找到或拍攝壯圍沙丘的圖片
   - 確保圖片品質良好

2. **創建資料夾**
   ```bash
   mkdir images
   ```

3. **放置圖片**
   - 將圖片放入 `images/` 資料夾
   - 確保檔案名稱正確

4. **優化圖片**
   - 使用壓縮工具減少檔案大小
   - 建議轉換為 WebP 格式

5. **測試**
   - 在瀏覽器中打開 `index.html`
   - 檢查圖片是否正常顯示
   - 測試不同裝置和網路速度

---

## 📝 注意事項

- ⚠️ 確保圖片版權合法（使用授權圖片或自行拍攝）
- ⚠️ 圖片檔案不要太大，影響載入速度
- ⚠️ 建議使用 WebP 格式以獲得最佳性能
- ⚠️ 如果沒有圖片，系統會自動使用漸變背景作為備用方案

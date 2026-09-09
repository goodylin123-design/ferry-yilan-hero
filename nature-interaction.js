// 與自然互動功能模組
// 處理 QR code 掃描和不同互動類型的觸發

(function() {
    'use strict';

    let html5QrcodeScanner = null;
    let isScanning = false;
    let externalAudioPlayer = null;
    let lastPlaybackToken = 0;
    let isPlayingAudio = false;
    let missionMusicPlayer = null;
    let currentMissionData = null;

    const EXTERNAL_TTS_ENABLED = true;
    const EXTERNAL_TTS_CHAR_LIMIT = 180;
    const EXTERNAL_TTS_PROVIDERS = ['voicerss', 'streamelements', 'google'];
    const EXTERNAL_TTS_VOICE = 'Zhiyu';
    const FORCE_SPEECH_SYNTHESIS_ON_IOS = true;
    const VOICERSS_API_KEY = ''; // TODO: 填入 VoiceRSS API Key

    const TW_FEMALE_VOICE_KEYWORDS = [
        'Mei-Jia',
        '美佳',
        '美嘉',
        'Mei Jia',
        'Female',
        '女'
    ];

    function isIosSafari() {
        const ua = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
        return isIOS && isSafari;
    }

    function getCurrentLanguage() {
        if (window.I18n && typeof window.I18n.getCurrentLanguage === 'function') {
            return window.I18n.getCurrentLanguage();
        }
        return 'zh-TW';
    }

    function getTtsLanguage() {
        const lang = getCurrentLanguage();
        const map = {
            'zh-TW': 'zh-TW',
            'zh-CN': 'zh-CN',
            en: 'en-US',
            ja: 'ja-JP',
            ko: 'ko-KR'
        };
        return map[lang] || lang;
    }

    function getExternalProvidersForLang(lang) {
        if (lang && lang.startsWith('zh')) {
            return EXTERNAL_TTS_PROVIDERS;
        }
        // 韓文在外部 TTS 上容易出現壓縮感，優先用內建語音
        if (lang && lang.startsWith('ko')) {
            return [];
        }
        return ['voicerss', 'google'];
    }

    function getVoiceRssLang(lang) {
        const map = {
            'zh-TW': 'zh-tw',
            'zh-CN': 'zh-cn',
            'en-US': 'en-us',
            'ja-JP': 'ja-jp',
            'ko-KR': 'ko-kr'
        };
        return map[lang] || 'zh-tw';
    }

    function t(key, fallback = '') {
        if (window.I18n && typeof window.I18n.t === 'function') {
            const value = window.I18n.t(key);
            if (value && value !== key) {
                return value;
            }
        }
        return fallback || key;
    }

    const MISSION_LOCATION_KEYS = {
        mission1: 'missionWaveLoc',
        mission2: 'missionRainLoc',
        mission3: 'missionDawnLoc',
        mission4: 'mission4Loc',
        mission5: 'mission5Loc',
        mission6: 'mission6Loc',
        mission7: 'mission7Loc',
        mission8: 'mission8Loc',
        mission9: 'mission9Loc',
        mission10: 'mission10Loc'
    };

    function stripEmoji(text) {
        if (!text) {
            return text;
        }
        return text
            .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
            .replace(/[\u{2600}-\u{27BF}]/gu, '')
            .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
            .replace(/[\u{200D}]/gu, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function getMissionTitle(missionData) {
        if (!missionData) {
            return '';
        }
        const key = missionData.key ? `${missionData.key}Title` : null;
        const title = key ? t(key, missionData.title || '') : (missionData.title || '');
        return stripEmoji(title);
    }

    function getMissionLocation(missionData) {
        if (!missionData) {
            return '';
        }
        const locationKey = missionData.key ? MISSION_LOCATION_KEYS[missionData.key] : null;
        const rawLocation = locationKey ? t(locationKey, missionData.locationName || '') : (missionData.locationName || '');
        return stripEmoji(rawLocation.replace(/^📍\s*/, ''));
    }

    // 初始化與自然互動功能
    function initNatureInteraction(missionData) {
        const btnNatureInteraction = document.getElementById('btn-nature-interaction');
        const qrReaderNature = document.getElementById('qr-reader-nature');
        const natureResultArea = document.getElementById('nature-result-area');

        currentMissionData = missionData || currentMissionData;

        if (!btnNatureInteraction) {
            console.warn('[nature-interaction] 按鈕元素未找到');
            return;
        }

        if (!qrReaderNature) {
            console.warn('[nature-interaction] QR reader 元素未找到');
            return;
        }

        console.log('[nature-interaction] 初始化完成，任務資料:', missionData);

        // 點擊按鈕直接開啟鏡頭掃描
        // 在按鈕點擊時預先初始化語音合成（解決手機瀏覽器需要用戶交互的限制）
        btnNatureInteraction.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[nature-interaction] 按鈕被點擊，當前掃描狀態:', isScanning);
            
            // 預先初始化語音合成（解決手機瀏覽器限制）
            if ('speechSynthesis' in window) {
                // 獲取語音列表，這會觸發語音合成的初始化
                window.speechSynthesis.getVoices();
                // 播放一個無聲的語音來「解鎖」語音合成功能
                try {
                    const testUtterance = new SpeechSynthesisUtterance('');
                    testUtterance.volume = 0;
                    window.speechSynthesis.speak(testUtterance);
                    window.speechSynthesis.cancel();
                    console.log('[nature-interaction] 語音合成已預先初始化');
                } catch (err) {
                    console.warn('[nature-interaction] 預先初始化語音合成失敗:', err);
                }
            }
            
            if (isScanning) {
                stopScanning();
            } else {
                // 直接開始掃描
                startScanning(qrReaderNature, missionData);
            }
        });

        // 關閉結果區域
        const btnCloseResult = document.getElementById('btn-close-nature-result');
        if (btnCloseResult) {
            btnCloseResult.addEventListener('click', () => {
                if (natureResultArea) {
                    natureResultArea.style.display = 'none';
                }
            });
        }
    }

    // 開始掃描 QR code
    function startScanning(qrReaderElement, missionData) {
        console.log('[nature-interaction] 開始掃描，QR reader 元素:', qrReaderElement);
        
        if (!qrReaderElement) {
            console.error('[nature-interaction] QR reader 元素未找到');
            return;
        }

        const btnNatureInteraction = document.getElementById('btn-nature-interaction');
        
        // 檢查 Html5Qrcode 是否可用
        if (typeof Html5Qrcode === 'undefined') {
            console.error('[nature-interaction] Html5Qrcode 未載入');
            alert(t('natureQrNotLoaded', 'QR code 掃描功能未載入，請重新整理頁面'));
            return;
        }

        console.log('[nature-interaction] 準備啟動相機...');
        
        isScanning = true;
        qrReaderElement.style.display = 'block';
        
        // 更新按鈕狀態
        if (btnNatureInteraction) {
            btnNatureInteraction.innerHTML = `<span>${t('natureScanInProgress', '📷 掃描中... 點擊停止')}</span>`;
            btnNatureInteraction.style.opacity = '0.8';
        }

        // 清除之前的掃描器（如果存在）
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }

        html5QrcodeScanner = new Html5Qrcode("qr-reader-nature");
        
        console.log('[nature-interaction] 啟動相機掃描...');
        
        html5QrcodeScanner.start(
            { facingMode: "environment" }, // 使用後置鏡頭
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                // QR 碼掃描成功
                console.log('[nature-interaction] 掃描成功:', decodedText);
                handleQRCodeScanned(decodedText, missionData);
            },
            (errorMessage) => {
                // 掃描錯誤（忽略，繼續掃描）
                // console.log('[nature-interaction] 掃描中...', errorMessage);
            }
        ).then(() => {
            console.log('[nature-interaction] 相機啟動成功');
        }).catch((err) => {
            console.error("[nature-interaction] 無法啟動相機:", err);
            const baseMessage = t('natureCameraError', '無法啟動相機，請確認已授予相機權限。');
            alert(`${baseMessage} ${err?.message ? `(${err.message})` : ''}`.trim());
            stopScanning();
        });
    }

    // 停止掃描
    function stopScanning() {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop().then(() => {
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
            }).catch((err) => {
                console.error("[nature-interaction] 停止掃描失敗:", err);
            });
        }

        const qrReaderNature = document.getElementById('qr-reader-nature');
        const btnNatureInteraction = document.getElementById('btn-nature-interaction');
        
        if (qrReaderNature) {
            qrReaderNature.style.display = 'none';
        }
        if (btnNatureInteraction) {
            btnNatureInteraction.innerHTML = `<span>${t('natureInteractionButton', '📷 與自然互動')}</span>`;
            btnNatureInteraction.style.opacity = '1';
        }
        
        isScanning = false;
    }

    // 處理掃描到的 QR code
    function handleQRCodeScanned(decodedText, missionData) {
        console.log('[nature-interaction] 掃描到 QR code:', decodedText);
        
        // 停止掃描
        stopScanning();

        // 解析 QR code 內容
        // 格式可能是：「與自然互動(鼓勵話)」、「與自然互動(音樂)」等
        const interactionType = parseInteractionType(decodedText);
        
        // 根據類型觸發不同動作
        switch(interactionType) {
            case '鼓勵話':
            case 'encouragement':
                handleEncouragement(missionData);
                break;
            case '音樂':
            case 'music':
                handleMusicPlayback();
                break;
            case '圖畫':
            case 'art':
                handleArtExperience(missionData);
                break;
            default:
                // 預設為鼓勵話
                handleEncouragement(missionData);
                break;
        }
    }

    // 解析互動類型
    function parseInteractionType(qrText) {
        console.log('[nature-interaction] 解析 QR code 內容:', qrText);
        
        // 匹配格式：「擺渡蘭陽英雄之旅啟動QRcode(鼓勵話)」
        const match = qrText.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            const type = match[1].trim();
            console.log('[nature-interaction] 解析到的類型:', type);
            return type;
        }
        
        // 如果沒有括號，檢查是否包含關鍵字
        if (qrText.includes('鼓勵') || qrText.includes('encouragement') || qrText.includes('鼓勵話')) {
            return '鼓勵話';
        }
        if (qrText.includes('音樂') || qrText.includes('music')) {
            return '音樂';
        }
        if (qrText.includes('圖畫') || qrText.includes('art')) {
            return '圖畫';
        }
        
        // 預設返回鼓勵話
        console.log('[nature-interaction] 使用預設類型: 鼓勵話');
        return '鼓勵話';
    }

    function triggerInteraction(interactionType, missionData = null) {
        const data = missionData || currentMissionData;
        switch (interactionType) {
            case '鼓勵話':
            case 'encouragement':
                handleEncouragement(data);
                break;
            case '音樂':
            case 'music':
                handleMusicPlayback();
                break;
            case '圖畫':
            case 'art':
                handleArtExperience(data);
                break;
            default:
                handleEncouragement(data);
                break;
        }
    }

    // 處理鼓勵話功能
    async function handleEncouragement(missionData) {
        const natureResultArea = document.getElementById('nature-result-area');
        const natureResultContent = document.getElementById('nature-result-content');
        const natureResultTitle = document.getElementById('nature-result-title');
        
        if (!natureResultArea || !natureResultContent) {
            console.error('[nature-interaction] 結果區域元素未找到');
            return;
        }

        // 不顯示載入狀態，直接生成並播放
        // 生成鼓勵話
        try {
            const encouragementText = await generateEncouragement(missionData);
            
            // 顯示結果（可選，如果需要顯示文字）
            natureResultArea.style.display = 'block';
            if (natureResultTitle) {
                natureResultTitle.textContent = t('natureEncouragementTitle', '🌿 與自然互動 - 鼓勵話');
            }
            natureResultContent.innerHTML = `
                <div class="encouragement-content">
                    <p class="encouragement-text">${encouragementText}</p>
                </div>
            `;

            // 在手機上，語音合成可能需要延遲觸發或需要用戶交互
            // 使用多種方式確保語音播放
            console.log('[nature-interaction] 準備播放語音，文字長度:', encouragementText.length);
            
            // 只播放一次，避免疊音
            speakEncouragement(encouragementText);
            
            // 提供手動重播（避免自動重複導致回音）
            if (natureResultContent) {
                const replayButton = document.createElement('button');
                replayButton.type = 'button';
                replayButton.className = 'btn-nature-interaction';
                replayButton.style.cssText = 'margin-top: 10px; width: 100%;';
                replayButton.textContent = t('natureReplay', '🔊 重新播放');
                replayButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('[nature-interaction] 手動重播語音');
                    speakEncouragement(encouragementText);
                });
                natureResultContent.appendChild(replayButton);
            }
        } catch (error) {
            console.error('[nature-interaction] 生成鼓勵話失敗:', error);
            if (natureResultArea) {
                natureResultArea.style.display = 'block';
            }
            if (natureResultContent) {
                natureResultContent.innerHTML = `<p>${t('natureEncouragementError', '生成鼓勵話時發生錯誤，請稍後再試。')}</p>`;
            }
        }
    }

    // 處理音樂播放
    function handleMusicPlayback() {
        const natureResultArea = document.getElementById('nature-result-area');
        const natureResultContent = document.getElementById('nature-result-content');
        const natureResultTitle = document.getElementById('nature-result-title');

        if (!natureResultArea || !natureResultContent) {
            console.error('[nature-interaction] 結果區域元素未找到');
            return;
        }

        // 停止語音播放，避免疊音
        try {
            window.speechSynthesis?.cancel();
        } catch (err) {
            console.warn('[nature-interaction] 停止語音失敗:', err);
        }

        if (externalAudioPlayer) {
            externalAudioPlayer.pause();
            externalAudioPlayer.src = '';
        }

        natureResultArea.style.display = 'block';
        if (natureResultTitle) {
            natureResultTitle.textContent = t('natureMusicTitle', '🎵 英雄之旅音樂');
        }

        // 顯示播放器
        natureResultContent.innerHTML = '';
        const desc = document.createElement('p');
        desc.textContent = t('natureMusicDesc', '已為你準備「擺渡蘭陽英雄之旅」音檔。');
        natureResultContent.appendChild(desc);

        const lyricsTitle = document.createElement('h5');
        lyricsTitle.style.cssText = 'margin: 12px 0 8px; font-size: 1rem;';
        lyricsTitle.textContent = t('lyrics', '📝 歌詞');
        natureResultContent.appendChild(lyricsTitle);

        const lyricsList = document.createElement('div');
        lyricsList.style.cssText = 'white-space: pre-line; line-height: 1.8;';
        const lyricKeys = [
            'lyricsVerse1Line1',
            'lyricsVerse1Line2',
            'lyricsVerse1Line3',
            'lyricsVerse1Line4',
            '',
            'lyricsChorus1Line1',
            'lyricsChorus1Line2',
            'lyricsChorus1Line3',
            'lyricsChorus1Line4',
            '',
            'lyricsVerse2Line1',
            'lyricsVerse2Line2',
            'lyricsVerse2Line3',
            'lyricsVerse2Line4',
            '',
            'lyricsVerse3Line1',
            'lyricsVerse3Line2',
            'lyricsVerse3Line3',
            'lyricsVerse3Line4',
            '',
            'lyricsChorus2Line1',
            'lyricsChorus2Line2',
            'lyricsChorus2Line3',
            'lyricsChorus2Line4',
            '',
            'lyricsVerse4Line1',
            'lyricsVerse4Line2',
            'lyricsVerse4Line3',
            'lyricsVerse4Line4',
            '',
            'lyricsOutroLine1',
            'lyricsOutroLine2',
            'lyricsOutroLine3'
        ];
        lyricsList.textContent = lyricKeys
            .map((key) => (key ? t(key, '') : ''))
            .join('\n')
            .trim();
        natureResultContent.appendChild(lyricsList);

        if (!missionMusicPlayer) {
            missionMusicPlayer = new Audio('擺渡蘭陽英雄之旅.mp3');
            missionMusicPlayer.preload = 'auto';
        } else {
            missionMusicPlayer.pause();
            missionMusicPlayer.currentTime = 0;
        }

        const playButton = document.createElement('button');
        playButton.type = 'button';
        playButton.className = 'btn-nature-interaction';
        playButton.style.cssText = 'margin-top: 10px; width: 100%;';
        playButton.textContent = t('naturePlayNow', '▶️ 立即播放');

        playButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const playPromise = missionMusicPlayer.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((err) => {
                    console.warn('[nature-interaction] 音樂播放失敗:', err);
                });
            }
        });

        natureResultContent.appendChild(playButton);

        // 嘗試自動播放（若瀏覽器允許）
        const autoPlayPromise = missionMusicPlayer.play();
        if (autoPlayPromise && typeof autoPlayPromise.catch === 'function') {
            autoPlayPromise.catch(() => {
                console.log('[nature-interaction] 自動播放被阻擋，等待使用者點擊');
            });
        }
    }

    // 處理圖畫體驗
    function handleArtExperience(missionData) {
        const natureResultArea = document.getElementById('nature-result-area');
        const natureResultContent = document.getElementById('nature-result-content');
        const natureResultTitle = document.getElementById('nature-result-title');

        if (!natureResultArea || !natureResultContent) {
            console.error('[nature-interaction] 結果區域元素未找到');
            return;
        }

        // 停止語音與音樂，避免疊音
        try {
            window.speechSynthesis?.cancel();
        } catch (err) {
            console.warn('[nature-interaction] 停止語音失敗:', err);
        }

        if (externalAudioPlayer) {
            externalAudioPlayer.pause();
            externalAudioPlayer.src = '';
        }

        if (missionMusicPlayer) {
            missionMusicPlayer.pause();
            missionMusicPlayer.currentTime = 0;
        }

        const lang = getCurrentLanguage();
        const artImages = [
            {
                src: 'images/1599985739-2673550860-g.jpg',
                labels: {
                    'zh-TW': '沙丘夕光',
                    'zh-CN': '沙丘夕光',
                    en: 'Dune Sunset',
                    ja: '砂丘の夕景',
                    ko: '모래언덕 석양'
                }
            },
            {
                src: 'images/atl_m_180013860_231.png',
                labels: {
                    'zh-TW': '海岸剪影',
                    'zh-CN': '海岸剪影',
                    en: 'Coastal Silhouette',
                    ja: '海岸のシルエット',
                    ko: '해안 실루엣'
                }
            },
            {
                src: 'images/S__46940919-scaled.jpg',
                labels: {
                    'zh-TW': '沙丘地景',
                    'zh-CN': '沙丘地景',
                    en: 'Dune Landscape',
                    ja: '砂丘の地景',
                    ko: '모래언덕 풍경'
                }
            }
        ];

        const chosenImage = artImages[Math.floor(Math.random() * artImages.length)];
        const imageLabel = chosenImage.labels[lang] || chosenImage.labels['zh-TW'];

        natureResultArea.style.display = 'block';
        if (natureResultTitle) {
            natureResultTitle.textContent = t('natureArtTitle', '🎨 與自然互動：圖畫');
        }

        natureResultContent.innerHTML = '';

        const img = document.createElement('img');
        img.src = chosenImage.src;
        img.alt = imageLabel;
        img.style.cssText = 'width: 100%; border-radius: 14px; margin-bottom: 12px; display: block;';
        natureResultContent.appendChild(img);

        const narration = generateArtNarration(missionData, imageLabel, lang);
        const textBlock = document.createElement('p');
        textBlock.textContent = narration;
        textBlock.style.cssText = 'line-height: 1.8;';
        natureResultContent.appendChild(textBlock);

        const replayButton = document.createElement('button');
        replayButton.type = 'button';
        replayButton.className = 'btn-nature-interaction';
        replayButton.style.cssText = 'margin-top: 10px; width: 100%;';
        replayButton.textContent = t('natureReplay', '🔊 再聽一次');
        replayButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            speakEncouragement(narration);
        });
        natureResultContent.appendChild(replayButton);

        speakEncouragement(narration);
    }

    // 生成圖畫體驗文字（結合圖片、地點、關別、英雄之旅）
    function generateArtNarration(missionData, imageLabel, lang) {
        const language = lang || getCurrentLanguage();
        const missionOrder = missionData?.order || 1;
        const missionTitle = getMissionTitle(missionData) || '海風中的呢喃';
        const locationName = getMissionLocation(missionData) || '蜜月灣';

        const baseByLang = {
            'zh-TW': `你現在在「${locationName}」進行「第${missionOrder}關${missionTitle}」，眼前浮現的是「${imageLabel}」。`,
            'zh-CN': `你现在在「${locationName}」进行「第${missionOrder}关${missionTitle}」，眼前浮现的是「${imageLabel}」。`,
            en: `You are at ${locationName} for Mission ${missionOrder}: ${missionTitle}. Before you is "${imageLabel}".`,
            ja: `あなたは「${locationName}」で第${missionOrder}関「${missionTitle}」を進めています。目の前に浮かぶのは「${imageLabel}」です。`,
            ko: `지금 당신은 ${locationName}에서 ${missionOrder}관 ${missionTitle}를 진행 중입니다. 눈앞에 떠오르는 것은 "${imageLabel}"입니다.`
        };

        const templatesByLang = {
            'zh-TW': [
                '這幅畫像把沙丘與海風的呼吸收進心裡，提醒你：英雄之旅不只是前進，更是與自然對話。請慢慢感受風的節奏，讓內心變得安穩而清澈。',
                '在這片地景裡，光影像是在為你指引方向。你的每一步都被大地記住，別忘了在旅途中溫柔地看見自己。',
                '畫面裡的線條像海浪也像心跳，與此刻的你同步。願你帶著這份溫暖，繼續英雄之旅的下一段。',
                '自然以最安靜的方式陪著你，沙丘的曲線像是對你的祝福。把這份平靜收藏起來，成為你前行的力量。',
                '你與這片景色彼此映照，像在彼此說一聲「辛苦了」。讓這幅畫成為你的心靈補給站。'
            ],
            'zh-CN': [
                '这幅画把沙丘与海风的呼吸收进心里，提醒你：英雄之旅不只是前进，更是与自然对话。请慢慢感受风的节奏，让内心变得安稳而清澈。',
                '在这片地景里，光影像是在为你指引方向。你的每一步都被大地记住，别忘了在旅途中温柔地看见自己。',
                '画面里的线条像海浪也像心跳，与此刻的你同步。愿你带着这份温暖，继续英雄之旅的下一段。',
                '自然以最安静的方式陪着你，沙丘的曲线像是对你的祝福。把这份平静收藏起来，成为你前行的力量。',
                '你与这片景色彼此映照，像在彼此说一声「辛苦了」。让这幅画成为你的心灵补给站。'
            ],
            en: [
                'This scene gathers the dune and sea breeze into your heart, reminding you that the hero journey is not only about moving forward, but also about listening to nature. Breathe with the wind and feel your inner calm.',
                'Light and shadow here feel like a gentle guide. Each step you take is remembered by the earth—be kind to yourself along the way.',
                'The lines in this image move like waves and heartbeat together. Carry this warmth as you continue your journey.',
                'Nature stays with you quietly; the dune curves feel like a blessing. Keep this calm as your strength for the next step.',
                'You and this landscape reflect one another, as if saying “well done.” Let this be your place to recharge.'
            ],
            ja: [
                'この風景は砂丘と海風の息づかいを心に映し、英雄の旅は前進だけでなく自然との対話でもあることを思い出させてくれます。風のリズムに身をゆだねてください。',
                'この地景の光と影は、あなたの道しるべのようです。大地はあなたの歩みを覚えています。旅の途中で自分に優しくしてください。',
                '線の流れは波や鼓動のように、いまのあなたと響き合います。この温かさを携えて次の一歩へ。',
                '自然は静かに寄り添い、砂丘の曲線は祝福のよう。静けさを力に変えて前へ進みましょう。',
                'あなたと景色は互いに映し合い、「おつかれさま」と語りかけます。この一枚を心の補給所に。'
            ],
            ko: [
                '이 장면은 모래언덕과 바닷바람의 호흡을 마음에 담아, 영웅의 여정이 전진만이 아니라 자연과의 대화임을 알려줍니다. 바람의 리듬을 천천히 느껴보세요.',
                '이곳의 빛과 그림자는 당신의 길을 비추는 안내 같습니다. 당신의 걸음은 대지에 기억됩니다. 여정에서 자신을 부드럽게 바라보세요.',
                '그림의 선은 파도와 심장박동처럼 지금의 당신과 맞닿아 있습니다. 이 따뜻함을 품고 다음 단계로 나아가세요.',
                '자연은 조용히 곁에 있고, 모래언덕의 곡선은 축복처럼 느껴집니다. 이 평온을 힘으로 삼아 앞으로 나아가세요.',
                '당신과 이 풍경은 서로를 비추며 “수고했어요”라고 말하는 듯합니다. 이 장면을 마음의 충전소로 삼으세요.'
            ]
        };

        const baseMessage = baseByLang[language] || baseByLang['zh-TW'];
        const templates = templatesByLang[language] || templatesByLang['zh-TW'];
        const template = templates[Math.floor(Math.random() * templates.length)];
        return `${baseMessage}${template}`;
    }

    // 生成鼓勵話（AI 自動生成）
    async function generateEncouragement(missionData) {
        const language = getCurrentLanguage();
        const locationName = getMissionLocation(missionData) || '蜜月灣';
        const missionTitle = getMissionTitle(missionData) || '海風中的呢喃';
        const missionOrder = missionData?.order || 1;

        const baseByLang = {
            'zh-TW': `辛苦了！你現在站在「${locationName}」進行「第${missionOrder}關${missionTitle}」。`,
            'zh-CN': `辛苦了！你现在站在「${locationName}」进行「第${missionOrder}关${missionTitle}」。`,
            en: `You are doing great. You are at ${locationName} for Mission ${missionOrder}: ${missionTitle}.`,
            ja: `おつかれさまです。あなたはいま「${locationName}」で第${missionOrder}関「${missionTitle}」にいます。`,
            ko: `수고했어요. 지금 ${locationName}에서 ${missionOrder}관 ${missionTitle}을(를) 진행하고 있어요.`
        };

        const templatesByLang = {
            'zh-TW': [
                '在這片美麗的海岸，每一陣海風都在為你加油。你已經勇敢地踏出了第一步，這份勇氣值得被讚美。讓海浪的聲音洗滌你的心靈，讓海風帶走你的疲憊。記住，每一個當下都是新的開始，你正在創造屬於自己的美好回憶。',
                '站在這裡，感受大自然的擁抱，你已經做得很好了。這片海灘見證了無數人的故事，而今天，它見證了你的勇氣與堅持。讓自己放鬆下來，深呼吸，感受這一刻的寧靜與美好。你值得擁有這份平靜與喜悅。',
                '海風輕撫著你的臉龐，彷彿在告訴你：你做得很好。在這個快節奏的世界裡，你選擇了停下腳步，與自己對話，這本身就是一種智慧。讓海浪的聲音成為你的背景音樂，讓這份寧靜成為你內心的力量。',
                '海風中帶著祝福，海浪中藏著力量。你站在這裡，已經完成了最困難的第一步。不要急著前進，先感受當下的美好。讓大自然告訴你，你比想像中更堅強，更有智慧。',
                '你與這片海岸彼此映照，像在彼此說一聲「辛苦了」。讓這一刻成為你的心靈補給站，溫柔地陪伴你走向下一段旅程。'
            ],
            'zh-CN': [
                '在这片美丽的海岸，每一阵海风都在为你加油。你已经勇敢地踏出了第一步，这份勇气值得被赞美。让海浪的声音洗涤你的心灵，让海风带走你的疲惫。记住，每一个当下都是新的开始，你正在创造属于自己的美好回忆。',
                '站在这里，感受大自然的拥抱，你已经做得很好了。这片海滩见证了无数人的故事，而今天，它见证了你的勇气与坚持。让自己放松下来，深呼吸，感受这一刻的宁静与美好。你值得拥有这份平静与喜悦。',
                '海风轻抚着你的脸庞，仿佛在告诉你：你做得很好。在这个快节奏的世界里，你选择了停下脚步，与自己对话，这本身就是一种智慧。让海浪的声音成为你的背景音乐，让这份宁静成为你内心的力量。',
                '海风中带着祝福，海浪中藏着力量。你站在这里，已经完成了最困难的第一步。不要急着前进，先感受当下的美好。让大自然告诉你，你比想象中更坚强，更有智慧。',
                '你与这片海岸彼此映照，像在彼此说一声「辛苦了」。让这一刻成为你的心灵补给站，温柔地陪伴你走向下一段旅程。'
            ],
            en: [
                'On this beautiful coast, every breeze is cheering for you. You have already taken the first brave step. Let the sound of waves wash your mind and let the sea wind carry away fatigue. Every moment is a new beginning, and you are creating your own memories.',
                'Standing here, you are already doing well. This shoreline has witnessed many stories, and today it witnesses your courage. Breathe deeply, relax, and feel the calm in this moment. You deserve this peace and joy.',
                'The sea breeze brushes your face as if whispering, “well done.” In a fast world, you chose to pause and listen to yourself. Let the waves be your background music and this quiet become your inner strength.',
                'The wind carries blessings and the waves hold strength. You have completed the hardest first step. Don’t rush forward—feel the beauty of now. Nature reminds you that you are stronger and wiser than you think.',
                'You and this coast reflect each other, as if saying “thank you for trying.” Let this moment be your gentle recharge for the next part of the journey.'
            ],
            ja: [
                'この美しい海岸では、風の一つひとつがあなたを応援しています。あなたはもう最初の一歩を踏み出しました。波の音に心を洗ってもらい、疲れを手放してください。いまこの瞬間が新しい始まりです。',
                'ここに立つあなたは、すでに十分に頑張っています。この浜辺は数えきれない物語を見守り、今日はあなたの勇気を見守っています。深呼吸して、静けさと美しさを感じましょう。',
                '海風が頬に触れ、「よくやったね」とささやいているようです。忙しい日々の中で立ち止まり、自分と対話したあなたの選択は大きな知恵です。波音をあなたの音楽に。',
                '風は祝福を運び、波は力を秘めています。あなたは最初の難関を越えました。焦らず、いまの美しさを味わってください。自然はあなたが思う以上に強いことを伝えてくれます。',
                'あなたと海岸は互いに映し合い、「おつかれさま」と言い合っているようです。この瞬間を、次の旅への優しい補給にしましょう。'
            ],
            ko: [
                '이 아름다운 해안에서 불어오는 바람 하나하나가 당신을 응원하고 있어요. 이미 첫걸음을 내디뎠습니다. 파도 소리가 마음을 씻어 주고 바람이 피로를 덜어 줍니다. 지금 이 순간이 새로운 시작이에요.',
                '여기 서 있는 당신은 이미 잘하고 있어요. 이 해변은 수많은 이야기를 보아왔고, 오늘은 당신의 용기를 보고 있습니다. 천천히 숨을 들이쉬고 이 순간의 평온을 느껴보세요.',
                '바닷바람이 얼굴을 스치며 “잘했어요”라고 말하는 듯해요. 빠른 일상 속에서 멈춰 자신과 대화한 선택은 큰 지혜입니다. 파도 소리를 배경 음악으로 삼아 보세요.',
                '바람에는 축복이, 파도에는 힘이 담겨 있어요. 당신은 이미 가장 어려운 첫걸음을 해냈습니다. 서두르지 말고 지금의 아름다움을 느껴보세요. 자연은 당신이 생각하는 것보다 더 강하다고 알려줍니다.',
                '당신과 이 해안은 서로를 비추며 “수고했어요”라고 말하는 듯합니다. 이 순간을 다음 여정으로 가는 따뜻한 충전으로 삼으세요.'
            ]
        };

        const baseMessage = baseByLang[language] || baseByLang['zh-TW'];
        const templates = templatesByLang[language] || templatesByLang['zh-TW'];
        const randomIndex = Math.floor((Date.now() + Math.random()) % templates.length);
        const encouragement = templates[randomIndex];

        const fullMessage = `${baseMessage}${encouragement}`;
        console.log('[nature-interaction] 生成的鼓勵話長度:', fullMessage.length, '字');
        return fullMessage;
    }

    // 外部 TTS（語音生成）輔助
    function splitTextForTTS(text, limit) {
        if (!text) {
            return [];
        }

        const sentences = text.match(/[^。！？!?；;，,、]+[。！？!?；;，,、]?/g) || [text];
        const parts = [];
        let buffer = '';

        sentences.forEach((sentence) => {
            if ((buffer + sentence).length <= limit) {
                buffer += sentence;
                return;
            }

            if (buffer) {
                parts.push(buffer);
                buffer = '';
            }

            if (sentence.length <= limit) {
                buffer = sentence;
                return;
            }

            for (let i = 0; i < sentence.length; i += limit) {
                parts.push(sentence.slice(i, i + limit));
            }
        });

        if (buffer) {
            parts.push(buffer);
        }

        return parts;
    }

    function buildExternalTTSUrl(text, provider, lang) {
        if (provider === 'voicerss') {
            if (!VOICERSS_API_KEY) {
                console.warn('[nature-interaction] VoiceRSS 未設定 API Key，跳過');
                return '';
            }
            const params = new URLSearchParams({
                key: VOICERSS_API_KEY,
                src: text,
                hl: getVoiceRssLang(lang),
                c: 'MP3',
                f: '44khz_16bit_stereo',
                r: '0',
                v: 'f'
            });
            return `https://api.voicerss.org/?${params.toString()}`;
        }

        if (provider === 'streamelements') {
            if (!lang || !lang.startsWith('zh')) {
                return '';
            }
            const params = new URLSearchParams({
                voice: EXTERNAL_TTS_VOICE,
                text
            });
            return `https://api.streamelements.com/kappa/v2/speech?${params.toString()}`;
        }

        const params = new URLSearchParams({
            client: 'gtx',
            tl: lang,
            q: text
        });
        return `https://translate.googleapis.com/translate_tts?${params.toString()}`;
    }

    function playExternalTTS(text) {
        const parts = splitTextForTTS(text, EXTERNAL_TTS_CHAR_LIMIT);

        if (parts.length === 0) {
            return Promise.reject(new Error('empty text'));
        }

        const ttsLang = getTtsLanguage();
        const providers = getExternalProvidersForLang(ttsLang);
        if (!providers || providers.length === 0) {
            return Promise.reject(new Error('external tts disabled for this language'));
        }
        const playbackToken = Date.now();
        lastPlaybackToken = playbackToken;

        if (externalAudioPlayer) {
            externalAudioPlayer.pause();
            externalAudioPlayer.src = '';
        }

        externalAudioPlayer = new Audio();
        externalAudioPlayer.preload = 'auto';
        externalAudioPlayer.crossOrigin = 'anonymous';

        let index = 0;
        let providerIndex = 0;

        return new Promise((resolve, reject) => {
            const tryNextProvider = () => {
                if (lastPlaybackToken !== playbackToken) {
                    return;
                }
                providerIndex += 1;
                if (providerIndex < providers.length) {
                    console.warn('[nature-interaction] 外部 TTS 來源失敗，改用:', providers[providerIndex]);
                    playPart();
                } else {
                    reject(new Error('all external tts providers failed'));
                }
            };

            const playPart = () => {
                if (lastPlaybackToken !== playbackToken) {
                    return;
                }
                const provider = providers[providerIndex];
                const url = buildExternalTTSUrl(parts[index], provider, ttsLang);
                if (!url) {
                    tryNextProvider();
                    return;
                }
                externalAudioPlayer.src = url;
                const playPromise = externalAudioPlayer.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        tryNextProvider();
                    });
                }
            };

            externalAudioPlayer.onended = () => {
                if (lastPlaybackToken !== playbackToken) {
                    return;
                }
                index += 1;
                if (index < parts.length) {
                    playPart();
                } else {
                    isPlayingAudio = false;
                    resolve();
                }
            };

            externalAudioPlayer.onerror = (event) => {
                tryNextProvider();
            };

            playPart();
        });
    }

    // 語音播放入口：優先使用外部 TTS，失敗再回退語音合成
    function speakEncouragement(text) {
        lastPlaybackToken = Date.now();
        isPlayingAudio = true;
        if (FORCE_SPEECH_SYNTHESIS_ON_IOS && isIosSafari()) {
            console.log('[nature-interaction] iOS Safari：強制使用內建語音');
            playSpeechSynthesis(text);
            return;
        }

        const ttsLang = getTtsLanguage();
        const providers = getExternalProvidersForLang(ttsLang);
        if (EXTERNAL_TTS_ENABLED && providers.length > 0) {
            console.log('[nature-interaction] 使用外部 TTS 播放');
            playExternalTTS(text)
                .catch((error) => {
                    console.warn('[nature-interaction] 外部 TTS 失敗，改用語音合成:', error);
                    playSpeechSynthesis(text);
                });
            return;
        }

        playSpeechSynthesis(text);
    }

    // 語音合成播放鼓勵話
    function playSpeechSynthesis(text) {
        if (!('speechSynthesis' in window)) {
            console.warn('[nature-interaction] 瀏覽器不支援語音合成');
            return;
        }

        try {
            const playbackToken = lastPlaybackToken;
            // 停止任何正在播放的語音
            window.speechSynthesis.cancel();
            
            // 等待一小段時間確保 cancel 完成
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                const ttsLang = getTtsLanguage();
                utterance.lang = ttsLang;
                
                // 檢測設備類型
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                // 使用更自然、柔和的語音參數
                if (isIosSafari()) {
                    utterance.rate = 0.8; // iOS Safari：更溫暖柔和
                    utterance.pitch = 1.03; // 略高更親切
                    utterance.volume = 0.93; // 稍降音量更舒服
                } else if (ttsLang && ttsLang.toLowerCase().startsWith('ko')) {
                    // 韓文語速稍慢，避免過快
                    utterance.rate = 0.8;
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;
                } else if (isMobile) {
                    utterance.rate = 0.85; // 手機版：稍慢但自然
                    utterance.pitch = 1.0; // 正常音調
                    utterance.volume = 1.0;
                } else {
                    utterance.rate = 0.9; // 桌面版：接近正常語速
                    utterance.pitch = 1.0; // 正常音調
                    utterance.volume = 1.0;
                }

                utterance.onerror = (event) => {
                    console.error('[nature-interaction] 語音合成錯誤:', event);
                    console.error('[nature-interaction] 錯誤詳情:', event.error);
                };

                utterance.onstart = () => {
                    console.log('[nature-interaction] 語音開始播放');
                };

                utterance.onend = () => {
                    if (lastPlaybackToken !== playbackToken) {
                        return;
                    }
                    console.log('[nature-interaction] 語音播放完成');
                    isPlayingAudio = false;
                };

                // 檢查語音合成是否可用
                let voices = window.speechSynthesis.getVoices();
                console.log('[nature-interaction] 可用語音數量:', voices.length);
                
                // 如果語音列表為空，等待語音載入完成
                if (voices.length === 0) {
                    console.log('[nature-interaction] 語音列表為空，等待載入...');
                    const checkVoices = () => {
                        voices = window.speechSynthesis.getVoices();
                        if (voices.length > 0) {
                            console.log('[nature-interaction] 語音列表已載入，數量:', voices.length);
                            setVoiceAndSpeak(utterance, voices);
                        } else {
                            // 如果還是空的，直接播放（使用預設語音）
                            console.warn('[nature-interaction] 語音列表仍為空，使用預設語音播放');
                            window.speechSynthesis.speak(utterance);
                        }
                    };
                    
                    // 監聽語音列表載入事件
                    window.speechSynthesis.onvoiceschanged = checkVoices;
                    
                    // 如果 onvoiceschanged 沒有觸發，等待一段時間後再試
                    setTimeout(() => {
                        checkVoices();
                    }, 500);
                } else {
                    setVoiceAndSpeak(utterance, voices);
                }
            }, 50);
        } catch (error) {
            console.error('[nature-interaction] 播放語音時發生錯誤:', error);
        }
    }

    // 設置語音並播放
    function setVoiceAndSpeak(utterance, voices) {
        const language = getCurrentLanguage();
        const ttsLang = getTtsLanguage();

        if (language && language.startsWith('zh')) {
            // 優先選擇高品質、台灣女聲的中文語音
            // 優先順序：zh-TW 女聲關鍵字 > zh-TW > zh-Hant > zh-CN > 其他中文語音
            const zhTwVoices = voices.filter(voice =>
                voice.lang === 'zh-TW' || voice.lang === 'zh-TW-TW'
            );
            const zhCnVoices = voices.filter(voice =>
                voice.lang === 'zh-CN' || voice.lang === 'zh-CN-CN'
            );
            const preferredZhVoices = language === 'zh-CN' ? zhCnVoices : zhTwVoices;

            let chineseVoice = preferredZhVoices.find(voice => {
                const name = (voice.name || '').toLowerCase();
                return TW_FEMALE_VOICE_KEYWORDS.some(keyword => name.includes(keyword.toLowerCase()));
            });

            if (!chineseVoice) {
                chineseVoice = preferredZhVoices.find(voice => voice.localService) || preferredZhVoices[0];
            }

            if (!chineseVoice) {
                chineseVoice = voices.find(voice =>
                    voice.lang && voice.lang.toLowerCase().includes('zh-hant')
                );
            }

            if (!chineseVoice) {
                chineseVoice = zhCnVoices.find(voice => voice.localService) || zhCnVoices[0];
            }

            if (!chineseVoice) {
                chineseVoice = voices.find(voice =>
                    voice.lang && voice.lang.toLowerCase().includes('zh')
                );
            }

            if (chineseVoice) {
                utterance.voice = chineseVoice;
                console.log('[nature-interaction] 使用語音:', chineseVoice.name, chineseVoice.lang);
            } else {
                console.warn('[nature-interaction] 未找到中文語音，使用預設語音');
            }
        } else {
            const targetLang = ttsLang.toLowerCase();
            const langPrefix = targetLang.split('-')[0];
            const candidates = voices.filter(voice => {
                const voiceLang = (voice.lang || '').toLowerCase();
                return voiceLang.startsWith(targetLang) || voiceLang.startsWith(langPrefix);
            });

            let selectedVoice = candidates.find(voice => voice.localService) || candidates[0];
            if (langPrefix === 'ko') {
                // 優先選擇韓文常見人聲（例如 Yuna / Korean）
                const koPreferred = candidates.find(voice => {
                    const name = (voice.name || '').toLowerCase();
                    return name.includes('yuna') || name.includes('korean') || name.includes('korea');
                });
                selectedVoice = koPreferred || selectedVoice;
            }
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log('[nature-interaction] 使用語音:', selectedVoice.name, selectedVoice.lang);
            } else {
                console.warn('[nature-interaction] 未找到對應語音，使用預設語音');
            }
        }

        // 播放語音
        try {
            window.speechSynthesis.speak(utterance);
            console.log('[nature-interaction] 已調用 speak()');
            
            // 檢查是否真的開始播放（某些瀏覽器需要用戶交互）
            setTimeout(() => {
                if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                    console.log('[nature-interaction] 語音正在播放或等待中');
                } else {
                    console.warn('[nature-interaction] 語音可能未開始播放，可能需要用戶交互');
                }
            }, 200);
        } catch (err) {
            console.error('[nature-interaction] speak() 調用失敗:', err);
        }
    }

    // 公開 API
    window.NatureInteraction = {
        init: initNatureInteraction,
        stopScanning: stopScanning,
        triggerInteraction: triggerInteraction
    };
})();

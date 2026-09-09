// 按鈕點擊效果
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // 創建漣漪效果
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // 按鈕功能（可以在這裡添加實際功能）
        const buttonText = this.querySelector('.btn-text').textContent.trim();
        console.log(`按鈕被點擊: ${buttonText}`);
        
        // 可以添加實際的導航或功能邏輯
        // 例如：window.location.href = '/adventure';
    });
});

// 英雄任務按鈕：顯示不同英雄回饋
const missionButtons = document.querySelectorAll('.mission-btn');
const heroMissionFeedback = document.getElementById('hero-mission-feedback');

const missionFeedbackMap = {
    wave: '親愛的旅人，你完成了「海風中的呢喃」任務。\n\n今天的你，願意停下腳步，讓海風把心裡的聲音帶出來，這本身就是一種勇氣。真正的英雄，不是永遠向前衝，而是敢在海邊坐下來，誠實面對自己此刻的感受。\n\n你已經踏出了第一步，無論此刻的心是平靜還是波動，都值得被好好看見。接下來，讓這份感受陪伴你，慢慢往前走。',
    rain: '親愛的旅人，你選擇了「蘭陽細雨陪伴任務」。\n\n如果你最近常覺得有點累、有點撐著，那就讓蘭陽的細雨陪你一下吧。就像雨水溫柔落在海面上，允許自己的情緒慢慢釋放，而不是硬撐到看不見海岸線。\n\n你不需要一個人扛著所有重量。讓細雨告訴你：有時候，停下來感受，比一直往前衝更需要力量。',
    dawn: '親愛的旅人，你選擇了「情人灣日出勇氣任務」。\n\n選擇這個任務的你，心裡其實已經有一小塊地方準備好迎接新的開始。就像日出前的那片暗藍，只要再多撐一會兒，天邊那條光一定會為你亮起。\n\n你內心的那份準備，就是最珍貴的種子。相信它，也相信你自己。這趟旅程，你會發現比想像中更多的可能性。'
};

missionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const missionKey = btn.getAttribute('data-mission');
        const feedback = missionFeedbackMap[missionKey];

        // 切換 active 樣式
        missionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (heroMissionFeedback && feedback) {
            heroMissionFeedback.innerHTML = `<p>${feedback.replace(/\n/g, '<br>')}</p>`;
        }
    });
});

// 添加滑鼠移動視差效果
document.addEventListener('mousemove', (e) => {
    const waves = document.querySelectorAll('.wave');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    waves.forEach((wave, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        wave.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// 添加滾動視差效果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const waves = document.querySelectorAll('.wave');
    
    waves.forEach((wave, index) => {
        const speed = (index + 1) * 0.3;
        wave.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ========== 海風中的呢喃互動功能 ==========

// 檢查瀏覽器支援
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

// 狀態管理
const whisperState = {
    isGuiding: false,
    isRecording: false,
    isListening: false,
    currentMethod: 'voice', // 'voice' or 'text'
    recognition: null,
    timerInterval: null,
    timerSeconds: 600, // 預設 10 分鐘
    audioRecorder: null,
    audioChunks: []
};

// DOM 元素
const elements = {
    btnStartGuide: document.getElementById('btn-start-guide'),
    btnStopGuide: document.getElementById('btn-stop-guide'),
    aiMessage: document.getElementById('ai-message'),
    userResponseArea: document.getElementById('user-response-area'),
    btnVoiceInput: document.getElementById('btn-voice-input'),
    btnTextInput: document.getElementById('btn-text-input'),
    voiceInputPanel: document.getElementById('voice-input-panel'),
    textInputPanel: document.getElementById('text-input-panel'),
    btnRecord: document.getElementById('btn-record'),
    recordingIndicator: document.getElementById('recording-indicator'),
    transcriptDisplay: document.getElementById('transcript-display'),
    textResponse: document.getElementById('text-response'),
    btnSubmitResponse: document.getElementById('btn-submit-response'),
    aiFeedbackArea: document.getElementById('ai-feedback-area'),
    feedbackContent: document.getElementById('feedback-content'),
    meditationTimer: document.getElementById('meditation-timer'),
    timerDisplay: document.getElementById('timer-display'),
    btnStartTimer: document.getElementById('btn-start-timer'),
    btnPauseTimer: document.getElementById('btn-pause-timer'),
    btnResetTimer: document.getElementById('btn-reset-timer'),
    timerDuration: document.getElementById('timer-duration'),
    recordingSaveArea: document.getElementById('recording-save-area'),
    btnRecordFeeling: document.getElementById('btn-record-feeling'),
    recordingStatus: document.getElementById('recording-status'),
    btnSaveNote: document.getElementById('btn-save-note'),
    btnViewNotes: document.getElementById('btn-view-notes'),
    notesModal: document.getElementById('notes-modal'),
    modalClose: document.getElementById('modal-close'),
    notesList: document.getElementById('notes-list')
};

// 初始化語音識別
function initSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn('瀏覽器不支援語音識別');
        return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        elements.transcriptDisplay.textContent = transcript;
    };
    
    recognition.onerror = (event) => {
        console.error('語音識別錯誤:', event.error);
        if (event.error === 'no-speech') {
            elements.recordingIndicator.style.display = 'none';
            whisperState.isListening = false;
        }
    };
    
    recognition.onend = () => {
        whisperState.isListening = false;
        elements.recordingIndicator.style.display = 'none';
        elements.btnRecord.textContent = '🎙️ 開始說話';
        elements.btnRecord.classList.remove('recording');
    };
    
    return recognition;
}

// AI 語音引導（支援多語言）
function speakAI(text, lang = null) {
    if (!SpeechSynthesis) {
        // 如果不支援語音合成，直接顯示文字
        updateAIMessage(text);
        return;
    }
    
    // 取得當前語言
    const currentLang = lang || (window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW');
    
    // 語言代碼對應（Speech Synthesis API 使用的格式）
    const langMap = {
        'zh-TW': 'zh-TW',
        'zh-CN': 'zh-CN',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ko': 'ko-KR'
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[currentLang] || 'zh-TW';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    // 根據語言調整語速和音調
    if (currentLang === 'en') {
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
    } else if (currentLang === 'ja') {
        utterance.rate = 0.85;
        utterance.pitch = 1.05;
    } else if (currentLang === 'ko') {
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
    }
    
    utterance.onstart = () => {
        updateAIMessage(text);
    };
    
    utterance.onend = () => {
        // 語音結束後的處理
    };
    
    speechSynthesis.speak(utterance);
}

// 更新 AI 訊息
function updateAIMessage(text) {
    elements.aiMessage.innerHTML = `<p>${text}</p>`;
}

// 開始引導
elements.btnStartGuide?.addEventListener('click', () => {
    whisperState.isGuiding = true;
    elements.btnStartGuide.style.display = 'none';
    elements.btnStopGuide.style.display = 'inline-block';
    
    // 根據當前語言取得對應的引導文字
    const currentLang = window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW';
    const guideText = window.I18n ? window.I18n.t('voiceGuideWave', currentLang) : '閉上眼睛，靜靜地聽著海浪聲。請問這些海浪聲讓你想起什麼？它像你的內心嗎？';
    
    speakAI(guideText, currentLang);
    
    // 顯示使用者回應區域（給一點時間讓旅人先沉浸）
    // 根據語言調整顯示時間（英文和日文可能需要更長時間）
    const displayDelay = currentLang === 'en' || currentLang === 'ja' ? 12000 : 8000;
    setTimeout(() => {
        elements.userResponseArea.style.display = 'block';
    }, displayDelay);
});

// 停止引導
elements.btnStopGuide?.addEventListener('click', () => {
    whisperState.isGuiding = false;
    elements.btnStartGuide.style.display = 'inline-block';
    elements.btnStopGuide.style.display = 'none';
    
    if (SpeechSynthesis) {
        speechSynthesis.cancel();
    }
    
    if (whisperState.recognition) {
        whisperState.recognition.stop();
    }
    
    elements.userResponseArea.style.display = 'none';
    elements.aiFeedbackArea.style.display = 'none';
    elements.meditationTimer.style.display = 'none';
    elements.recordingSaveArea.style.display = 'none';
});

// 切換輸入方式
elements.btnVoiceInput?.addEventListener('click', () => {
    whisperState.currentMethod = 'voice';
    elements.btnVoiceInput.classList.add('active');
    elements.btnTextInput.classList.remove('active');
    elements.voiceInputPanel.style.display = 'block';
    elements.textInputPanel.style.display = 'none';
    elements.btnSubmitResponse.style.display = 'none';
});

elements.btnTextInput?.addEventListener('click', () => {
    whisperState.currentMethod = 'text';
    elements.btnTextInput.classList.add('active');
    elements.btnVoiceInput.classList.remove('active');
    elements.voiceInputPanel.style.display = 'none';
    elements.textInputPanel.style.display = 'block';
    elements.btnSubmitResponse.style.display = 'block';
});

// 語音輸入
elements.btnRecord?.addEventListener('click', () => {
    if (!whisperState.isListening) {
        if (!whisperState.recognition) {
            whisperState.recognition = initSpeechRecognition();
            if (!whisperState.recognition) {
                alert('您的瀏覽器不支援語音識別功能');
                return;
            }
        }
        
        whisperState.isListening = true;
        whisperState.recognition.start();
        elements.recordingIndicator.style.display = 'flex';
        elements.btnRecord.textContent = '⏹️ 停止錄音';
        elements.btnRecord.classList.add('recording');
        elements.btnSubmitResponse.style.display = 'block';
    } else {
        whisperState.recognition.stop();
        whisperState.isListening = false;
        elements.recordingIndicator.style.display = 'none';
        elements.btnRecord.textContent = '🎙️ 開始說話';
        elements.btnRecord.classList.remove('recording');
    }
});

// 送出回應
elements.btnSubmitResponse?.addEventListener('click', () => {
    let userResponse = '';
    
    if (whisperState.currentMethod === 'voice') {
        userResponse = elements.transcriptDisplay.textContent.trim();
        if (!userResponse) {
            alert('請先錄製您的感受');
            return;
        }
    } else {
        userResponse = elements.textResponse.value.trim();
        if (!userResponse) {
            alert('請輸入您的感受');
            return;
        }
    }
    
    // 分析情緒並提供反饋
    const feedback = analyzeEmotionAndFeedback(userResponse);
    
    // 顯示 AI 反饋
    elements.aiFeedbackArea.style.display = 'block';
    elements.feedbackContent.innerHTML = `<p>${feedback}</p>`;
    
    // 顯示靜坐計時器
    elements.meditationTimer.style.display = 'block';
    
    // 顯示錄音與保存區域
    elements.recordingSaveArea.style.display = 'block';
    
    // 儲存回應到狀態（稍後可保存到心靈筆記）
    whisperState.currentResponse = userResponse;
    whisperState.currentEmotion = extractEmotion(userResponse);
});

// 簡單的情緒分析
function extractEmotion(text) {
    const emotions = {
        '平靜': ['平靜', '安靜', '寧靜', '祥和', '安詳'],
        '憂慮': ['擔心', '憂慮', '不安', '焦慮', '緊張'],
        '興奮': ['興奮', '激動', '開心', '快樂', '愉悅'],
        '思考': ['思考', '反思', '沉思', '探索', '疑問'],
        '悲傷': ['悲傷', '難過', '失落', '孤獨', '寂寞']
    };
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return emotion;
        }
    }
    
    return '平靜'; // 預設
}

// 分析情緒並提供反饋
function analyzeEmotionAndFeedback(text) {
    const emotion = extractEmotion(text);
    
    const feedbacks = {
        '平靜': '親愛的旅人，你找到了內心的寧靜，這是很珍貴的時刻。有時候，內心如同海浪般起伏，但它終將平靜下來。你已經學會了與自己相處，這份平靜會成為你繼續前行的力量。',
        '憂慮': '親愛的旅人，我聽見了你的憂慮。海浪有時洶湧，有時平靜，你的憂慮就像海浪一樣，會來也會去。試著像觀察海浪一樣觀察你的情緒，不抗拒也不執著。你不需要立刻解決所有問題，給自己一些時間，讓情緒自然流動。',
        '興奮': '親愛的旅人，你的興奮就像海浪拍打岸邊的活力，這份能量很珍貴。讓這份能量引導你，但也記得給自己一些平靜的時刻，就像退潮時的寧靜。在興奮與平靜之間找到平衡，你會走得更穩、更遠。',
        '思考': '親愛的旅人，思考是很好的開始。就像海浪不斷地來回，你的思緒也在探索。給自己一些時間，答案會像退潮後的貝殼一樣自然浮現。你正在為自己尋找方向，這本身就是成長的證明。',
        '悲傷': '親愛的旅人，悲傷也是情感的一部分，就像海浪有高潮也有低潮。允許自己感受這份情緒，它會像海浪一樣自然流動，最終會找到平靜。你不需要急著讓悲傷消失，讓它告訴你內心真正需要的是什麼。'
    };
    
    return feedbacks[emotion] || feedbacks['平靜'];
}

// 計時器功能
let timerInterval = null;
let timerSeconds = 600;

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    elements.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

elements.btnStartTimer?.addEventListener('click', () => {
    if (timerInterval) return;
    
    const duration = parseInt(elements.timerDuration.value);
    timerSeconds = duration;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            elements.btnStartTimer.style.display = 'inline-block';
            elements.btnPauseTimer.style.display = 'none';
            
            // 計時結束提示（多語言支援）
            if (SpeechSynthesis) {
                const currentLang = window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW';
                const timerEndText = window.I18n ? window.I18n.t('voiceTimerEnd', currentLang) : '靜坐時間結束，感謝你給自己這段時間。';
                
                const langMap = {
                    'zh-TW': 'zh-TW',
                    'zh-CN': 'zh-CN',
                    'en': 'en-US',
                    'ja': 'ja-JP',
                    'ko': 'ko-KR'
                };
                
                const utterance = new SpeechSynthesisUtterance(timerEndText);
                utterance.lang = langMap[currentLang] || 'zh-TW';
                utterance.rate = 0.9;
                speechSynthesis.speak(utterance);
                
                alert(timerEndText);
            } else {
                const currentLang = window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW';
                const timerEndText = window.I18n ? window.I18n.t('voiceTimerEnd', currentLang) : '靜坐時間結束，感謝你給自己這段時間。';
                alert(timerEndText);
            }
        }
    }, 1000);
    
    elements.btnStartTimer.style.display = 'none';
    elements.btnPauseTimer.style.display = 'inline-block';
});

elements.btnPauseTimer?.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        elements.btnStartTimer.style.display = 'inline-block';
        elements.btnPauseTimer.style.display = 'none';
    }
});

elements.btnResetTimer?.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerSeconds = parseInt(elements.timerDuration.value);
    updateTimerDisplay();
    elements.btnStartTimer.style.display = 'inline-block';
    elements.btnPauseTimer.style.display = 'none';
});

// 錄音功能
let mediaRecorder = null;
let audioChunks = [];

elements.btnRecordFeeling?.addEventListener('click', async () => {
    if (!whisperState.isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                whisperState.recordedAudio = audioBlob;
                const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
                elements.recordingStatus.textContent = t.recordingComplete || '✅ 錄音完成！可以保存至心靈筆記。';
                elements.recordingStatus.style.color = '#10B981';
            };
            
            mediaRecorder.start();
            whisperState.isRecording = true;
            const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
            elements.btnRecordFeeling.textContent = t.recordingStopped || '⏹️ 停止錄音';
            elements.recordingStatus.textContent = t.recordingInProgress || '🔴 正在錄音...';
            elements.recordingStatus.style.color = '#EF4444';
        } catch (error) {
            console.error('無法取得麥克風權限:', error);
            const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
            alert(t.microphonePermissionDenied || '無法取得麥克風權限，請檢查瀏覽器設定');
        }
    } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        whisperState.isRecording = false;
        const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
        elements.btnRecordFeeling.textContent = t.recordingStart || '🎙️ 錄下感受';
    }
});

// 保存至心靈筆記
elements.btnSaveNote?.addEventListener('click', () => {
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    const note = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-TW'),
        content: whisperState.currentResponse || (t.mindNotesNoText || '（無文字記錄）'),
        emotion: whisperState.currentEmotion || (t.mindNotesDefaultEmotion || '平靜'),
        audio: whisperState.recordedAudio ? true : false,
        timestamp: Date.now(),
        mission: 'wave'
    };
    
    // 從 localStorage 讀取現有筆記
    const notes = JSON.parse(localStorage.getItem('whisperNotes') || '[]');
    notes.unshift(note); // 新增到最前面
    localStorage.setItem('whisperNotes', JSON.stringify(notes));

    // 同步寫入 TravelerStore 的心靈筆記資料結構
    if (window.TravelerStore) {
        window.TravelerStore.recordMindNote(note);
        if (whisperState.recordedAudio && window.TravelerStore.saveNoteAudio) {
            window.TravelerStore.saveNoteAudio(note.id, whisperState.recordedAudio);
        }
    }

    let rating = '';
    if (window.EsgStats && typeof window.EsgStats.promptRating === 'function') {
        rating = window.EsgStats.promptRating() || '';
    }
    if (rating) {
        note.rating = rating;
        localStorage.setItem('whisperNotes', JSON.stringify(notes));
    }
    // 標記第一關任務為完成（如果是在 wave.html 頁面）
    if (window.location.pathname.includes('wave.html') && window.TaskProgress) {
        const completed = window.TaskProgress.completeTask('wave');
        if (completed) {
            window.TaskProgress.showTaskCompleteNotification('wave');
            // 更新 ESG 統計：完成次數 + 筆記數 + 自評分數 + 實地路程與環保點數
                if (window.EsgStats) {
                    window.EsgStats.recordMissionCompletion('wave', {
                        notesAdded: 1,
                        askRating: false,
                        rating: rating
                    });
                }
            // 更新 TravelerStore 的任務完成資料
            if (window.TravelerStore) {
                window.TravelerStore.recordMissionCompleted('wave', {
                    notesAdded: 1
                });
            }
        }
    }

    if (window.SheetSync) {
        window.SheetSync.send(note, {
            rating: rating,
            audioBlob: whisperState.recordedAudio || null
        });
    }
    
    // 使用更溫暖的提示
    const saveMessage = document.createElement('div');
    saveMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); z-index: 10000; animation: slideInRight 0.3s ease;';
    saveMessage.textContent = t.noteSaved || '✨ 已保存至心靈筆記！';
    document.body.appendChild(saveMessage);
    
    setTimeout(() => {
        saveMessage.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => saveMessage.remove(), 300);
    }, 2000);
    
    elements.recordingStatus.textContent = t.noteSavedStatus || '💾 已保存至心靈筆記';
    elements.recordingStatus.style.color = '#10B981';
});

// 查看心靈筆記
elements.btnViewNotes?.addEventListener('click', () => {
    const notes = JSON.parse(localStorage.getItem('whisperNotes') || '[]');
    
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    if (window.renderWhisperNotesList) {
        window.renderWhisperNotesList(elements.notesList);
    } else if (notes.length === 0) {
        elements.notesList.innerHTML = `<p style="text-align: center; color: #64748B; padding: 20px;">${t.mindNotesEmpty || '親愛的旅人，你的心靈筆記本還是空的。<br>完成任務後，記得把感受保存下來，這些都是你成長路上的珍貴記錄。'}</p>`;
    } else {
        elements.notesList.innerHTML = notes.map(note => `
            <div class="note-item">
                <div class="note-date">${note.date}</div>
                <div class="note-content">${note.content}</div>
                <div class="note-emotion">${t.mindNotesEmotion || '情緒：'}${note.emotion} ${note.audio ? '🎙️' : ''}</div>
            </div>
        `).join('');
    }
    
    elements.notesModal.style.display = 'block';
});

// 關閉模態視窗
elements.modalClose?.addEventListener('click', () => {
    elements.notesModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === elements.notesModal) {
        elements.notesModal.style.display = 'none';
    }
});

// 初始化計時器顯示
if (elements.timerDisplay) {
    updateTimerDisplay();
}




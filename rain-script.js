// 第二關：山風拂面任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('rain', {
            voiceGuideKey: 'voiceGuideRain',
            defaultGuideText: '感受山風輕輕拂過臉頰。你覺得這股風來自何方？在你的人生中，有什麼力量推動著你前行？'
        });
    }
    
    // 呼吸練習功能
    const btnStartBreathing = document.getElementById('btn-start-breathing');
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    const breathingExercise = document.getElementById('breathing-exercise');

    let breathingInterval = null;
    let breathingCount = 0;

    // 呼吸練習
    btnStartBreathing?.addEventListener('click', () => {
        const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
        if (breathingInterval) {
            // 停止
            clearInterval(breathingInterval);
            breathingInterval = null;
            if (breathingCircle) breathingCircle.style.animation = 'none';
            if (breathingText) breathingText.textContent = t.breathingReady || '準備開始';
            btnStartBreathing.innerHTML = `<span>${t.breathingStart || '開始呼吸練習'}</span>`;
            breathingCount = 0;
            return;
        }

        // 開始
        breathingCount = 0;
        btnStartBreathing.innerHTML = `<span>${t.breathingStop || '停止練習'}</span>`;
        if (breathingCircle) breathingCircle.style.animation = 'breathingCycle 12s ease-in-out infinite';
        
        breathingInterval = setInterval(() => {
            const cycle = breathingCount % 4;
            if (breathingText) {
                if (cycle === 0) {
                    breathingText.textContent = t.breathingInhale || '吸氣...';
                } else if (cycle === 1) {
                    breathingText.textContent = t.breathingHold || '屏息...';
                } else if (cycle === 2) {
                    breathingText.textContent = t.breathingExhale || '呼氣...';
                } else {
                    breathingText.textContent = t.breathingPause || '暫停...';
                }
            }
            breathingCount++;
        }, 3000);
    });
    
    // 當AI反饋顯示後，顯示呼吸練習
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const feedbackArea = document.getElementById('ai-feedback-area');
                if (feedbackArea && feedbackArea.style.display !== 'none' && breathingExercise) {
                    breathingExercise.style.display = 'block';
                }
            }
        });
    });
    
    const feedbackArea = document.getElementById('ai-feedback-area');
    if (feedbackArea) {
        observer.observe(feedbackArea, { attributes: true, attributeFilter: ['style'] });
    }
});


// 第三關：沙丘上的腳印任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('dawn', {
            voiceGuideKey: 'voiceGuideDawn',
            defaultGuideText: '請慢慢沿著沙丘往前走，感受腳掌踩在沙上的重量與紋理。每走一步，低頭看看自己留下的腳印，問問自己：這些腳印代表了你哪些過去？'
        });
    }
    
    const btnSaveInsights = document.getElementById('btn-save-insights');
    const dawnInsights = document.getElementById('dawn-insights');
    const journeySummary = document.getElementById('journey-summary');
    
    // 當AI反饋顯示後，顯示旅程洞見區域
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const feedbackArea = document.getElementById('ai-feedback-area');
                if (feedbackArea && feedbackArea.style.display !== 'none' && journeySummary) {
                    journeySummary.style.display = 'block';
                }
            }
        });
    });
    
    const feedbackArea = document.getElementById('ai-feedback-area');
    if (feedbackArea) {
        observer.observe(feedbackArea, { attributes: true, attributeFilter: ['style'] });
    }

    // 保存洞見
    btnSaveInsights?.addEventListener('click', () => {
        const insights = dawnInsights.value.trim();
        const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
        if (!insights) {
            alert(t.pleaseWriteInsights || '請先寫下你的旅程洞見');
            return;
        }

        // 保存到 localStorage
        const notes = JSON.parse(localStorage.getItem('whisperNotes') || '[]');
        const note = {
            id: Date.now(),
            date: new Date().toLocaleString('zh-TW'),
            content: insights,
            emotion: t.mindNotesDefaultEmotion || '平靜',
            mission: 'dawn',
            timestamp: Date.now()
        };
        notes.unshift(note);
        localStorage.setItem('whisperNotes', JSON.stringify(notes));

        if (window.SheetSync) {
            window.SheetSync.send(note);
        }

        // 同步寫入 TravelerStore 的心靈筆記資料結構
        if (window.TravelerStore) {
            window.TravelerStore.recordMindNote(note);
        }
        
        // 標記第三關任務為完成
        if (window.TaskProgress) {
            const completed = window.TaskProgress.completeTask('dawn');
            if (completed) {
                window.TaskProgress.showTaskCompleteNotification('dawn');
                // 更新 ESG 統計：完成次數 + 筆記數 + 自評分數 + 實地路程與環保點數
                if (window.EsgStats) {
                    window.EsgStats.recordMissionCompletion('dawn', {
                        notesAdded: 1,
                        askRating: true
                    });
                }
                // 更新 TravelerStore 的任務完成資料
                if (window.TravelerStore) {
                    window.TravelerStore.recordMissionCompleted('dawn', {
                        notesAdded: 1
                    });
                }
            }
        }

        // 顯示成功訊息
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); z-index: 10000; animation: slideInRight 0.3s ease;';
        successMsg.textContent = t.insightsSaved || '✨ 洞見已保存！';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    });
});


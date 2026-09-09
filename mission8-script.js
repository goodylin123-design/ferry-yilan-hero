// 第八關：河流中的倒影任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission8', {
            voiceGuideKey: 'voiceGuideMission8',
            defaultGuideText: '請站在河邊，看著水中的倒影。那是現在的你，還是過去的你？'
        });
    }
});


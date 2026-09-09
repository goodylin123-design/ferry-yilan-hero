// 第四關：大地的擁抱任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission4', {
            voiceGuideKey: 'voiceGuideMission4',
            defaultGuideText: '請找一個可以坐下的地方，讓身體放鬆。用雙手輕輕觸摸腳下的沙，感受它的溫度、質地、顆粒感。'
        });
    }
});

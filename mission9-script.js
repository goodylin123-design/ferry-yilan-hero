// 第九關：拍打海浪的節奏任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission9', {
            voiceGuideKey: 'voiceGuideMission9',
            defaultGuideText: '請跟著海浪的節奏，自由地舞動。感受自然的節奏，這節奏帶給你什麼情緒或想法？'
        });
    }
});


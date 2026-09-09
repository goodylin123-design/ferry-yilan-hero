// 第六關：風中的聲音任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission6', {
            voiceGuideKey: 'voiceGuideMission6',
            defaultGuideText: '請閉上眼睛，聽風穿過稻田的聲音。你聽到了什麼？這聲音帶給你什麼生命的聯想？'
        });
    }
});


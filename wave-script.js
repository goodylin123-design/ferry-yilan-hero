// 第一關：蜜月灣任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('wave', {
            voiceGuideKey: 'voiceGuideWave',
            defaultGuideText: '請在蜜月灣的海邊靜坐，遠眺龜山島，閉上眼睛，聽著海浪的聲音。讓海浪聲帶你進入內心深處。'
        });
    }
});

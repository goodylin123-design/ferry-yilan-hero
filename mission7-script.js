// 第七關：拾起一片落葉任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission7', {
            voiceGuideKey: 'voiceGuideMission7',
            defaultGuideText: '請撿起一片落葉，觀察它的形狀、顏色、紋理。想一想：這片葉子曾經是樹的一部分，現在它自由了。'
        });
    }
});


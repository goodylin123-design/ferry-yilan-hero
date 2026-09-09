// 第五關：星空下的祈願任務頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AI 對話系統
    if (window.AIDialogue) {
        window.AIDialogue.init('mission5', {
            voiceGuideKey: 'voiceGuideMission5',
            defaultGuideText: '請找一個可以躺下或坐下的地方，讓身體放鬆。抬頭仰望星空，給自己一分鐘的寧靜。想一想：你心中最重要的願望是什麼？'
        });
    }
});

// 英雄導覽員人格與記憶型對話模組
// 以 TaskProgress 的任務紀錄為基礎，提供有「記憶延續感」的回饋

const HERO_PROFILE = {
    name: '蘭陽擺渡者',
    role: '長期陪伴型英雄導覽員',
    style: {
        tone: '溫柔、穩定、帶一點幽微幽默',
        speed: '偏慢、留白多',
        stance: '與旅人同行，而不是在上方指揮'
    },
    keywords: ['我在這裡陪你', '慢慢來沒關係', '你已經走得比自己想像中還遠']
};

// 根據任務進度產生具有記憶延續感的主頁問候語
function getHeroGreeting(progress) {
    const completed = progress.completed || [];
    const lang = window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW';

    // 全部尚未開始
    if (completed.length === 0) {
        return window.I18n ? window.I18n.t('heroGreeting0', lang) : '嗨，第一次見面。這條海岸線很長，你不需要一次走完，只要願意踏出第一步，我會一路在這裡陪你。從蜜月灣開始，我們慢慢試著聽見自己。';
    }

    // 只完成第一關
    if (completed.length === 1 && completed.includes('wave')) {
        return window.I18n ? window.I18n.t('heroGreeting1', lang) : '還記得在蜜月灣，你曾經坐下來，讓海浪把心裡的聲音帶出來嗎？那一步其實很不簡單。接下來的路上，我會陪你在蘭陽的風雨裡，練習穩住自己的呼吸。';
    }

    // 完成前兩關（wave + rain）
    if (completed.length === 2 && completed.includes('wave') && completed.includes('rain')) {
        return window.I18n ? window.I18n.t('heroGreeting2', lang) : '你已經在蜜月灣靜坐過，也走過蘭陽的細雨。比起剛出發的自己，現在的你更懂得怎麼和情緒一起走路了。下一站，我們一起去情人灣，看一場屬於你的日出。';
    }

    // 十關都完成（暫時仍以全部完成為判斷）
    if (completed.length >= 3 && completed.includes('wave') && completed.includes('rain') && completed.includes('dawn')) {
        return window.I18n ? window.I18n.t('heroGreeting3', lang) : '三段海岸你都走過了：蜜月灣的呢喃、蘭陽的風雨、情人灣的日出。以後每次再來到這條線，只要閉上眼，你都能想起自己曾經走過的那份勇氣。我還會在這裡，等你下一次想出發的時候。';
    }

    // 其他狀況（容錯）
    return window.I18n ? window.I18n.t('heroGreetingDefault', lang) : '你已經在這條蘭陽海岸留下腳印了。無論現在走到第幾關，都可以花一點時間回頭看看：一路上的你，其實一直在長出新的自己。';
}

// 根據剛完成的任務給出延續型回饋
function getHeroCompletionFeedback(taskKey, progress) {
    const completed = progress.completed || [];
    const lang = window.I18n ? window.I18n.getCurrentLanguage() : 'zh-TW';

    if (taskKey === 'wave') {
        return window.I18n ? window.I18n.t('heroFeedbackWave', lang) : '親愛的旅人，你願意在蜜月灣坐下來，聽海浪、也聽自己的心，這已經是一種罕見的勇氣。之後無論心再怎麼起伏，都記得：你曾經給過自己這樣一段安靜的時間。下一步，我會陪你在蘭陽的細雨裡，練習在風雨中也站得穩。';
    }

    if (taskKey === 'rain') {
        return window.I18n ? window.I18n.t('heroFeedbackRain', lang) : '你剛剛在蘭陽的風雨裡，練習了如何和憂慮、疲累一起呼吸。這表示你不只是面對海岸的風景，也願意面對自己。等你準備好，我們一起去情人灣，看看當陽光慢慢升起時，你的心會長成什麼樣子。';
    }

    if (taskKey === 'dawn') {
        return window.I18n ? window.I18n.t('heroFeedbackDawn', lang) : '恭喜你走完了這三段海岸。從蜜月灣的呢喃、到細雨中的沉澱，再到情人灣的日出，你一步一步親眼見證了自己的變化。這趟旅程不會因為任務完成就結束，只要你想起這些片刻，那份勇氣就會再次被喚醒，而我也會一直記得你走過的路。';
    }

    // 預設回饋
    return window.I18n ? window.I18n.t('heroFeedbackDefault', lang) : '你完成了一段不簡單的任務。或許現在你還說不清這段路改變了什麼，但沒關係，真正的變化會慢慢在日常裡浮現。我會記得你今天走過這裡。';
}

// 在主頁顯示英雄的問候（依照任務進度）
function renderHeroGreeting() {
    if (!window.TaskProgress) return;

    const progress = window.TaskProgress.getTaskProgress();
    const message = getHeroGreeting(progress);
    const container = document.getElementById('hero-guide-message');

    if (container) {
        container.textContent = message;
    }
}

// 導出到全域，讓其他頁面也能使用
if (typeof window !== 'undefined') {
    window.HeroGuide = {
        profile: HERO_PROFILE,
        getGreeting: getHeroGreeting,
        getCompletionFeedback: getHeroCompletionFeedback,
        renderHeroGreeting
    };

    // 如果在主頁，初始化問候
    document.addEventListener('DOMContentLoaded', () => {
        // 透過是否存在 hero-guide-message 來判斷是否需要渲染
        if (document.getElementById('hero-guide-message')) {
            renderHeroGreeting();
        }
    });
    
    // 監聽語言變更事件，重新渲染英雄引導訊息
    window.addEventListener('languageChanged', () => {
        if (document.getElementById('hero-guide-message')) {
            renderHeroGreeting();
        }
    });
}



// SheetSync：把每一筆心靈筆記同步送到 Google 試算表
// 用法：saveNote() 存完 localStorage 之後呼叫 window.SheetSync.send(note)
//
// 設計重點：
// 1. 送出失敗（弱訊號、離線）不會擋住使用者操作，也不會遺失資料，
//    會先存進本機佇列，等網路恢復或下次開頁再自動補送。
// 2. 用 text/plain 當 Content-Type，避開瀏覽器對 Apps Script 的
//    CORS 預檢請求（Apps Script 對 OPTIONS 支援不完整，容易失敗）。

const SheetSync = {
    // 部署 Apps Script 後，把 /exec 結尾的網址貼在這裡
    ENDPOINT_URL: 'https://script.google.com/macros/s/AKfycbw5U3vfXT5cM_IlHFmYUFc2dph7gjKOT3MME5T1A9pPyl4vZcJID2SMTubLphCdRJKd/exec',

    QUEUE_KEY: 'sheetSyncQueue',

    isConfigured: function() {
        return !!this.ENDPOINT_URL && this.ENDPOINT_URL.indexOf('YOUR_') !== 0;
    },

    // 送出一筆筆記；失敗就排進佇列
    // extras: { rating, audioBlob }
    send: function(note, extras) {
        if (!this.isConfigured()) return;
        extras = extras || {};

        const travelerId = (window.TravelerStore && typeof window.TravelerStore.getTravelerId === 'function')
            ? window.TravelerStore.getTravelerId()
            : (function() {
                try {
                    const raw = localStorage.getItem('travelerProfile');
                    return raw ? (JSON.parse(raw).travelerId || '') : '';
                } catch (e) {
                    return '';
                }
            })();

        const hasAudio = !!(note.audio || extras.audioBlob);
        const rating = extras.rating || note.rating || '';
        const extraMarks = [];
        if (hasAudio) extraMarks.push('有錄音');
        if (rating) extraMarks.push('評分 ' + rating);

        const payload = {
            mission: note.mission || '',
            emotion: note.emotion || '',
            content: extraMarks.length
                ? ((note.content || '') + ' （' + extraMarks.join('，') + '）')
                : (note.content || ''),
            date: note.date || '',
            timestamp: note.timestamp || Date.now(),
            travelerId: travelerId,
            userAgent: navigator.userAgent,
            hasAudio: hasAudio,
            rating: rating
        };

        this._post(payload).catch(() => this._enqueue(payload));
    },

    _post: function(payload) {
        const body = JSON.stringify(payload);

        // Apps Script 網頁應用程式會先 302 到 script.googleusercontent.com。
        // 手機 Safari 用預設 cors 模式跟這個轉址時，fetch 常整段失敗，
        // doPost 沒跑到，筆記只留在 localStorage。
        // no-cors + text/plain 可避開預檢與轉址讀取，讓 POST 真的送出。
        // 回應會是 opaque（無法讀 body、也不能看 status），所以不要檢查 res.ok。
        return fetch(this.ENDPOINT_URL, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: body
        });
    },

    _enqueue: function(payload) {
        try {
            const queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
            queue.push(payload);
            localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.warn('[SheetSync] 無法寫入補送佇列:', e);
        }
    },

    // 把佇列裡還沒送出的筆記，逐筆重試
    flushQueue: function() {
        if (!this.isConfigured()) return;

        let queue;
        try {
            queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
        } catch (e) {
            queue = [];
        }
        if (queue.length === 0) return;

        const remaining = [];
        let pending = queue.length;

        queue.forEach((payload) => {
            this._post(payload)
                .catch(() => remaining.push(payload))
                .then(() => {
                    pending -= 1;
                    if (pending === 0) {
                        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(remaining));
                    }
                });
        });
    },

    init: function() {
        window.addEventListener('online', () => this.flushQueue());
        // 每次開頁也試著補送一次，涵蓋「離線關掉分頁、之後重新打開」的情況
        this.flushQueue();
    }
};

window.SheetSync = SheetSync;

document.addEventListener('DOMContentLoaded', () => {
    SheetSync.init();
});

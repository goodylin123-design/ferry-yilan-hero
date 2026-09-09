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
    send: function(note) {
        if (!this.isConfigured()) return;

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

        const payload = {
            mission: note.mission || '',
            emotion: note.emotion || '',
            content: note.content || '',
            date: note.date || '',
            timestamp: note.timestamp || Date.now(),
            travelerId: travelerId,
            userAgent: navigator.userAgent
        };

        this._post(payload).catch(() => this._enqueue(payload));
    },

    _post: function(payload) {
        return fetch(this.ENDPOINT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }).then((res) => {
            if (!res.ok) throw new Error('sheet sync failed: ' + res.status);
            return res;
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

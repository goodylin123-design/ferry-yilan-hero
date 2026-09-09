// ESG 行為與環保點數統計模組
// - 記錄：每關完成次數、心靈筆記數量、自評分數
// - 依任務路程（km）換算環保積分，可用於未來兌換 / 抵消費

const ESG_STORAGE_KEY = 'esgStats';

// 每個任務對應的實體路徑估計距離（公里）
const TASK_DISTANCE_KM = {
    wave: 1.5, // 蜜月灣體驗段
    rain: 2.5, // 壯圍沙丘步行段
    dawn: 3.0  // 情人灣日出段
};

// 1 公里換算成多少環保點數
const POINTS_PER_KM = 100;

function loadEsgStats() {
    try {
        const raw = localStorage.getItem(ESG_STORAGE_KEY);
        if (!raw) {
            return {
                missions: {
                    wave: { completedCount: 0, notesCount: 0, selfRatings: [] },
                    rain: { completedCount: 0, notesCount: 0, selfRatings: [] },
                    dawn: { completedCount: 0, notesCount: 0, selfRatings: [] }
                },
                distance: {
                    totalKm: 0,
                    sessions: []
                },
                points: {
                    total: 0,
                    history: [],
                    redeemed: []
                }
            };
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('無法解析 ESG 統計資料，將重新初始化:', e);
        return {
            missions: {
                wave: { completedCount: 0, notesCount: 0, selfRatings: [] },
                rain: { completedCount: 0, notesCount: 0, selfRatings: [] },
                dawn: { completedCount: 0, notesCount: 0, selfRatings: [] }
            },
            distance: {
                totalKm: 0,
                sessions: []
            },
            points: {
                total: 0,
                history: [],
                redeemed: []
            }
        };
    }
}

function saveEsgStats(stats) {
    try {
        localStorage.setItem(ESG_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('無法保存 ESG 統計資料:', e);
    }
}

// 檢查這次任務是否為「實地完成」，避免體驗測試模式也累積路程與環保點數
function isRealLocationSession(taskKey) {
    try {
        const raw = sessionStorage.getItem(`location_verified_${taskKey}`);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data.taskKey !== taskKey) return false;
        if (Date.now() > data.expiresAt) return false;
        // 體驗測試模式不算入實際路程
        if (data.isTestMode) return false;
        return true;
    } catch {
        return false;
    }
}

// 記錄任務完成：包含
// - 完成次數
// - 心靈筆記數量（notesAdded）
// - 自評分數（1–5，選填）
// - 若為實地完成，根據 km 累積 distance 與 points
function recordMissionCompletion(taskKey, options = {}) {
    const { notesAdded = 0, askRating = false } = options;
    const stats = loadEsgStats();

    if (!stats.missions[taskKey]) {
        stats.missions[taskKey] = { completedCount: 0, notesCount: 0, selfRatings: [] };
    }

    const missionStats = stats.missions[taskKey];
    missionStats.completedCount += 1;
    missionStats.notesCount += notesAdded;

    let rating = '';
    if (askRating) {
        const input = window.prompt('完成這一關後，你此刻的整體感受（1-5 分，5 分為非常有幫助）？', '4');
        if (input !== null) {
            const score = parseInt(input.trim(), 10);
            if (!isNaN(score) && score >= 1 && score <= 5) {
                missionStats.selfRatings.push(score);
                rating = String(score);
            }
        }
    }

    // 若為實地完成，累計路程與環保點數
    if (isRealLocationSession(taskKey)) {
        const km = TASK_DISTANCE_KM[taskKey] || 0;
        if (km > 0) {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const basePoints = km * POINTS_PER_KM;

            stats.distance.totalKm += km;
            stats.distance.sessions.push({
                date: today,
                km,
                source: 'route'
            });

            stats.points.total += basePoints;
            stats.points.history.push({
                date: today,
                type: 'distance',
                taskKey,
                km,
                points: basePoints
            });
        }
    }

    saveEsgStats(stats);
    return rating;
}

if (typeof window !== 'undefined') {
    window.EsgStats = {
        load: loadEsgStats,
        save: saveEsgStats,
        recordMissionCompletion,
        TASK_DISTANCE_KM,
        POINTS_PER_KM
    };
}



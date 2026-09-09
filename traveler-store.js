// TravelerStore：集中管理「英雄之旅互動系統」的旅人行為資料
// 可存放於 localStorage，也方便未來同步到後端

const TRAVELER_STORAGE_KEY = 'travelerProfile';

function loadTraveler() {
    try {
        const raw = localStorage.getItem(TRAVELER_STORAGE_KEY);
        if (!raw) {
            const now = new Date().toISOString();
            return {
                travelerId: `anon-${Date.now()}`,
                createdAt: now,
                lastActiveAt: now,
                profile: {
                    nickname: '蘭陽旅人',
                    homeRegion: null,
                    preferredLanguage: 'zh-TW'
                },
                journeyState: {
                    currentMission: 'wave',
                    unlockedMissions: ['wave'],
                    completedMissions: [],
                    lastCompletedMission: null,
                    heroLevel: 1,
                    totalPlaySessions: 0
                },
                missions: {
                    wave: { completedCount: 0, notesCount: 0, selfRatings: [], totalTimeMinutes: 0, lastCompletedAt: null },
                    rain: { completedCount: 0, notesCount: 0, selfRatings: [], totalTimeMinutes: 0, lastCompletedAt: null },
                    dawn: { completedCount: 0, notesCount: 0, selfRatings: [], totalTimeMinutes: 0, lastCompletedAt: null }
                },
                sessions: [],
                mindNotes: [],
                esgMetrics: {
                    distance: { totalKm: 0, sessions: [] },
                    points: { total: 0, history: [], redeemed: [] },
                    behaviorSummary: {
                        totalMissionCompletions: 0,
                        totalMindNotes: 0,
                        avgSelfRatingOverall: null
                    }
                },
                techMeta: {
                    device: { type: null, os: null, browser: null },
                    audio: { musicEnabled: true, voiceGuideEnabled: true },
                    location: { gpsSuccessCount: 0, gpsFailCount: 0, testModeUsedCount: 0 }
                }
            };
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('無法解析 travelerProfile，將重新初始化:', e);
        localStorage.removeItem(TRAVELER_STORAGE_KEY);
        return loadTraveler();
    }
}

function saveTraveler(state) {
    try {
        state.lastActiveAt = new Date().toISOString();
        localStorage.setItem(TRAVELER_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('無法保存 travelerProfile:', e);
    }
}

// 工具：重新計算整體平均自評分數
function recomputeBehaviorSummary(state) {
    const missions = state.missions || {};
    let totalCompletions = 0;
    let totalNotes = 0;
    let sumRatings = 0;
    let countRatings = 0;

    ['wave', 'rain', 'dawn'].forEach(key => {
        const m = missions[key];
        if (!m) return;
        totalCompletions += m.completedCount || 0;
        totalNotes += m.notesCount || 0;
        (m.selfRatings || []).forEach(r => {
            sumRatings += r;
            countRatings += 1;
        });
    });

    state.esgMetrics.behaviorSummary.totalMissionCompletions = totalCompletions;
    state.esgMetrics.behaviorSummary.totalMindNotes = totalNotes;
    state.esgMetrics.behaviorSummary.avgSelfRatingOverall =
        countRatings > 0 ? +(sumRatings / countRatings).toFixed(2) : null;
}

// 記錄：任務完成（由十關任務頁呼叫）
// options:
// - notesAdded: 本次新增的心靈筆記數量
// - selfRating: 如有，旅人給這次任務的 1–5 分自評
// - durationMinutes: 本次任務約莫花費時間（可以先不傳 / 未來補）
// - mode: 'onSite' / 'test' / 'remote'
// - sessionId: 若有整體 session 管理，可傳入
function recordMissionCompleted(taskKey, options = {}) {
    const {
        notesAdded = 0,
        selfRating = null,
        durationMinutes = null,
        mode = 'onSite',
        sessionId = null
    } = options;

    const state = loadTraveler();
    const now = new Date().toISOString();

    // 初始化該任務欄位
    if (!state.missions[taskKey]) {
        state.missions[taskKey] = {
            completedCount: 0,
            notesCount: 0,
            selfRatings: [],
            totalTimeMinutes: 0,
            lastCompletedAt: null
        };
    }

    const mission = state.missions[taskKey];
    mission.completedCount += 1;
    mission.notesCount += notesAdded;
    mission.lastCompletedAt = now;
    if (durationMinutes && durationMinutes > 0) {
        mission.totalTimeMinutes += durationMinutes;
    }
    if (selfRating && selfRating >= 1 && selfRating <= 5) {
        mission.selfRatings.push(selfRating);
    }

    // 更新旅程狀態
    if (!state.journeyState.completedMissions.includes(taskKey)) {
        state.journeyState.completedMissions.push(taskKey);
    }
    state.journeyState.lastCompletedMission = taskKey;

    // 若是依照順序解鎖，可以更新 currentMission / unlockedMissions
    if (window.TaskProgress && typeof window.TaskProgress.getNextTask === 'function') {
        const nextTask = window.TaskProgress.getNextTask();
        state.journeyState.currentMission = nextTask;
        if (nextTask && nextTask !== 'completed' && !state.journeyState.unlockedMissions.includes(nextTask)) {
            state.journeyState.unlockedMissions.push(nextTask);
        }
    }

    // 建立 session 紀錄（輕量版）
    const sessionRecord = {
        sessionId: sessionId || `sess-${Date.now()}`,
        mission: taskKey,
        completedAt: now,
        mode,
        durationMinutes: durationMinutes || null
    };
    state.sessions.push(sessionRecord);

    // 更新 ESG 行為摘要
    recomputeBehaviorSummary(state);

    saveTraveler(state);
}

// 記錄：新增心靈筆記（由任務頁 / 主頁查看筆記功能呼叫）
function recordMindNote(note) {
    const state = loadTraveler();

    const storedNote = {
        id: note.id || Date.now(),
        mission: note.mission || null,
        date: note.date || new Date().toLocaleString('zh-TW'),
        content: note.content || '',
        emotion: note.emotion || null,
        audio: !!note.audio,
        timestamp: note.timestamp || Date.now(),
        sessionId: note.sessionId || null,
        selfRating: note.selfRating || null
    };

    state.mindNotes.unshift(storedNote);

    // 若有指定任務，順便更新 missions.notesCount
    if (storedNote.mission && state.missions[storedNote.mission]) {
        state.missions[storedNote.mission].notesCount += 1;
    }

    recomputeBehaviorSummary(state);
    saveTraveler(state);
}

if (typeof window !== 'undefined') {
    window.TravelerStore = {
        load: loadTraveler,
        save: saveTraveler,
        recordMissionCompleted,
        recordMindNote
    };
}



// 預設音量組合
const DEFAULT_VOLUMES = {
    wave: 0.08,     // 海浪底噪
    melody: 0.32,   // 主旋律
    bass: 0.24,     // 低音
    harmony1: 0.15, // 高八度和聲
    harmony2: 0.10  // 另一層和聲
};

// 十關基礎情緒預設（每關一種基調）
const BASE_PRESET_MAP = {
    wave: {
        name: '啟程 / 海風',
        tempoScale: 1.0,
        useVibrato: false,
        harmonyInterval: 1.25, // 大三度
        volumes: { ...DEFAULT_VOLUMES },
        // 輕快啟程感
        melodyPattern: [
            { note: 0, duration: 1.4, octave: 0 },
            { note: 2, duration: 1.0, octave: 0 },
            { note: 4, duration: 1.0, octave: 0 },
            { note: 1, duration: 1.4, octave: 1 },
            { note: 0, duration: 1.0, octave: 1 },
            { note: 3, duration: 1.4, octave: 0 },
            { note: 2, duration: 1.0, octave: 1 },
            { note: 4, duration: 1.0, octave: 0 },
            { note: 1, duration: 1.0, octave: 1 },
            { note: 0, duration: 1.8, octave: 1 },
        ],
        bassPattern: [
            { note: 0, duration: 1.2 }, { note: 1, duration: 1.0 },
            { note: 0, duration: 1.0 }, { note: 2, duration: 1.2 },
            { note: 1, duration: 1.0 }, { note: 0, duration: 1.0 },
            { note: 1, duration: 1.2 }, { note: 0, duration: 1.2 }
        ]
    },
    rain: {
        name: '沉澱 / 細雨',
        tempoScale: 0.85,
        useVibrato: true,
        harmonyInterval: 1.5, // 五度，較寬鬆
        volumes: {
            ...DEFAULT_VOLUMES,
            melody: 0.26,
            bass: 0.20,
            wave: 0.10,
            harmony1: 0.12,
            harmony2: 0.08
        },
        // 緩慢下行，偏內省
        melodyPattern: [
            { note: 3, duration: 2.0, octave: 0 },
            { note: 2, duration: 1.6, octave: 0 },
            { note: 1, duration: 1.8, octave: 0 },
            { note: 0, duration: 2.2, octave: 0 },
            { note: 2, duration: 1.6, octave: 1 },
            { note: 3, duration: 1.8, octave: 0 },
            { note: 1, duration: 1.8, octave: 0 },
            { note: 0, duration: 2.5, octave: 0 },
        ],
        bassPattern: [
            { note: 0, duration: 2.0 }, { note: 1, duration: 1.6 },
            { note: 0, duration: 1.6 }, { note: 2, duration: 2.0 },
            { note: 1, duration: 1.6 }, { note: 0, duration: 1.6 },
            { note: 1, duration: 2.0 }, { note: 0, duration: 2.2 }
        ]
    },
    dawn: {
        name: '昂揚 / 曙光',
        tempoScale: 1.1,
        useVibrato: false,
        harmonyInterval: 1.26, // 近似大三度，保持明亮
        volumes: {
            ...DEFAULT_VOLUMES,
            melody: 0.34,
            bass: 0.25,
            wave: 0.09,
            harmony1: 0.16,
            harmony2: 0.11
        },
        // 上行與跳躍，帶勇氣感
        melodyPattern: [
            { note: 0, duration: 1.0, octave: 0 },
            { note: 2, duration: 0.9, octave: 0 },
            { note: 4, duration: 0.9, octave: 0 },
            { note: 1, duration: 1.1, octave: 1 },
            { note: 3, duration: 1.0, octave: 1 },
            { note: 4, duration: 1.0, octave: 1 },
            { note: 2, duration: 1.1, octave: 1 },
            { note: 0, duration: 1.2, octave: 1 },
            { note: 3, duration: 0.9, octave: 1 },
            { note: 4, duration: 0.9, octave: 1 },
            { note: 2, duration: 1.0, octave: 0 },
            { note: 0, duration: 1.8, octave: 0 },
        ],
        bassPattern: [
            { note: 0, duration: 1.1 }, { note: 1, duration: 0.9 },
            { note: 0, duration: 0.9 }, { note: 2, duration: 1.1 },
            { note: 1, duration: 0.9 }, { note: 0, duration: 0.9 },
            { note: 1, duration: 1.1 }, { note: 0, duration: 1.1 }
        ]
    }
};

// 三階段（進場 / 行動 / 完成）音樂微調
const STAGE_PRESET_MAP = {
    intro: {
        name: '進場',
        tempoScale: 0.92,
        volumes: {
            melody: 0.26,
            bass: 0.18,
            wave: 0.10,
            harmony1: 0.11,
            harmony2: 0.08
        }
    },
    action: {
        name: '行動',
        tempoScale: 1.0,
        volumes: {
            melody: 0.34,
            bass: 0.25,
            wave: 0.10,
            harmony1: 0.16,
            harmony2: 0.11
        }
    },
    complete: {
        name: '完成',
        tempoScale: 0.98,
        useVibrato: true,
        harmonyInterval: 1.5,
        volumes: {
            melody: 0.30,
            bass: 0.20,
            wave: 0.09,
            harmony1: 0.13,
            harmony2: 0.10
        }
    }
};

// 合併基礎預設與階段微調
function mergePreset(base, stage) {
    const merged = { ...base };
    merged.tempoScale = (base.tempoScale || 1) * (stage?.tempoScale || 1);
    merged.useVibrato = stage?.useVibrato ?? base.useVibrato ?? false;
    merged.harmonyInterval = stage?.harmonyInterval || base.harmonyInterval || 1.25;
    merged.volumes = {
        ...DEFAULT_VOLUMES,
        ...(base.volumes || {}),
        ...(stage?.volumes || {})
    };
    merged.melodyPattern = base.melodyPattern;
    merged.bassPattern = base.bassPattern;
    return merged;
}
// 三段情緒預設：
// intro   = 第一關：更溫柔一點的啟程版
// action  = 第二關：慢很多、接近冥想的細雨版
// complete= 完成任務後：第三關勇氣版（日出感）
const PRESET_MAP = {
    intro: {
        name: '第一關・溫柔啟程',
        // 稍微放慢節奏，整體更柔和
        tempoScale: 1.25,
        useVibrato: false,
        harmonyInterval: 1.25, // 溫柔的大三度
        volumes: {
            ...DEFAULT_VOLUMES,
            wave: 0.10,     // 海浪稍微明顯一點，讓人有被海抱著的感覺
            melody: 0.24,   // 主旋律再輕一點
            bass: 0.16,
            harmony1: 0.11,
            harmony2: 0.07
        },
        // 緩慢、帶一點上升感，但不急
        melodyPattern: [
            { note: 0, duration: 2.0, octave: 0 }, // C
            { note: 2, duration: 1.8, octave: 0 }, // E
            { note: 4, duration: 1.6, octave: 0 }, // A
            { note: 1, duration: 1.8, octave: 1 }, // D 高
            { note: 0, duration: 1.6, octave: 1 }, // C 高
            { note: 3, duration: 1.8, octave: 0 }, // G
            { note: 2, duration: 1.6, octave: 1 }, // E 高
            { note: 4, duration: 1.6, octave: 0 }, // A
            { note: 1, duration: 1.6, octave: 1 }, // D 高
            { note: 0, duration: 2.4, octave: 0 }, // 收在低 C
        ],
        bassPattern: [
            { note: 0, duration: 2.0 }, // C
            { note: 1, duration: 1.8 }, // G
            { note: 0, duration: 1.6 }, // C
            { note: 2, duration: 2.0 }, // A
            { note: 1, duration: 1.6 }, // G
            { note: 0, duration: 2.2 }, // C
        ]
    },
    action: {
        name: '第二關・細雨冥想',
        // 「慢很多，接近冥想」：大幅放慢節奏
        tempoScale: 1.8,
        useVibrato: true,           // 加一點點顫音，讓長音更空靈
        harmonyInterval: 1.25,      // 三度和聲，保持溫暖
        volumes: {
            ...DEFAULT_VOLUMES,
            wave: 0.11,             // 環境感稍高
            melody: 0.22,           // 旋律退後一點，避免干擾呼吸
            bass: 0.17,
            harmony1: 0.13,
            harmony2: 0.09
        },
        // 更長的音與停頓，營造接近冥想的流動感
        melodyPattern: [
            { note: 0, duration: 2.4, octave: 0 },
            { note: 2, duration: 2.0, octave: 0 },
            { note: 3, duration: 2.2, octave: 0 },
            { note: 4, duration: 2.4, octave: 1 },
            { note: 2, duration: 2.0, octave: 1 },
            { note: 0, duration: 2.6, octave: 0 }
        ],
        bassPattern: [
            { note: 0, duration: 2.4 },
            { note: 1, duration: 2.0 },
            { note: 0, duration: 2.0 },
            { note: 2, duration: 2.4 },
            { note: 1, duration: 2.0 },
            { note: 0, duration: 2.6 }
        ]
    },
    complete: {
        name: '第三關・日出勇氣版',
        // 稍微加快一些，讓完成時有「精神被拉起來」的感覺
        tempoScale: 0.85,
        useVibrato: false,          // 勇氣感更乾淨俐落
        harmonyInterval: 1.5,       // 五度，拉出光感
        volumes: {
            ...DEFAULT_VOLUMES,
            wave: 0.07,
            melody: 0.36,           // 主旋律更明亮
            bass: 0.24,
            harmony1: 0.18,
            harmony2: 0.13
        },
        // 比較有「往上走」的旋律線條
        melodyPattern: [
            { note: 0, duration: 2.0, octave: 0 },
            { note: 2, duration: 1.6, octave: 0 },
            { note: 4, duration: 1.6, octave: 0 },
            { note: 3, duration: 1.6, octave: 1 },
            { note: 1, duration: 1.8, octave: 1 },
            { note: 2, duration: 1.6, octave: 1 },
            { note: 0, duration: 2.4, octave: 0 },
        ],
        bassPattern: [
            { note: 0, duration: 1.8 }, // C
            { note: 1, duration: 1.6 }, // G
            { note: 0, duration: 1.6 }, // C
            { note: 2, duration: 1.8 }, // A
            { note: 1, duration: 1.6 }, // G
            { note: 0, duration: 2.2 }, // C
        ]
    }
};

class HeroMusicGenerator {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentOscillators = [];
        this.currentGainNodes = [];
        this.presetKey = 'intro'; // default: 進場
        this.preset = null;
    }

    // 設定音樂情緒預設（wave / rain / dawn）
    setPreset(presetKey) {
        const preset = PRESET_MAP[presetKey];
        if (!preset) return false;
        this.presetKey = presetKey;
        this.preset = preset;
        return true;
    }

    // 別名：依「進場/行動/完成」切換
    setStage(stageKey) {
        return this.setPreset(stageKey);
    }

    // 初始化 Audio Context
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (error) {
            console.error('無法初始化 Audio Context:', error);
            return false;
        }
    }

    // 生成海浪聲（白噪音 + 低頻濾波）
    createWaveSound(duration = 10, volume = 0.1) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // 生成海浪般的白噪音
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // 低通濾波器模擬海浪聲
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        // 音量包絡（緩慢起伏）
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        return { source, gainNode };
    }

    // 生成主旋律（依情緒預設調整節奏/模式）
    createMelody(preset) {
        // 五聲音階：C, D, E, G, A (對應 261.63, 293.66, 329.63, 392.00, 440.00 Hz)
        // 擴展到兩個八度，增加旋律豐富度
        const pentatonicScale = [
            261.63, 293.66, 329.63, 392.00, 440.00,  // 第一組
            523.25, 587.33, 659.25, 783.99, 880.00  // 第二組（高八度）
        ];
        const melody = [];

        const tempoScale = preset?.tempoScale || 1;
        const melodyPattern = (preset?.melodyPattern && preset.melodyPattern.length > 0)
            ? preset.melodyPattern
            : [
                { note: 0, duration: 1.5, octave: 0 },
                { note: 2, duration: 1, octave: 0 },
                { note: 4, duration: 1, octave: 0 },
                { note: 1, duration: 1.5, octave: 1 },
                { note: 0, duration: 1, octave: 1 },
                { note: 3, duration: 1.5, octave: 0 },
                { note: 2, duration: 1, octave: 1 },
                { note: 4, duration: 1, octave: 0 },
                { note: 1, duration: 1, octave: 1 },
                { note: 3, duration: 1, octave: 1 },
                { note: 2, duration: 1, octave: 1 },
                { note: 0, duration: 1.5, octave: 1 },
                { note: 4, duration: 1, octave: 1 },
                { note: 3, duration: 1, octave: 1 },
                { note: 2, duration: 1, octave: 0 },
                { note: 0, duration: 2, octave: 0 },
            ];

        melodyPattern.forEach(({ note, duration, octave }) => {
            const baseIndex = octave * 5; // 0 或 5
            melody.push({
                frequency: pentatonicScale[baseIndex + note],
                duration: duration * tempoScale,
                startTime: melody.length > 0 
                    ? melody[melody.length - 1].startTime + melody[melody.length - 1].duration 
                    : 0
            });
        });

        return melody;
    }

    // 生成低音伴奏（依情緒預設調整）
    createBassLine(preset) {
        // 使用 C、G、A 的低八度作為基礎
        const bassNotes = [130.81, 196.00, 220.00]; // C2, G2, A2
        const bassLine = [];

        const tempoScale = preset?.tempoScale || 1;
        const bassPattern = (preset?.bassPattern && preset.bassPattern.length > 0)
            ? preset.bassPattern
            : [
                { note: 0, duration: 1.5 },
                { note: 1, duration: 1 },
                { note: 0, duration: 1 },
                { note: 2, duration: 1.5 },
                { note: 1, duration: 1 },
                { note: 0, duration: 1 },
                { note: 1, duration: 1.5 },
                { note: 0, duration: 1.5 },
                { note: 1, duration: 1 },
                { note: 0, duration: 1.5 },
            ];

        let currentTime = 0;
        bassPattern.forEach(({ note, duration }) => {
            bassLine.push({
                frequency: bassNotes[note],
                duration: duration * tempoScale,
                startTime: currentTime
            });
            currentTime += duration * tempoScale;
        });

        return bassLine;
    }

    // 播放單個音符（改進：更柔和的音色，參考「天清宜蘭」風格）
    playNote(frequency, startTime, duration, volume = 0.3, type = 'sine', vibrato = false) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // 使用更柔和的波形（sine 或 triangle）
        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // 添加輕微的顫音（vibrato），增加宜蘭民謠的韻味
        if (vibrato && duration > 2) {
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 4; // 4 Hz 的顫音
            lfoGain.gain.value = frequency * 0.01; // 1% 的頻率變化
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.start(startTime);
            lfo.stop(startTime + duration);
            this.currentOscillators.push(lfo);
        }

        // 更柔和的音量包絡（更長的淡入淡出，營造空靈感）
        const fadeIn = Math.min(0.8, duration * 0.2);
        const fadeOut = Math.min(0.8, duration * 0.2);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + fadeIn);
        gainNode.gain.setValueAtTime(volume, startTime + duration - fadeOut);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        this.currentOscillators.push(oscillator);
        this.currentGainNodes.push(gainNode);
    }

    // 播放完整音樂
    async play() {
        if (this.isPlaying) {
            this.stop();
        }

        // 應用預設
        const preset = this.preset || PRESET_MAP[this.presetKey] || PRESET_MAP.intro;
        const volumes = preset.volumes || DEFAULT_VOLUMES;
        const harmonyInterval = preset.harmonyInterval || 1.25;
        const useVibrato = preset.useVibrato || false;

        if (!this.audioContext) {
            const initialized = await this.init();
            if (!initialized) {
                alert('無法初始化音訊系統，請確認瀏覽器支援 Web Audio API');
                return;
            }
        }

        // 如果 Audio Context 被暫停，恢復它
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.isPlaying = true;
        const startTime = this.audioContext.currentTime;

        // 播放海浪背景音（循環）
        const waveSound = this.createWaveSound(10, volumes.wave);
        waveSound.source.loop = true;
        waveSound.source.start(startTime);

        // 播放主旋律
        const melody = this.createMelody(preset);
        melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
            this.playNote(frequency, startTime + noteStart, duration, volumes.melody, 'sine', useVibrato);
        });

        // 播放低音伴奏（同步開始，營造節奏感）
        const bassLine = this.createBassLine(preset);
        bassLine.forEach(({ frequency, duration, startTime: noteStart }) => {
            this.playNote(frequency, startTime + noteStart, duration, volumes.bass, 'triangle', false);
        });

        // 第一層：高八度和聲
        melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
            if (index % 2 === 0 && duration >= 1) {
                this.playNote(frequency * 2, startTime + noteStart + 0.1, duration - 0.1, volumes.harmony1, 'sine', false);
            }
        });

        // 第二層：和聲（間隔依預設）
        melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
            if (index % 3 === 0 && duration >= 1) {
                const intervalFreq = frequency * harmonyInterval;
                this.playNote(intervalFreq, startTime + noteStart + 0.05, duration - 0.1, volumes.harmony2, 'sine', false);
            }
        });

        // 計算音樂總時長
        const totalDuration = Math.max(
            melody[melody.length - 1].startTime + melody[melody.length - 1].duration,
            bassLine[bassLine.length - 1].startTime + bassLine[bassLine.length - 1].duration
        ) + 2;

        // 音樂結束後自動循環播放（不停止）
        const loopMusic = () => {
            if (!this.isPlaying) return;

            // 清除當前的 oscillators（但保留海浪聲）
            this.currentOscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {}
            });
            this.currentOscillators = [];
            this.currentGainNodes = [];

            // 重新播放旋律和伴奏（海浪聲繼續）
            const newStartTime = this.audioContext.currentTime;
            melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
                this.playNote(frequency, newStartTime + noteStart, duration, volumes.melody, 'sine', useVibrato);
            });

            bassLine.forEach(({ frequency, duration, startTime: noteStart }) => {
                this.playNote(frequency, newStartTime + noteStart + 0.2, duration, volumes.bass, 'triangle', false);
            });

            melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
                if (index % 2 === 0 && duration >= 1) {
                    this.playNote(frequency * 2, newStartTime + noteStart + 0.2, duration - 0.2, volumes.harmony1, 'sine', false);
                }
            });

            melody.forEach(({ frequency, duration, startTime: noteStart }, index) => {
                if (index % 3 === 0 && duration >= 1) {
                    const intervalFreq = frequency * harmonyInterval;
                    this.playNote(intervalFreq, newStartTime + noteStart + 0.15, duration - 0.25, volumes.harmony2, 'sine', false);
                }
            });

            // 繼續循環
            setTimeout(loopMusic, totalDuration * 1000);
        };

        setTimeout(loopMusic, totalDuration * 1000);
    }

    // 停止播放
    stop() {
        this.isPlaying = false;
        
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        
        this.currentGainNodes.forEach(gain => {
            try {
                gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
            } catch (e) {}
        });

        this.currentOscillators = [];
        this.currentGainNodes = [];
    }

    // 生成音樂描述
    getMusicDescription() {
        return {
            title: '輕快海洋之歌 - 擺渡蘭陽',
            style: '開放版權 · 輕快海洋風格',
            mood: '輕快、活潑、療癒、海岸感',
            tempo: '中快步調（約 80-90 BPM）',
            scale: '五聲音階（C, D, E, G, A），雙八度',
            elements: [
                '海浪背景音（白噪音 + 低通濾波）',
                '主旋律（五聲音階，輕快活潑）',
                '低音伴奏（C-G-A 變化，節奏感）',
                '多層和聲（高八度 + 三度和聲）',
                '輕快節奏（適合海岸行走）'
            ],
            duration: '約 20 秒（可循環）',
            usage: '適合在任務進行時播放，營造輕快宜蘭海岸氛圍',
            copyright: '開放版權，可自由使用'
        };
    }
}

// 導出供其他腳本使用
if (typeof window !== 'undefined') {
    window.HeroMusicGenerator = HeroMusicGenerator;
}


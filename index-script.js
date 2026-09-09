// 主頁面專用腳本
document.addEventListener('DOMContentLoaded', () => {
    // QR 碼掃描功能
    const btnScanQR = document.getElementById('btn-scan-qr');
    const qrReader = document.getElementById('qr-reader');
    let html5QrcodeScanner = null;

    btnScanQR?.addEventListener('click', () => {
        if (html5QrcodeScanner) {
            // 如果已經開啟，則關閉
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
            qrReader.style.display = 'none';
            btnScanQR.textContent = '📷 掃描 QR 碼進入任務';
            return;
        }

        // 開啟 QR 碼掃描器
        qrReader.style.display = 'block';
        btnScanQR.textContent = '⏹️ 停止掃描';

        html5QrcodeScanner = new Html5Qrcode("qr-reader");
        
        html5QrcodeScanner.start(
            { facingMode: "environment" }, // 使用後置鏡頭
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                // QR 碼掃描成功
                handleQRCodeScanned(decodedText);
            },
            (errorMessage) => {
                // 掃描錯誤（忽略，繼續掃描）
            }
        ).catch((err) => {
            console.error("無法啟動相機:", err);
            alert('無法啟動相機，請確認已授予相機權限');
            qrReader.style.display = 'none';
            btnScanQR.textContent = '📷 掃描 QR 碼進入任務';
        });
    });

    function handleQRCodeScanned(decodedText) {
        // 停止掃描
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop().then(() => {
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
                qrReader.style.display = 'none';
                btnScanQR.textContent = '📷 掃描 QR 碼進入任務';
            });
        }

        // 解析 QR 碼內容並導航
        try {
            // QR 碼格式：任務頁面 URL 或任務代碼
            const taskRoutes = {
                'wave': 'wave.html',
                'rain': 'rain.html',
                'dawn': 'dawn.html',
                'mission4': 'mission4.html',
                'mission5': 'mission5.html',
                'mission6': 'mission6.html',
                'mission7': 'mission7.html',
                'mission8': 'mission8.html',
                'mission9': 'mission9.html',
                'mission10': 'mission10.html'
            };

            let foundRoute = null;
            for (const [key, route] of Object.entries(taskRoutes)) {
                if (decodedText.includes(route) || decodedText.toLowerCase() === key.toLowerCase() || decodedText === key.toUpperCase()) {
                    foundRoute = route;
                    break;
                }
            }

            if (foundRoute) {
                window.location.href = foundRoute;
            } else if (decodedText.startsWith('http')) {
                // 如果是完整 URL，直接跳轉
                window.location.href = decodedText;
            } else {
                alert('無法識別的 QR 碼，請確認這是正確的任務 QR 碼');
            }
        } catch (error) {
            console.error('QR 碼處理錯誤:', error);
            alert('QR 碼處理失敗，請重試');
        }
    }

    // 查看心靈筆記
    const btnViewNotes = document.getElementById('btn-view-notes');
    const notesModal = document.getElementById('notes-modal');
    const modalClose = document.getElementById('modal-close');
    const notesList = document.getElementById('notes-list');

    btnViewNotes?.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('whisperNotes') || '[]');
        const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
        
        if (notes.length === 0) {
            notesList.innerHTML = `<p style="text-align: center; color: #64748B; padding: 20px;">${t.mindNotesEmpty || '親愛的旅人，你的心靈筆記本還是空的。<br>完成任務後，記得把感受保存下來，這些都是你成長路上的珍貴記錄。'}</p>`;
        } else {
            notesList.innerHTML = notes.map(note => `
                <div class="note-item">
                    <div class="note-date">${note.date}</div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-emotion">${t.mindNotesEmotion || '情緒：'}${note.emotion} ${note.audio ? '🎙️' : ''}</div>
                </div>
            `).join('');
        }
        
        notesModal.style.display = 'block';
    });

    modalClose?.addEventListener('click', () => {
        notesModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === notesModal) {
            notesModal.style.display = 'none';
        }
    });

    // 旅人儀表板數據顯示
    const statMissionCount = document.getElementById('stat-mission-count');
    const statNotesCount = document.getElementById('stat-notes-count');
    const statDistanceKm = document.getElementById('stat-distance-km');
    const statEnvPoints = document.getElementById('stat-env-points');

    if (statMissionCount && statNotesCount && statDistanceKm && statEnvPoints && window.TravelerStore && window.EsgStats) {
        const traveler = window.TravelerStore.load();
        const esg = window.EsgStats.load();

        const behavior = traveler.esgMetrics?.behaviorSummary || {};
        const distance = esg.distance || { totalKm: 0 };
        const points = esg.points || { total: 0 };

        statMissionCount.textContent = behavior.totalMissionCompletions ?? 0;
        statNotesCount.textContent = behavior.totalMindNotes ?? 0;
        statDistanceKm.textContent = `${(distance.totalKm || 0).toFixed(1)} km`;
        statEnvPoints.textContent = `${points.total || 0} 點`;
    }
});


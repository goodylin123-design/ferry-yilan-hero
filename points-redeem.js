// 環保點數兌換系統
// 管理點數餘額、可兌換項目、兌換紀錄

// 可兌換項目清單（使用 i18n 翻譯）
function getRedeemItems() {
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    return [
        {
            id: 'discount-50',
            name: t.redeemItemDiscount50 || '合作店家消費折抵 50 元',
            description: t.redeemItemDiscount50Desc || '可在指定合作店家使用，折抵消費金額 50 元',
            points: 500,
            type: 'discount',
            icon: '💰'
        },
        {
            id: 'discount-100',
            name: t.redeemItemDiscount100 || '合作店家消費折抵 100 元',
            description: t.redeemItemDiscount100Desc || '可在指定合作店家使用，折抵消費金額 100 元',
            points: 1000,
            type: 'discount',
            icon: '💵'
        },
        {
            id: 'discount-200',
            name: t.redeemItemDiscount200 || '合作店家消費折抵 200 元',
            description: t.redeemItemDiscount200Desc || '可在指定合作店家使用，折抵消費金額 200 元',
            points: 2000,
            type: 'discount',
            icon: '💴'
        },
        {
            id: 'meal-voucher',
            name: t.redeemItemMealVoucher || '在地餐廳餐券',
            description: t.redeemItemMealVoucherDesc || '可在頭城、壯圍、蘇澳指定餐廳使用',
            points: 800,
            type: 'voucher',
            icon: '🍽️'
        },
        {
            id: 'museum-ticket',
            name: t.redeemItemMuseumTicket || '蘭陽博物館門票',
            description: t.redeemItemMuseumTicketDesc || '免費參觀蘭陽博物館（原價 100 元）',
            points: 1000,
            type: 'ticket',
            icon: '🎫'
        },
        {
            id: 'surf-rental',
            name: t.redeemItemSurfRental || '衝浪板租借優惠券',
            description: t.redeemItemSurfRentalDesc || '蜜月灣衝浪板租借 8 折優惠（原價 500-800 元）',
            points: 600,
            type: 'voucher',
            icon: '🏄'
        },
        {
            id: 'accommodation-discount',
            name: t.redeemItemAccommodation || '住宿折價券',
            description: t.redeemItemAccommodationDesc || '指定民宿/旅館住宿 9 折優惠',
            points: 1500,
            type: 'voucher',
            icon: '🏨'
        }
    ];
}

let currentRedeemItem = null;

// 載入點數餘額
function loadPointsBalance() {
    const traveler = window.TravelerStore?.load();
    const esgStats = window.EsgStats?.load();
    
    if (traveler && traveler.esgMetrics) {
        return traveler.esgMetrics.points.total || 0;
    } else if (esgStats && esgStats.points) {
        return esgStats.points.total || 0;
    }
    return 0;
}

// 更新點數餘額顯示
function updatePointsBalance() {
    const balance = loadPointsBalance();
    const pointsTotalEl = document.getElementById('points-total');
    if (pointsTotalEl) {
        pointsTotalEl.textContent = balance.toLocaleString();
    }
}

// 載入兌換紀錄
function loadRedeemHistory() {
    const traveler = window.TravelerStore?.load();
    const esgStats = window.EsgStats?.load();
    
    if (traveler && traveler.esgMetrics && traveler.esgMetrics.points) {
        return traveler.esgMetrics.points.redeemed || [];
    } else if (esgStats && esgStats.points) {
        return esgStats.points.redeemed || [];
    }
    return [];
}

// 顯示兌換項目
function renderRedeemItems() {
    const grid = document.getElementById('redeem-items-grid');
    if (!grid) return;
    
    const balance = loadPointsBalance();
    const REDEEM_ITEMS = getRedeemItems();
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    
    grid.innerHTML = REDEEM_ITEMS.map(item => {
        const canRedeem = balance >= item.points;
        return `
            <div class="redeem-item ${canRedeem ? '' : 'disabled'}" data-item-id="${item.id}">
                <div class="redeem-item-icon">${item.icon}</div>
                <div class="redeem-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="redeem-item-points">
                        <span class="points-required">${item.points.toLocaleString()} ${t.pointsUnit || '點'}</span>
                        ${!canRedeem ? `<span class="insufficient-points">${t.insufficientPoints || '點數不足'}</span>` : ''}
                    </div>
                </div>
                ${canRedeem ? `<button type="button" class="btn-redeem">${t.btnRedeem || '兌換'}</button>` : `<button type="button" class="btn-redeem disabled" disabled>${t.insufficientPoints || '點數不足'}</button>`}
            </div>
        `;
    }).join('');
    
    // 綁定兌換按鈕事件
    grid.querySelectorAll('.btn-redeem:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.closest('.redeem-item').dataset.itemId;
            const item = REDEEM_ITEMS.find(i => i.id === itemId);
            if (item) {
                showRedeemConfirm(item);
            }
        });
    });
}

// 顯示兌換確認對話框
function showRedeemConfirm(item) {
    const modal = document.getElementById('redeem-modal');
    const content = document.getElementById('redeem-confirm-content');
    const balance = loadPointsBalance();
    
    if (!modal || !content) return;
    
    currentRedeemItem = item;
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    
    content.innerHTML = `
        <div class="redeem-confirm-info">
            <div class="confirm-item-icon">${item.icon}</div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="confirm-points">
                <p>${t.pointsRequiredLabel || '所需點數：'}<strong>${item.points.toLocaleString()} ${t.pointsUnit || '點'}</strong></p>
                <p>${t.currentBalance || '目前餘額：'}<strong>${balance.toLocaleString()} ${t.pointsUnit || '點'}</strong></p>
                <p>${t.balanceAfterRedeem || '兌換後餘額：'}<strong>${(balance - item.points).toLocaleString()} ${t.pointsUnit || '點'}</strong></p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 執行兌換
function executeRedeem(item) {
    const balance = loadPointsBalance();
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    
    if (balance < item.points) {
        alert(t.redeemFailed || '點數不足，無法兌換');
        return false;
    }
    
    // 更新 TravelerStore
    const traveler = window.TravelerStore?.load();
    if (traveler && traveler.esgMetrics) {
        traveler.esgMetrics.points.total = Math.max(0, traveler.esgMetrics.points.total - item.points);
        if (!traveler.esgMetrics.points.redeemed) {
            traveler.esgMetrics.points.redeemed = [];
        }
        traveler.esgMetrics.points.redeemed.push({
            date: new Date().toISOString().slice(0, 10),
            itemId: item.id,
            itemName: item.name,
            points: item.points,
            timestamp: Date.now()
        });
        window.TravelerStore.save(traveler);
    }
    
    // 同步更新 EsgStats（如果存在）
    const esgStats = window.EsgStats?.load();
    if (esgStats && esgStats.points) {
        esgStats.points.total = Math.max(0, esgStats.points.total - item.points);
        if (!esgStats.points.redeemed) {
            esgStats.points.redeemed = [];
        }
        esgStats.points.redeemed.push({
            date: new Date().toISOString().slice(0, 10),
            itemId: item.id,
            itemName: item.name,
            points: item.points,
            timestamp: Date.now()
        });
        window.EsgStats.save(esgStats);
    }
    
    // 顯示成功訊息
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); z-index: 10000; animation: slideInRight 0.3s ease;';
    successMsg.textContent = `✨ ${t.redeemSuccess || '兌換成功'}！${item.name}`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successMsg.remove(), 300);
    }, 3000);
    
    // 關閉模態視窗
    const modal = document.getElementById('redeem-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 更新顯示
    updatePointsBalance();
    renderRedeemItems();
    renderRedeemHistory();
    
    return true;
}

// 顯示兌換紀錄
function renderRedeemHistory() {
    const historyList = document.getElementById('redeem-history-list');
    if (!historyList) return;
    
    const history = loadRedeemHistory();
    const REDEEM_ITEMS = getRedeemItems();
    const t = window.I18n ? window.I18n.getTranslation(window.I18n.getCurrentLanguage()) : {};
    
    if (history.length === 0) {
        historyList.innerHTML = `<p class="empty-message">${t.noRedeemHistory || '尚無兌換紀錄'}</p>`;
        return;
    }
    
    historyList.innerHTML = history
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .map(record => {
            const item = REDEEM_ITEMS.find(i => i.id === record.itemId);
            const icon = item ? item.icon : '🎁';
            const date = record.date || new Date(record.timestamp).toLocaleDateString('zh-TW');
            
            return `
                <div class="redeem-history-item">
                    <div class="history-icon">${icon}</div>
                    <div class="history-content">
                        <h4>${record.itemName || (t.redeemItemName || '兌換項目')}</h4>
                        <p>${t.redeemDate || '日期：'}${date}</p>
                        <p>${t.redeemPointsUsed || '使用點數：'}${record.points.toLocaleString()} ${t.pointsUnit || '點'}</p>
                    </div>
                </div>
            `;
        }).join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePointsBalance();
    renderRedeemItems();
    renderRedeemHistory();
    
    // 模態視窗關閉按鈕
    const modalClose = document.getElementById('modal-close-redeem');
    const modal = document.getElementById('redeem-modal');
    const btnCancel = document.getElementById('btn-cancel-redeem');
    const btnConfirm = document.getElementById('btn-confirm-redeem');
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
        }
        currentRedeemItem = null;
    }
    
    modalClose?.addEventListener('click', closeModal);
    btnCancel?.addEventListener('click', closeModal);
    
    btnConfirm?.addEventListener('click', () => {
        if (currentRedeemItem) {
            executeRedeem(currentRedeemItem);
        }
    });
    
    // 點擊模態視窗外部關閉
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 監聽語言切換事件，重新渲染兌換項目
    window.addEventListener('languageChanged', () => {
        renderRedeemItems();
        renderRedeemHistory();
        if (currentRedeemItem) {
            showRedeemConfirm(currentRedeemItem);
        }
    });
});


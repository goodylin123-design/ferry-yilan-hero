// 請整份貼到 Google 試算表「擴充功能 → Apps Script」後，
// 「部署」→「管理部署作業」→ 鉛筆 → 版本選「新版本」→ 部署（網址不要變）。
// 不需要執行任何函式，也不需要雲端硬碟權限。

const SHEET_NAME = '心靈筆記';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    const row = [
      new Date(),
      data.mission || '',
      data.travelerId || '',
      data.emotion || '',
      data.content || '',
      data.date || '',
      String(data.userAgent || '').replace(/,/g, ';'),
      data.hasAudio ? '是' : '否',
      data.rating || '',
      data.hasAudio ? '有錄音（存在手機）' : ''
    ];
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  const headers = ['收到時間', '關卡', '旅人ID', '情緒', '筆記內容', '記錄時間', '裝置資訊', '是否錄音', '評分', '錄音備註'];

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return sheet;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

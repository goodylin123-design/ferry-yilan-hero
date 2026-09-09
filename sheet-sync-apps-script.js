// 請整份貼到 Google 試算表「擴充功能 → Apps Script」後：
// 1. 上方下拉選「setupDrivePermissions」，按「執行」，允許雲端硬碟權限
// 2. 「部署」→「管理部署作業」→ 鉛筆 → 版本選「新版本」→ 部署（網址不要變）

const SHEET_NAME = '心靈筆記';
const AUDIO_FOLDER_NAME = '心靈筆記錄音';

function setupDrivePermissions() {
  const folder = getOrCreateFolder_();
  Logger.log('錄音資料夾已就緒：' + folder.getUrl());
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    let audioUrl = '';
    try {
      audioUrl = saveAudio_(data);
    } catch (audioErr) {
      audioUrl = String(audioErr);
    }

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
      audioUrl || (data.hasAudio ? '未收到音檔' : '')
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
  const headers = ['收到時間', '關卡', '旅人ID', '情緒', '筆記內容', '記錄時間', '裝置資訊', '是否錄音', '評分', '錄音連結'];

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

function saveAudio_(data) {
  if (!data.audioBase64) return '';

  const bytes = Utilities.base64Decode(data.audioBase64);
  const mime = data.audioMime || 'audio/webm';
  let ext = 'webm';
  if (mime.indexOf('mp4') !== -1 || mime.indexOf('aac') !== -1 || mime.indexOf('m4a') !== -1) {
    ext = 'm4a';
  }

  const name = (data.travelerId || 'traveler') + '_' + (data.mission || 'note') + '_' + Date.now() + '.' + ext;
  const folder = getOrCreateFolder_();
  const file = folder.createFile(Utilities.newBlob(bytes, mime, name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder_() {
  const folders = DriveApp.getFoldersByName(AUDIO_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(AUDIO_FOLDER_NAME);
}

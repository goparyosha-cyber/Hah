/**
 * Google Apps Script Backend for ProTips Service
 */

// CONFIGURATION
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Submissions';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';
const ADMIN_PASSWORD = 'admin123'; // Recommended: Change this

function doGet(e) {
  const page = e.parameter.p || 'index';
  try {
    return HtmlService.createTemplateFromFile(page)
      .evaluate()
      .setTitle('ProTips | Expert Advice')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput('Error loading page: ' + err.toString());
  }
}

function include(filename) {
  // filename will be like 'style.css' or 'script.js'
  // In GAS, these are stored as 'style.css.html' and 'script.js.html'
  return HtmlService.createHtmlOutputFromFile(filename + '.html').getContent();
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Verify admin password on server side
 */
function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

/**
 * Process new submission
 * @param {Object} data - {name, question, proof: {data, type, name}}
 */
function processSubmission(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // Set headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Question', 'Status', 'Proof URL', 'Advice']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f3f3');
  }

  // Handle proof upload if exists
  let proofUrl = '';
  if (data.proof && data.proof.data) {
    proofUrl = uploadFileToDrive(data.proof);
  }

  sheet.appendRow([
    new Date(),
    data.name,
    data.question,
    'Pending Review',
    proofUrl,
    ''
  ]);

  return { success: true };
}

/**
 * Upload file to Google Drive
 */
function uploadFileToDrive(fileObj) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const contentType = fileObj.type;
    const bytes = Utilities.base64Decode(fileObj.data);
    const blob = Utilities.newBlob(bytes, contentType, fileObj.name);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return 'Upload Failed: ' + e.message;
  }
}

/**
 * Get dashboard data for admin
 */
function getDashboardData(password) {
  if (!verifyAdminPassword(password)) {
    return { error: 'Unauthorized' };
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Only headers or empty

    data.shift(); // Remove headers

    return data.map((row, index) => {
      return {
        id: index + 2, // Row number in sheet (1-indexed, +1 for header)
        timestamp: row[0],
        name: row[1],
        question: row[2],
        status: row[3],
        proof: row[4],
        advice: row[5]
      };
    }).reverse(); // Latest first
  } catch (e) {
    return [];
  }
}

/**
 * Update submission status and reply
 */
function updateSubmission(password, rowId, status, advice) {
  if (!verifyAdminPassword(password)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    sheet.getRange(rowId, 4).setValue(status);
    sheet.getRange(rowId, 6).setValue(advice);

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

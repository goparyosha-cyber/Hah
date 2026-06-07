/**
 * Fathur APK Fixed - Backend Logic
 */

// Retrieve admin password from script properties or fallback
function getAdminPass() {
  var pass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASS');
  return pass || 'admin123'; // Default for initial setup
}

function doGet(e) {
  var page = e.parameter.p || 'Index';
  try {
    return HtmlService.createTemplateFromFile(page)
      .evaluate()
      .setTitle('Fathur APK Fixed')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  } catch (err) {
    return HtmlService.createHtmlOutput('Error: ' + err.message);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function checkLogin(username, password) {
  if (username.toLowerCase() === 'fathur' && password === getAdminPass()) {
    return true;
  }
  return false;
}

function uploadFile(base64Data, fileName, password) {
  if (password !== getAdminPass()) {
    return "Error: Unauthorized - Invalid Password";
  }
  try {
    var folderName = "Fathur Deploys";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    var contentType = base64Data.substring(5, base64Data.indexOf(';'));
    var bytes = Utilities.base64Decode(base64Data.split(',')[1]);
    var blob = Utilities.newBlob(bytes, contentType, fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return "Error: " + e.toString();
  }
}

function getComments() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName('Comments') || ss.insertSheet('Comments');
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1 && (data.length === 0 || data[0][0] === "")) return [];

    // Sort by timestamp if available (column index 2)
    return data.map(row => ({
      user: String(row[0]),
      text: String(row[1]),
      timestamp: row[2]
    }));
  } catch (e) {
    return [];
  }
}

function addComment(user, text) {
  // Ideally we would verify user identity here too
  // For now, basic sanitization or restriction could be added
  if (!user || !text) return false;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return false;
    var sheet = ss.getSheetByName('Comments') || ss.insertSheet('Comments');
    sheet.appendRow([user, text, new Date()]);
    return true;
  } catch (e) {
    return false;
  }
}

// Admin utility to set the password
function setAdminPassword(newPass) {
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASS', newPass);
}

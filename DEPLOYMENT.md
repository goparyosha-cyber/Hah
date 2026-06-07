# Deployment Instructions for ProTips Service

This project is designed to be deployed as a **Google Apps Script Web App**. Follow these steps to get your site live:

## 1. Google Sheets & Drive Setup
1.  **Create a New Google Sheet**:
    -   Copy the `Spreadsheet ID` from the URL (e.g., `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`).
    -   Open `Code.gs` and replace `YOUR_SPREADSHEET_ID_HERE` with your ID.
2.  **Create a Google Drive Folder**:
    -   Create a folder where payment proofs will be stored.
    -   Copy the `Folder ID` from the URL.
    -   Open `Code.gs` and replace `YOUR_DRIVE_FOLDER_ID_HERE` with your ID.

## 2. Google Apps Script Project
1.  Go to [script.google.com](https://script.google.com).
2.  Create a **New Project**.
3.  Add the following files exactly as named in this repository:
    -   `Code.gs` (Script)
    -   `index.html` (HTML)
    -   `admin.html` (HTML)
    -   `style` (HTML file - paste content of `style.html`)
    -   `script` (HTML file - paste content of `script.html`)

    *Note: In GAS, you create files by name without extensions. The `include()` function in `Code.gs` looks for files named 'style' and 'script'.*

## 3. Deployment
1.  Click the **Deploy** button > **New Deployment**.
2.  Select **Type**: `Web App`.
3.  **Description**: `ProTips Launch`.
4.  **Execute as**: `Me`.
5.  **Who has access**: `Anyone`.
6.  Click **Deploy** and authorize the necessary permissions (Sheets and Drive).
7.  Copy the **Web App URL**.

## 4. Finalizing
1.  Open the `script` HTML file.
2.  Find the `goToPage` function at the bottom.
3.  Replace `YOUR_SCRIPT_ID` (if manually building URLs) or rely on the dynamic `getScriptUrl` implementation already provided.

## 5. Usage
-   **Landing Page**: Open the Web App URL.
-   **Admin Dashboard**: Append `?p=admin` to the Web App URL.
-   **Default Admin Password**: `admin123` (Change this in `Code.gs`).

---
*Created by Jules - Expert Software Engineer*

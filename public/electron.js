// ------------------------------------------------------------
//
// Author: WALDO Team
// License: MPL-2.0
// Language: javascript
// File: public\electron.js
// Description:
// Electron entry point file for WALDO Desktop application
//
// Many thanks to:
// - The WALDO Team
// - Electronjs
// - electron-builder
// - electron-updater
// - electron-log
//
// Notes:
// - For development, use the following command:
//   yarn run dev
//  However, this can be a pain to debug and develop on
//  I use the following command to develop:
//
//  yarn react:build
//
//  yarn electron:start
//
//  in two terminal windows. This allows the web server to
//  be run in the background while the app is running.
// ------------------------------------------------------------

// ------------------------------------------------------------
// Dependancies
// ------------------------------------------------------------

const {
  app, BrowserWindow, globalShortcut, ipcMain,
} = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');

const { autoUpdater } = require('electron-updater');
autoUpdater.logger = require('electron-log');

autoUpdater.logger.transports.file.level = 'info';

// --------------------------------------------------------------

// --------------------------------------------------------------
// Electron Window
// --------------------------------------------------------------
function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: 'WALDO Desktop',
    minWidth: 1200,
    minHeight: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenu(null);
  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );
  // Open the DevTools.
  if (isDev) {
    globalShortcut.register('f5', () => {
      win.reload();
    });
    globalShortcut.register('CommandOrControl+R', () => {
      win.reload();
    });
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      win.webContents.openDevTools();
    });
  } else {
    autoUpdater.checkForUpdates();
  }
  win.focus();

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });
  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain.on('close-window', () => {
    app.quit();
  });
}

// --------------------------------------------------------------

// --------------------------------------------------------------
// Electron App
// --------------------------------------------------------------

// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// This method will be called when Electron has finished,
// When another instance of node-webkit is launched
// this method is called again.
// Force single application instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --------------------------------------------------------------

// ---------------------------------------------------------
// Updator Handler using electron-updater
// ---------------------------------------------------------

// Check for updates on startup using the
//  package.json file with "repository" field,
// in this case it is the GitHub repository

// On update downloaded, quit and install
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});

// ---------------------------------------------------------

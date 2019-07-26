const electron = require('electron'); // eslint-disable-line
const { app, BrowserWindow, ipcMain: ipc } = electron;
const settings = require('electron-settings');

const path = require('path');

let externalDisplay;
let configWindow = null;
let outputWindow = null;

function buildConfigWindow() {
  if (configWindow === null) {
    configWindow = new BrowserWindow({
      closable: false,
      fullscreen: false,
      height: 260,
      maxmizable: false,
      minimizable: false,
      resizable: false,
      webPreferences: { nodeIntegration: true },
      width: 160
    });

    configWindow.loadURL(`file://${path.join(__dirname, '/app/config.html')}`);

    configWindow.on('closed', () => {
      configWindow = null;
    });
  } else {
    configWindow.show();
  }

  configWindow.webContents.on('did-finish-load', () => {
    configWindow.webContents.send('loadSettings', {
      displayId: settings.get('displayId'),
      audio: settings.get('audio')
    });
  });
  // configWindow.openDevTools({ mode: 'detach' });
}

function buildOutputWindow(displayId, audio) {
  if (outputWindow === null) {
    outputWindow = new BrowserWindow({
      closable: false,
      fullscreen: false,
      height: 290,
      maxmizable: false,
      minimizable: false,
      width: 480
    });

    outputWindow.setAspectRatio(16 / 9);
    outputWindow.setBounds({
      x: configWindow.getBounds().x + configWindow.getBounds().width,
      y: configWindow.getBounds().y
    });

    outputWindow.on('closed', () => {
      outputWindow = null;
    });
  } else {
    outputWindow.show();
  }

  if (Number.isInteger(displayId)) {
    outputWindow.loadURL(
      `https://rock.barefootchurch.com/digitalsign/${displayId}?audio=${!!audio}`
    );
  }
  // outputWindow.openDevTools({ mode: 'detach' });
}

app.on('ready', () => {
  [externalDisplay] = electron.screen
    .getAllDisplays()
    .filter(display => display.bounds.x !== 0 || display.bounds.y !== 0);

  buildConfigWindow();
});

ipc.on('save', (event, displayId, audio) => {
  settings.set('displayId', displayId);
  settings.set('audio', audio);
});

ipc.on('showOutput', () => {
  buildOutputWindow(settings.get('displayId'), settings.get('audio'));
});

ipc.on('toggleFullscreen', () => {
  if (!outputWindow.isSimpleFullScreen()) {
    if (externalDisplay) {
      outputWindow.setPosition(externalDisplay.bounds.x, externalDisplay.bounds.y);
    }
    outputWindow.setSimpleFullScreen(true);
  } else {
    outputWindow.setSimpleFullScreen(false);
    outputWindow.setBounds({
      x: configWindow.getBounds().x + configWindow.getBounds().width,
      y: configWindow.getBounds().y
    });
  }
});

ipc.on('close', () => {
  app.exit();
});

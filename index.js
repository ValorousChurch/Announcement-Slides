const electron = require('electron'); // eslint-disable-line
const { app, BrowserWindow } = electron;

let outputWindow;

app.on('ready', () => {
  const [externalDisplay] = electron.screen
    .getAllDisplays()
    .filter(display => display.bounds.x !== 0 || display.bounds.y !== 0);

  outputWindow = new BrowserWindow();
  outputWindow.loadURL('https://rock.barefootchurch.com/digitalsign/30?audio=false');

  if (externalDisplay) {
    outputWindow.setPosition(externalDisplay.bounds.x, externalDisplay.bounds.y);
    outputWindow.setSimpleFullScreen(true);
  }
});

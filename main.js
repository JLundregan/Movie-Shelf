const { app, BrowserWindow } = require('electron');

//There used to be code here for a Squirrel installer, copied from
//https://ourcodeworld.com/articles/read/365/how-to-create-a-windows-installer-for-an-application-built-with-electron-framework

app.whenReady().then(() => {
  createWindow();
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin'){
    app.quit();
  }
})

function createWindow () {

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  });

  win.maximize();
  win.loadFile('client/library.html');
}

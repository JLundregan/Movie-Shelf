const { app, BrowserWindow } = require('electron');
//var Datastore = require('nedb'), db = new Datastore({ filename: './Files/data.db', autoload: true });

app.whenReady().then(() => {
  createWindow();
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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
    },
    icon: './images/icon.png'
  });

  win.maximize();
  win.loadFile('client/library.html');
  //win.webContents.openDevTools();
}

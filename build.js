//This is copied from https://ourcodeworld.com/articles/read/365/how-to-create-a-windows-installer-for-an-application-built-with-electron-framework

var electronInstaller = require('electron-winstaller');
const path = require('path');

// In this case, we can use relative paths
var settings = {
    // Specify the folder where the built app is located
    appDirectory: './MovieShelf-win32-x64',
    // Specify the existing folder where
    outputDirectory: './MovieShelf-built-installers',
    // The name of the executable of your built
    exe: './MovieShelf.exe',
    setupIcon: './images/icon.ico',
    setupExe: 'MovieShelf-Setup.exe'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);

resultPromise.then(() => {
    console.log("Successfully created installers. Enjoy!");
}, (e) => {
    console.log(`We're sory, something went wrong: ${e.message}`)
});

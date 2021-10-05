"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
//so we need to compile down from ts to js upon loading app -> adding that to package.json
function createWindow() {
    //this compiles but feels janky, how to create browserwindow as a class??
    //can do this with import which automatically transpiles down to a require statement which is sooooooo nice
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600
    });
    win.loadFile('./index.html');
}
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
//closes process if window closed and not on MacOS (keeps in dock for Mac though, as expected for Mac UX)
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});

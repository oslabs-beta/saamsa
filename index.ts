import { BrowserWindow, app } from 'electron';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as url from 'url';
//so we need to compile down from ts to js upon loading app -> adding that to package.json
function createWindow() {
  //this compiles but feels janky, how to create browserwindow as a class??
  //can do this with import which automatically transpiles down to a require statement which is sooooooo nice
  const win: BrowserWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1000,
    height: 1000,
  });
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../../index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
}

app.whenReady().then(async () => {
  const serverProcess = childProcess.fork(
    path.join(__dirname, '../server/server.js')
  );
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  //closes process if window closed and not on MacOS (keeps in dock for Mac though, as expected for Mac UX)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
    serverProcess.kill(0);
  });
});

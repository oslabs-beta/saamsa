import { BrowserWindow, app } from 'electron';
import * as childProcess from 'child_process';
import * as path from 'path';

function createWindow() {
  const win: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.loadFile('../../index.html');
}

app.whenReady().then(async () => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  //closes process if window closed and not on MacOS (keeps in dock for Mac though, as expected for Mac UX)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});

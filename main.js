const { dialog, Menu, MenuItem, ipcMain, shell } = require('electron');
const { writeFileSync, readdirSync } = require('fs');
const path = require('path');
const electron = require('electron');
const Store = require('electron-store');
const store = new Store();
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let current;

let previewTheme = store.get('theme.preview');
let editionTheme = store.get('theme.edition');

const template = [
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        role: 'open',
        accelerator: 'Cmd+O',
        click: () => {
          const files = dialog.showOpenDialog({ properties: ['openFile'] });
          if (files) {
            current = files[0];
            mainWindow.webContents.send('open', files[0]);
          }
        }
      },
      {
        label: 'Save',
        role: 'save',
        accelerator: 'Cmd+S',
        click() {
          if (current) {
            mainWindow.webContents.send('save', current);
          } else {
            const file = dialog.showSaveDialog();
            if (file) {
              current = file;
              mainWindow.webContents.send('save', file);
            }
          }
        }
      },
      {
        label: 'Save As',
        role: 'save-as',
        accelerator: 'Cmd+Shift+S',
        click: () => {
          const file = dialog.showSaveDialog();
          if (file) {
            mainWindow.webContents.send('save', file);
            current = file;
          }
        }
      },
      {
        label: 'Export as PDF',
        role: 'print',
        accelerator: 'Cmd+Shift+E',
        click() {
          const file = dialog.showSaveDialog();
          if (file) {
            mainWindow.webContents.printToPDF(
              {
                marginsType: 1,
                printBackground: true,
                pageSize: 'A4'
              },
              (err, data) => {
                writeFileSync(file, data);
              }
            );
          }
        }
      },
      { role: 'quit', label: 'Quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Snippets',
    submenu: [
      {
        label: 'Notiz',
        click: () => { 
          mainWindow.webContents.insertText("```note \n");
          mainWindow.webContents.insertText("### Eine kleine Notiz \n");
          mainWindow.webContents.insertText("Platz genug um das eine oder andere nieder zu schreiben und bei unpassender Gelegenheit vorzulesen \n");
          mainWindow.webContents.insertText("Tabellen und Listen gehen natürlich auch.");
          mainWindow.webContents.insertText("``` \n");
        }
    }
    ]
  },
  {
    label: 'Themes',
    submenu: [
      {
        label: 'Edition',
        submenu: [
          /* {
            label: '3.5e',
            checked: editionTheme === 'three-five',
            type: 'radio',
            click: () => store.set('theme.edition', 'three-five')
          }, 
          {
            label: '4e',
            checked: editionTheme === 'four',
            type: 'radio',
            click: () => store.set('theme.edition', 'four')
          },
          {
            label: '5e',
            checked: editionTheme === 'five',
            type: 'radio',
            click: () => store.set('theme.edition', 'five')
          },*/
          {
            label: 'DSA 5',
            checked: editionTheme === 'dsafive',
            type: 'radio',
            click: () => store.set('theme.edition', 'dsafive')
          },
          {
            label: 'DSA 4',
            checked: editionTheme === 'dsafour',
            type: 'radio',
            click: () => store.set('theme.edition', 'dsafour')
          },
          {
            label: 'DSA 3',
            checked: editionTheme === 'dsathree',
            type: 'radio',
            click: () => store.set('theme.edition', 'dsathree')
          },
          {
            label: 'DSA 1&2',
            checked: editionTheme === 'dsaonetwo',
            type: 'radio',
            click: () => store.set('theme.edition', 'dsaonetwo')
          },
          {
            label: 'Myranor',
            checked: editionTheme === 'myranor',
            type: 'radio',
            click: () => store.set('theme.edition', 'myranor')
          },
          {
            label: 'DSK',
            checked: editionTheme === 'dsk',
            type: 'radio',
            click: () => store.set('theme.edition', 'dsk')
          }
        ]
      },
      {
        label: 'Preview',
        submenu: [
          {
            label: 'Default',
            type: 'radio',
            checked: previewTheme === 'default',
            click: () => {
              store.set('theme.preview', 'default');
            }
          },
          /* {
            label: 'Red',
            type: 'radio',
            checked: previewTheme === 'red',
            click: () => {
              store.set('theme.preview', 'red');
            }
          },
          {
            label: 'Green',
            type: 'radio',
            checked: previewTheme === 'green',
            click: () => {
              store.set('theme.preview', 'green');
            }
          },
          {
            label: 'Blue',
            type: 'radio',
            checked: previewTheme === 'Blue',
            click: () => {
              store.set('theme.preview', 'blue');
            }
          } */
        ]
      }
    ]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }]
  }
];

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1680,
    height: 1050,
    minWidth: 1280,
    titleBarStyle: 'hidden'
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'public/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  store.onDidChange('theme.preview', newValue => {
    mainWindow.webContents.send('theme.preview', newValue);
  });

  store.onDidChange('theme.editor', newValue => {
    mainWindow.webContents.send('theme.editor', newValue);
  });

  store.onDidChange('theme.edition', newValue => {
    mainWindow.webContents.send('theme.edition', newValue);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

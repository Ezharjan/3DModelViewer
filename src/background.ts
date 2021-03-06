'use strict'
import path from 'path'
import { app, protocol, BrowserWindow, Menu, MenuItem, remote } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      preload: path.join(__dirname, 'preload.js'),
      // devTools: false//在这里直接关闭之后用户以后再也打开devTools
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow();
  // let _win = new BrowserWindow()
  win.webContents.closeDevTools();//通过这种方式在发布之后关闭decTool,用户可以自行打开
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

//Type your code here if you want


//Create database here in the main process
var NeDB = require('nedb');
var db = new NeDB({
  filename: './user.db',
  autoload: true,
});

const globalAny: any = global;
globalAny.myDB = db;


/**
 * 构建TCP服务端
 */

/* 引入net模块 */
import * as TCP from "net"


/* 创建TCP服务端 */
const tcp = TCP.createServer((socket: TCP.Socket) => {

  const buffer: Buffer = new Buffer('I am a server.', 'utf-8');
  console.log('Connected with: ' +
    socket.remoteAddress + ' : ' + socket.remotePort + ' \n');
  /* 向客户端发送数据 */
  socket.write(buffer);

  /* 监听客户端传来的data数据 */
  socket.on('data', function (data) {
    console.log('Data received is: ' + socket.remoteAddress + ': ' + data + '. \n');
    /* 回发该数据，客户端将收到来自服务端的数据*/
    socket.write('echo---Client said "' + data + '"');
  });
});

globalAny.myServer = tcp;

// /* 启动监听 */
// tcp.listen(4000, () => {
//   console.log('listening... \n');
// });


import { readFileSync } from "fs";
import { Console } from 'console'

const objFileContent = function ReadFileSync(filePath: string) {
  readFileSync(filePath);
}
// readFileSync("D:/Trashes/Boy.obj");
// const objFileContent = readFileSync("D:/4-th_Grade/3DModelViewer/src/assets/tree.obj");
globalAny.objFileContent = objFileContent;



// import { inputFunction } from "./components/Browser.vue";
// import Browser from "./components/Browser.vue";


// const t = remote.getGlobal("getInputFunction");

//设置窗口界面菜单的方式

var menu = new Menu();
menu.append(new MenuItem({
  label: 'File',
  submenu: [
    {
      label: "Import",
      click: () => {
        console.log("Import clicked!");
      },
      accelerator: (function () {
        if (process.platform == 'darwin')
          return 'Command+O';
        else
          return 'Ctrl+O';
      })(),
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: (function () {
        if (process.platform == 'darwin')
          return 'Alt+Command+I';
        else
          return 'Ctrl+Shift+I';
      })(),
      click: function (item, focusedWindow: any) {
        if (focusedWindow) focusedWindow.toggleDevTools();
      }
    }
  ],
  click: function () {
    console.log('item 1 clicked');
  }
}));


Menu.setApplicationMenu(menu);//This must be called!


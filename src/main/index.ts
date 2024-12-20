import { app, shell, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  startWatching,
  initializeIpcHandlers,
  stopWatching
} from '@/main/clipboard/clipboard-manager'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false, // 初始不显示
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false, // 禁用 nodeIntegration
      webSecurity: true
    }
  })

  // 等待页面加载完成后再显示窗口
  mainWindow.on('ready-to-show', () => {
    console.log('Window ready to show')
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      // 初始化剪贴板监听
      startWatching(mainWindow)
    }
  })

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    stopWatching()
    mainWindow = null
  })

  // 监听加载事件
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Page started loading')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading')
  })

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready')
  })

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    // 尝试重新加载
    if (mainWindow && !mainWindow.isDestroyed()) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
          } else {
            mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
          }
        }
      }, 1000)
    }
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Loading dev URL:', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    console.log('Loading production file')
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 应用程序生命周期管理
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化 IPC 处理程序
  initializeIpcHandlers()
  
  createWindow()
  registerShortcuts()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopWatching()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 注册全局快捷键
function registerShortcuts(): void {
  // Command+Shift+V 显示/隐藏窗口
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow()
      return
    }

    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // 添加开发者工具快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools()
    } else {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })
}

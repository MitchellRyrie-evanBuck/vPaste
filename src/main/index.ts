import { app, shell, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  startWatching,
  initializeIpcHandlers,
  stopWatching
} from '@/main/clipboard/clipboard-manager'

let mainWindow: BrowserWindow | null = null
let previouslyFocusedWindow: number | null = null

function createWindow(): void {
  // 获取屏幕尺寸（包括Dock区域）
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().bounds

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: 400,
    x: 0,
    y: screenHeight + 400, // 初始位置在屏幕下方
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: false,
    resizable: false,
    useContentSize: true,
    transparent: true,
    hasShadow: true,
    vibrancy: 'under-window', // 添加系统级模糊效果
    visualEffectState: 'active',
    backgroundColor: '#00ffffff', // 完全透明的背景色
    type: 'dock', // 设置窗口类型为 dock
    focusable: true, // 确保窗口可以获得焦点
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  // 设置窗口层级
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  if (process.platform === 'darwin') {
    mainWindow.setAlwaysOnTop(true, 'screen-saver') // 使用最高层级
  }

  // 等待页面加载完成后再显示窗口
  mainWindow.on('ready-to-show', () => {
    console.log('Window ready to show')
    if (mainWindow && !mainWindow.isDestroyed()) {
      // mainWindow.show()
      // mainWindow.focus() // 确保窗口获得焦点
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

// 显示窗口并保存当前焦点
function showWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // 保存当前焦点窗口
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow && focusedWindow !== mainWindow) {
      previouslyFocusedWindow = focusedWindow.id
    }
    const { height: screenHeight } = screen.getPrimaryDisplay().bounds

    // 显示窗口
    mainWindow.show()
    mainWindow.focus()

    // 动画显示窗口
    const targetY = screenHeight - 400 // 目标位置
    const startY = screenHeight + 400 // 起始位置
    const steps = 20 // 动画步数
    const stepSize = (startY - targetY) / steps

    mainWindow.setPosition(0, startY)
    let currentStep = 0

    const animate = () => {
      currentStep++
      const newY = startY - (stepSize * currentStep)
      mainWindow && mainWindow.setPosition(0, Math.round(newY))

      if (currentStep < steps) {
        setTimeout(animate, 10)
      }
    }

    animate()
  }
}

// 隐藏窗口并恢复焦点
function hideWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const { height: screenHeight } = screen.getPrimaryDisplay().bounds
    const startY = mainWindow.getPosition()[1]
    const targetY = screenHeight + 400 // 目标位置在屏幕下方
    const steps = 20
    const stepSize = (targetY - startY) / steps

    let currentStep = 0

    const animate = () => {
      currentStep++
      const newY = startY + (stepSize * currentStep)
      mainWindow && mainWindow.setPosition(0, Math.round(newY))

      if (currentStep < steps) {
        setTimeout(animate, 10)
      } else {
        mainWindow && mainWindow.hide()
        // 恢复之前的窗口焦点
        if (previouslyFocusedWindow !== null) {
          const previousWindow = BrowserWindow.fromId(previouslyFocusedWindow)
          if (previousWindow && !previousWindow.isDestroyed()) {
            previousWindow.focus()
          }
          previouslyFocusedWindow = null
        }
      }
    }

    animate()
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
    if (mainWindow?.isVisible()) {
      hideWindow()
    } else {
      showWindow()
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

// 监听隐藏窗口的IPC消息
ipcMain.on('hide-window', () => {
  hideWindow()
})

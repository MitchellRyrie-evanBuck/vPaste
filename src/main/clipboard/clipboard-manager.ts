import { clipboard, ipcMain, BrowserWindow, powerMonitor } from 'electron';
import Store from 'electron-store';
import { ClipboardItem } from '@/types';

// 创建存储实例
const store = new Store({
  name: 'clipboard-history',
});

// 初始化存储
if (!store.has('history')) {
  store.set('history', []);
}

let lastContent: string = '';
let watching: boolean = false;
let mainWindow: BrowserWindow | null = null;
let intervalId: NodeJS.Timeout | null = null;

// 检查剪贴板变化
const checkClipboard = () => {
  // 如果窗口不存在或已被销毁，不执行检查
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const text = clipboard.readText();
  const image = clipboard.readImage();

  // 如果内容没有变化，直接返回
  if (text === lastContent && image.isEmpty()) {
    return;
  }

  // 更新最后的内容
  lastContent = text;

  // 创建新的剪贴板项
  const newItem: ClipboardItem = {
    id: Date.now(),
    content: text,
    type: 'text',
    timestamp: new Date().toISOString()
  };

  // 获取当前历史记录
  const history: ClipboardItem[] = store.get('history', []) as ClipboardItem[];

  // 添加新项到历史记录
  store.set('history', [newItem, ...history]);

  // 只在窗口存在且可见时发送更新
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    try {
      mainWindow.webContents.send('clipboard-update', newItem);
    } catch (error) {
      console.error('Error sending clipboard update:', error);
    }
  }
};

// 开始监听剪贴板
export const startWatching = (window: BrowserWindow) => {
  if (watching) return;

  mainWindow = window;
  watching = true;

  // 启动轮询
  const startPolling = () => {
    if (intervalId) return;
    intervalId = setInterval(checkClipboard, 500);
  };

  // 停止轮询
  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // 监听窗口事件
  mainWindow.on('show', startPolling);
  mainWindow.on('hide', stopPolling);
  mainWindow.on('close', stopPolling);

  // 初始启动轮询
  if (mainWindow.isVisible()) {
    startPolling();
  }
};

// 停止监听
export const stopWatching = () => {
  if (!watching) return;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // 清理事件监听
  powerMonitor.removeAllListeners('lock-screen');
  powerMonitor.removeAllListeners('suspend');
  powerMonitor.removeAllListeners('unlock-screen');
  powerMonitor.removeAllListeners('resume');

  watching = false;
  mainWindow = null;
};

// 获取历史记录
export const getHistory = (): ClipboardItem[] => {
  const history = store.get('history', []) as ClipboardItem[];
  console.log('Getting clipboard history:', history);
  return history;
};

// 清空历史记录
export const clearHistory = () => {
  store.set('history', []);
  mainWindow?.webContents.send('clipboard-update', null);
};

// 设置剪贴板内容
export const setClipboardContent = (content: string) => {
  clipboard.writeText(content);
};

// 初始化 IPC 监听器
export const initializeIpcHandlers = (): void => {
  console.log('Initializing IPC handlers');

  ipcMain.handle('get-clipboard-history', () => {
    console.log('Handling get-clipboard-history request');
    return getHistory();
  });

  ipcMain.handle('clear-clipboard-history', () => {
    console.log('Handling clear-clipboard-history request');
    store.set('history', []);
    mainWindow?.webContents.send('clipboard-update', null);
  });

  ipcMain.handle('set-clipboard-content', (_, content: string) => {
    console.log('Handling set-clipboard-content request:', content);
    clipboard.writeText(content);
  });

  // 处理窗口隐藏请求
  ipcMain.on('hide-window', () => {
    console.log('Handling hide-window request');
    mainWindow?.hide();
  });
};

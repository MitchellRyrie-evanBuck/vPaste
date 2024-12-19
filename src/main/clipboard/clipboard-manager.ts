import { clipboard, ipcMain, BrowserWindow } from 'electron';
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

// 检查剪贴板变化
const checkClipboard = () => {
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

  // 通知渲染进程更新
  mainWindow?.webContents.send('clipboard-update', newItem);
};

// 开始监听剪贴板
export const startWatching = (window: BrowserWindow) => {
  if (watching) return;

  mainWindow = window;
  watching = true;

  // 每秒检查剪贴板变化
  setInterval(checkClipboard, 1000);
};

// 停止监听
export const stopWatching = () => {
  watching = false;
};

// 获取历史记录
export const getHistory = (): ClipboardItem[] => {
  return store.get('history', []) as ClipboardItem[];
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
export const initializeIpcHandlers = () => {
  ipcMain.handle('get-clipboard-history', getHistory);
  ipcMain.handle('clear-clipboard-history', clearHistory);
  ipcMain.handle('set-clipboard-content', (_, content: string) => setClipboardContent(content));
};

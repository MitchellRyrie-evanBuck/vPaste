import { clipboard, ipcMain, BrowserWindow } from 'electron';
import Store from 'electron-store';
import { ClipboardItem } from '../../types';

export class ClipboardManager {
  private store: Store;
  private lastContent: string = '';
  private watching: boolean = false;
  private mainWindow: BrowserWindow | null = null;

  constructor(window: BrowserWindow) {
    this.store = new Store({
      name: 'clipboard-history',
    });
    this.mainWindow = window;

    // 初始化存储
    if (!this.store.has('history')) {
      this.store.set('history', []);
    }
  }

  // 开始监听剪贴板
  startWatching() {
    if (this.watching) return;
    this.watching = true;

    // 每秒检查剪贴板变化
    setInterval(() => {
      this.checkClipboard();
    }, 1000);
  }

  // 停止监听
  stopWatching() {
    this.watching = false;
  }

  // 检查剪贴板变化
  private checkClipboard() {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    // 如果内容没有变化，直接返回
    if (text === this.lastContent && image.isEmpty()) {
      return;
    }

    // 更新最后的内容
    this.lastContent = text;

    // 创建新的剪贴板项
    const newItem: ClipboardItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: image.isEmpty() ? 'text' : 'image',
      content: image.isEmpty() ? text : image.toDataURL(),
      favorite: false,
    };

    // 保存到历史记录
    const history: ClipboardItem[] = this.store.get('history', []);
    history.unshift(newItem);

    // 限制历史记录数量（例如保留最近100条）
    if (history.length > 100) {
      history.pop();
    }

    this.store.set('history', history);

    // 通知渲染进程
    if (this.mainWindow) {
      this.mainWindow.webContents.send('clipboard-updated', newItem);
    }
  }

  // 获取历史记录
  getHistory(): ClipboardItem[] {
    return this.store.get('history', []);
  }

  // 清空历史记录
  clearHistory() {
    this.store.set('history', []);
  }

  // 设置收藏状态
  toggleFavorite(id: number) {
    const history: ClipboardItem[] = this.store.get('history', []);
    const item = history.find(item => item.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.store.set('history', history);
    }
  }
}

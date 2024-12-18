import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 获取剪贴板历史
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),

  // 切换收藏状态
  toggleFavorite: (id: number) => ipcRenderer.invoke('toggle-favorite', id),

  // 监听剪贴板更新
  onClipboardUpdate: (callback: Function) => {
    ipcRenderer.on('clipboard-updated', (_, data) => callback(data))
  },

  // 移除监听
  removeClipboardListener: () => {
    ipcRenderer.removeAllListeners('clipboard-updated')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

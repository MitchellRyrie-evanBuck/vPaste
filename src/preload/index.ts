import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, ClipboardAPI } from '@/types/global'

// Electron API
const electronAPI: ElectronAPI = {
  ipcRenderer: {
    on(channel: string, callback: (data: any) => void) {
      ipcRenderer.on(channel, (_, data) => callback(data))
    },
    send(channel: string, data?: any) {
      ipcRenderer.send(channel, data)
    },
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args)
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel)
    }
  }
}

// 剪贴板 API
const clipboardAPI: ClipboardAPI = {
  getHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  clearHistory: () => ipcRenderer.invoke('clear-clipboard-history'),
  setContent: (content: string) => ipcRenderer.invoke('set-clipboard-content', content)
}

// 使用 contextBridge 暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('clipboard', clipboardAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.clipboard = clipboardAPI
}

import { ClipboardItem } from './index'

// IPC 通信接口
export interface IpcRenderer {
  on(channel: string, callback: (data: any) => void): void
  send(channel: string, data?: any): void
  invoke<T>(channel: string, ...args: any[]): Promise<T>
  removeAllListeners(channel: string): void
}

interface ProcessVersions {
  node: string
  chrome: string
  electron: string
  v8: string
}

// 主进程暴露给渲染进程的 API
export interface ElectronAPI {
  ipcRenderer: IpcRenderer
  process?: {
    versions: ProcessVersions
    platform: string
    arch: string
    env: NodeJS.ProcessEnv
  }
  // 可以继续添加其他常用的 Electron API
  app?: {
    getVersion: () => string
    getName: () => string
  }
  clipboard?: {
    readText: () => Promise<string>
    writeText: (text: string) => Promise<void>
  }
}

// 剪贴板相关的 API
export interface ClipboardAPI {
  getHistory(): Promise<ClipboardItem[]>
  clearHistory(): Promise<void>
  setContent(content: string): Promise<void>
}

declare global {
  // 渲染进程的 window 对象
  interface Window {
    electron: ElectronAPI
    clipboard: ClipboardAPI
  }

  // Node.js 全局变量
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      VITE_DEV_SERVER_URL: string
    }
  }
}

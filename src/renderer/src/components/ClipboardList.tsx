import React, { useEffect, useState } from 'react'
import { ClipboardItem } from '@/types'

export const ClipboardList: React.FC = () => {
  const [items, setItems] = useState<ClipboardItem[]>([])

  useEffect(() => {
    // 监听来自主进程的剪贴板更新
    window.electron.ipcRenderer.on('clipboard-update', (newItem: ClipboardItem) => {
      if (newItem) {
        setItems(prev => [newItem, ...prev])
      } else {
        setItems([]) // 如果 newItem 为 null，清空列表
      }
    })

    // 组件卸载时移除监听
    return () => {
      window.electron.ipcRenderer.removeAllListeners('clipboard-update')
    }
  }, [])

  return (
    <div className="clipboard-list">
      <h2 className="bg-blue-500 p-4 hover:bg-blue-600 text-white">剪贴板历史</h2>
      <div className="items">
        {items.map((item) => (
          <div key={item.id} className="clipboard-item">
            <span>{item.content}</span>
            <span>{new Date(item.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

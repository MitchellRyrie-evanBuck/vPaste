import { useEffect, useState } from 'react'
import { ClipboardItem } from '../../../types'

export function ClipboardList() {
  const [items, setItems] = useState<ClipboardItem[]>([])

  useEffect(() => {
    // 监听来自主进程的剪贴板更新
    window.electron.ipcRenderer.on('clipboard-updated', (newItem: ClipboardItem) => {
      setItems(prev => [newItem, ...prev])
    })

    // 组件卸载时移除监听
    return () => {
      window.electron.ipcRenderer.removeAllListeners('clipboard-updated')
    }
  }, [])

  return (
    <div className="clipboard-list">
      <h2>剪贴板历史</h2>
      <div className="items">
        {items.map((item) => (
          <div key={item.id} className="clipboard-item">
            {item.type === 'text' ? (
              <div className="text-content">{item.content}</div>
            ) : (
              <img src={item.content} alt="Clipboard content" className="image-content" />
            )}
            <div className="timestamp">
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

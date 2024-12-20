import React, { useEffect, useState } from 'react';
import { ClipboardItem } from '@/types';

export const ClipboardList: React.FC = () => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 加载剪贴板历史
  useEffect(() => {
    loadClipboardHistory();

    // 监听来自主进程的剪贴板更新
    window.electron.ipcRenderer.on('clipboard-update', (newItem: ClipboardItem | null) => {
      console.log('Received clipboard update:', newItem);
      if (newItem) {
        setItems(prev => [newItem, ...prev]);
      } else {
        setItems([]); // 清空列表
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('clipboard-update');
    };
  }, []);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(items.length - 1, prev + 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(items.length - 1, prev + 1));
          break;
        case 'Enter':
        case 'c':
          if (e.metaKey || e.ctrlKey) { // Command+C 或 Ctrl+C
            e.preventDefault();
            copySelectedItem();
          }
          break;
        case 'Escape':
          e.preventDefault();
          window.electron.ipcRenderer.send('hide-window');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex]);

  const loadClipboardHistory = async () => {
    try {
      console.log('Loading clipboard history...');
      const history = await window.clipboard.getHistory();
      console.log('Loaded clipboard history:', history);
      setItems(history);
    } catch (error) {
      console.error('Error loading clipboard history:', error);
    }
  };

  const copySelectedItem = async () => {
    if (items[selectedIndex]) {
      await window.clipboard.setContent(items[selectedIndex].content);
      window.electron.ipcRenderer.send('hide-window');
    }
  };

  return (
    <div className="clipboard-list">
      <h2 className="p-4 text-white bg-blue-500 hover:bg-blue-600">剪贴板历史</h2>
      <div className="items">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`clipboard-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => {
              setSelectedIndex(index);
              copySelectedItem();
            }}
          >
            <div className="content">{item.content}</div>
            <div className="time">{new Date(item.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

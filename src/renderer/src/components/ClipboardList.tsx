import React, { useEffect, useState, useRef } from 'react';
import { ClipboardItem } from '@/types';

export const ClipboardList: React.FC = () => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
      } else if (event.key === 'Enter' || (event.metaKey || event.ctrlKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedItem();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        window.electron.ipcRenderer.send('hide-window');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  // 当选中项改变时，滚动到视图中
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedIndex]);

  const loadClipboardHistory = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log('Loading clipboard history... (retries left:', retries, ')');
        const history = await window.clipboard.getHistory();
        console.log('Loaded clipboard history:', history);
        setItems(history);
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Error loading clipboard history:', error);
        } else {
          console.log('Retrying in 500ms...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  };

  const copySelectedItem = async () => {
    if (items[selectedIndex]) {
      await window.clipboard.setContent(items[selectedIndex].content);
      window.electron.ipcRenderer.send('hide-window');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white/30 backdrop-blur-xl">
      <h2 className="p-4 text-center text-black">剪贴板历史</h2>
      <div
        ref={containerRef}
        className="flex overflow-x-auto flex-1 gap-4 p-4 snap-x snap-mandatory"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={el => itemRefs.current[index] = el}
            className={`flex-shrink-0 w-80 h-[calc(100%-2rem)] p-4 rounded-lg shadow-lg
              transition-all duration-200 cursor-pointer snap-center backdrop-blur-sm
              ${index === selectedIndex
                ? 'bg-blue-50/90 border-2 border-blue-500 transform scale-105'
                : 'bg-white/80 border border-gray-200 hover:border-blue-300'}`}
            onClick={() => {
              setSelectedIndex(index);
              copySelectedItem();
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 mb-2 text-sm line-clamp-[20] break-all">
                {item.content}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

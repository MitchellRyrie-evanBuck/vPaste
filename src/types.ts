export interface ClipboardItem {
  id: number;
  timestamp: string;
  type: 'text' | 'image';
  content: string;
  favorite: boolean;
}

export interface ClipboardState {
  history: ClipboardItem[];
  isWatching: boolean;
}

import React from 'react'
import { ClipboardList } from './components/ClipboardList'
import './assets/clipboard.css'

const App: React.FC = () => {
  return (
    <div className="app-container">
      <ClipboardList />
    </div>
  )
}

export default App

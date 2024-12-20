import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.less'

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Failed to find root element');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('Created React root');

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('Rendered App component');
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// log uncaught errors and promise rejections so they show up in console
window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

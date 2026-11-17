import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './v02.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = new URL(import.meta.env.BASE_URL + 'sw.js', window.location.href)
    navigator.serviceWorker.register(swUrl.href, {
      scope: new URL(import.meta.env.BASE_URL, window.location.href).pathname,
      updateViaCache: 'none',
    }).catch(error => console.warn('Offline support could not be enabled:', error))
  })
}

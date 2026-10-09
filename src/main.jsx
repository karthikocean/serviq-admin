import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './config/AppContext'
import './index.css'

// Clean up legacy auth keys if present
try {
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
  localStorage.removeItem('currentUser');
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)

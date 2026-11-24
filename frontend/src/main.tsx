import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#800000', borderRadius: 8 } }}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)

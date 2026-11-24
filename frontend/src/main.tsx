import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#902d30', borderRadius: 8 },
        components: {
          Table: {
            headerBg: '#902d30',
            headerColor: '#ffffff',
            headerSortActiveBg: '#7a2427',
            headerSortHoverBg: '#7a2427',
            headerFilterHoverBg: '#7a2427',
            headerSplitColor: 'rgba(255,255,255,0.3)',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@douyinfe/semi-ui/dist/css/semi.css'
import '@douyinfe/semi-icons/dist/css/semi-icons.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

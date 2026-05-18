import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ProjectPage from './pages/ProjectPage'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectPage />
  </StrictMode>,
)
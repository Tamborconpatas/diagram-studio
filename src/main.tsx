import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DiagramApp from './DiagramApp'
import './index.css'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

import { LanguageProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <DiagramApp />
    </LanguageProvider>
  </StrictMode>,
)

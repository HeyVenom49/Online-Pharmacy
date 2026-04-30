import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Starting React app...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
  throw new Error('Root element not found')
}

console.log('Root element found, creating root...')

createRoot(rootElement).render(<App />)

console.log('React app rendered!')

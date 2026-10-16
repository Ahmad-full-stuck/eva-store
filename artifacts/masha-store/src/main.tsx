import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from '@/components/error-boundary'
import './fonts.css'
import './index.css'

const root = document.getElementById('root')
if (root) createRoot(root).render(<ErrorBoundary><App /></ErrorBoundary>)

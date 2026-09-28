import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import App from './App'
import { ErrorBoundary } from '@/components/error-boundary'
import './fonts.css'
import './index.css'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <ErrorBoundary>
      <Router hook={useHashLocation}>
        <App />
      </Router>
    </ErrorBoundary>,
  )
}

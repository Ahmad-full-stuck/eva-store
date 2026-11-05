import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { useHashLocation } from '@/lib/hash-location'
import App from './App'
import { ErrorBoundary } from '@/components/error-boundary'
import { flushPendingOrders, loadServerConfig } from '@/lib/api'
import './fonts.css'
import './index.css'

const root = document.getElementById('root')

if (root) {
  const mount = () => createRoot(root).render(
    <ErrorBoundary>
      <Router hook={useHashLocation}>
        <App />
      </Router>
    </ErrorBoundary>,
  )
  const configReady = Promise.race([
    loadServerConfig(),
    new Promise<void>((resolve) => window.setTimeout(resolve, 1600)),
  ])
  void configReady.finally(() => {
    mount()
    void flushPendingOrders()
  })
}

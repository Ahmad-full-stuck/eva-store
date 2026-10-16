/* Service worker لإشعارات الطلبات في إيفا ستور */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (error) {
    data = {}
  }
  const title = (data && data.title) || 'إيفا ستور'
  const info = (data && data.data) || {}
  const options = {
    body: (data && data.body) || 'لديك إشعار جديد',
    icon: 'favicon.svg',
    badge: 'favicon.svg',
    dir: 'rtl',
    lang: 'ar',
    tag: info.orderNumber ? `eva-order-${info.orderNumber}` : undefined,
    data: info,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const info = event.notification.data || {}
  const target = info.url ? new URL(info.url, self.registration.scope).href : self.registration.scope
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of windows) {
        if ('focus' in client) {
          try {
            await client.navigate(target)
          } catch (error) {
            /* cross-origin or unsupported navigate */
          }
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
    })(),
  )
})

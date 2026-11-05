import { getPushConfig, savePushSubscription } from '@/lib/api'

/** هل المتصفح يدعم إشعارات الدفع وService Worker؟ */
export const pushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  typeof Notification !== 'undefined'

const basePath = (): string => import.meta.env.BASE_URL || '/'

/** تحويل مفتاح VAPID العام (base64url) إلى ArrayBuffer. */
export const urlBase64ToUint8Array = (base64: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalized)
  const buffer = new ArrayBuffer(raw.length)
  const output = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return buffer
}

/** تسجيل عامل الخدمة المخصّص للإشعارات. */
export const registerPushWorker = async (): Promise<ServiceWorkerRegistration> => {
  const base = basePath()
  const reg = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
  await navigator.serviceWorker.ready
  return reg
}

/** الاشتراك الحالي على هذا الجهاز إن وُجد. */
export const getSubscription = async (): Promise<PushSubscription | null> => {
  if (!pushSupported()) return null
  const reg = await navigator.serviceWorker.getRegistration()
  return reg ? reg.pushManager.getSubscription() : null
}

/**
 * يضمن وجود اشتراك دفع على هذا الجهاز ثم يحفظه في الخادم.
 * لا يطلب الإذن — يجب أن يكون الإذن ممنوحاً مسبقاً.
 */
export const ensureSubscription = async (): Promise<PushSubscription | null> => {
  if (!pushSupported() || Notification.permission !== 'granted') return null
  const config = await getPushConfig()
  if (!config.enabled || !config.publicKey) return null
  const reg = await registerPushWorker()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    })
  }
  await savePushSubscription(sub.toJSON())
  return sub
}

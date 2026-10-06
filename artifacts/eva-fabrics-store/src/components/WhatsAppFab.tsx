import { MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site'

const fabStyles = `
.whatsapp-fab { position: fixed; left: 14px; bottom: max(14px, env(safe-area-inset-bottom)); z-index: 90; display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 10px 15px; border-radius: 999px; background: linear-gradient(135deg, #25d366, #128c7e); color: #fff; font-size: 12.5px; font-weight: 700; font-family: inherit; text-decoration: none; box-shadow: 0 14px 32px -10px rgba(18, 140, 126, .55); border: 1px solid rgba(255, 255, 255, .35); transition: transform .18s ease, box-shadow .18s ease; }
.whatsapp-fab:hover { transform: translateY(-2px); box-shadow: 0 18px 38px -10px rgba(18, 140, 126, .6); color: #fff; }
.whatsapp-fab:focus-visible { outline: 2px solid #128c7e; outline-offset: 2px; }
@media (max-width: 820px) {
  .whatsapp-fab { left: 12px; bottom: calc(84px + env(safe-area-inset-bottom)); min-height: 42px; padding: 9px 13px; font-size: 11.5px; }
  body:has(.mobile-sticky-buy) .whatsapp-fab { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .whatsapp-fab { transition: none; }
}
`

export function WhatsAppFab() {
  return (
    <>
      <style>{fabStyles}</style>
      <a className="whatsapp-fab" href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer" aria-label="تواصلي معنا عبر واتساب">
        <MessageCircle size={16} /> واتساب
      </a>
    </>
  )
}

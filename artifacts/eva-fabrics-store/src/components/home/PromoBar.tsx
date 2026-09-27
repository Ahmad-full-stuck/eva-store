import { useEffect, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'wouter'
import { formatPrice } from '@/lib/catalog'

const arabicDigits = (value: string): string => value.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])

const pad = (value: number): string => arabicDigits(String(value).padStart(2, '0'))

const unitLabel = (count: number, forms: [string, string, string, string]): string => {
  if (count === 0) return forms[2]
  if (count === 1) return forms[0]
  if (count === 2) return forms[1]
  if (count <= 10) return forms[2]
  return forms[3]
}

const getDeadline = (): number => {
  const now = new Date()
  const daysToSunday = (7 - now.getDay()) % 7
  const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday, 0, 0, 0, 0).getTime()
  return deadline > now.getTime() ? deadline : deadline + 7 * 86400000
}

export function PromoBar() {
  const [deadline, setDeadline] = useState<number>(getDeadline)
  const [remaining, setRemaining] = useState<number>(() => Math.max(0, deadline - Date.now()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = deadline - Date.now()
      if (left <= 0) {
        const next = getDeadline()
        setDeadline(next)
        setRemaining(Math.max(0, next - Date.now()))
        return
      }
      setRemaining(left)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [deadline])

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  const dayLabel = unitLabel(days, ['يوم', 'يومان', 'أيام', 'يوماً'])
  const hourLabel = unitLabel(hours, ['ساعة', 'ساعتان', 'ساعات', 'ساعة'])
  const minuteLabel = unitLabel(minutes, ['دقيقة', 'دقيقتان', 'دقائق', 'دقيقة'])
  const secondLabel = unitLabel(seconds, ['ثانية', 'ثانيتان', 'ثوانٍ', 'ثانية'])

  return (
    <div className="container-eva" style={{ marginBlock: 'clamp(14px, 3vw, 30px)' }}>
      <section className="promo-bar" aria-label="عرض لفترة محدودة">
        <span className="glass-pill"><Sparkles size={13} />عرض نهاية الأسبوع</span>
        <p><strong>توصيل مجاني</strong> للطلبات فوق {formatPrice(50000)} حتى نهاية الأسبوع</p>
        <div className="countdown" role="timer" aria-label={`ينتهي العرض خلال ${days} ${dayLabel} و${hours} ${hourLabel} و${minutes} ${minuteLabel}`}>
          <span className="count-unit"><strong>{pad(days)}</strong><small>{dayLabel}</small></span>
          <span className="count-unit"><strong>{pad(hours)}</strong><small>{hourLabel}</small></span>
          <span className="count-unit"><strong>{pad(minutes)}</strong><small>{minuteLabel}</small></span>
          <span className="count-unit"><strong>{pad(seconds)}</strong><small>{secondLabel}</small></span>
        </div>
        <Link href="/catalog" className="button button-primary button-small">اطلبي الآن <ArrowLeft size={14} /></Link>
      </section>
    </div>
  )
}

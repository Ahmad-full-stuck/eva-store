const STORAGE_KEY = 'eva-sound'

type SoundListener = () => void

interface NoteSpec {
  frequency: number
  offset: number
  duration: number
  peak: number
}

type AudioContextCtor = new () => AudioContext

const listeners = new Set<SoundListener>()

const readStoredFlag = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

let enabled = readStoredFlag()

const notify = (): void => {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      return
    }
  })
}

export const isSoundEnabled = (): boolean => enabled

export const setSoundEnabled = (value: boolean): void => {
  enabled = Boolean(value)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      return
    }
  }
  notify()
}

export const subscribeSound = (listener: SoundListener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    const next = readStoredFlag()
    if (next === enabled) return
    enabled = next
    notify()
  })
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

let context: AudioContext | null = null
let resumeArmed = false

const armResume = (ctx: AudioContext): void => {
  if (resumeArmed) return
  resumeArmed = true
  const resume = (): void => {
    try {
      if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
    } catch {
      return
    }
  }
  window.addEventListener('pointerdown', resume, { passive: true })
  window.addEventListener('keydown', resume)
}

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  try {
    const legacyWindow = window as Window & { webkitAudioContext?: AudioContextCtor }
    const Ctor: AudioContextCtor | undefined = window.AudioContext ?? legacyWindow.webkitAudioContext
    if (!Ctor) return null
    if (!context) {
      context = new Ctor()
      armResume(context)
    }
    if (context.state === 'suspended') void context.resume().catch(() => undefined)
    return context
  } catch {
    return null
  }
}

const scheduleNote = (ctx: AudioContext, note: NoteSpec): void => {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const start = ctx.currentTime + note.offset
  const attack = Math.min(0.012, note.duration / 3)
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(note.frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(note.peak, start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + note.duration + 0.02)
}

const play = (notes: NoteSpec[]): void => {
  try {
    if (typeof window === 'undefined') return
    if (!enabled) return
    if (prefersReducedMotion()) return
    const ctx = getContext()
    if (!ctx || ctx.state === 'closed') return
    notes.forEach((note) => scheduleNote(ctx, note))
  } catch {
    return
  }
}

export const playSoftClick = (): void => {
  play([{ frequency: 1440, offset: 0, duration: 0.04, peak: 0.04 }])
}

export const playAddToCart = (): void => {
  play([
    { frequency: 880, offset: 0, duration: 0.16, peak: 0.05 },
    { frequency: 1174.66, offset: 0.07, duration: 0.2, peak: 0.05 },
  ])
}

export const playSuccess = (): void => {
  play([
    { frequency: 783.99, offset: 0, duration: 0.22, peak: 0.045 },
    { frequency: 987.77, offset: 0.08, duration: 0.24, peak: 0.045 },
    { frequency: 1174.66, offset: 0.16, duration: 0.3, peak: 0.045 },
  ])
}

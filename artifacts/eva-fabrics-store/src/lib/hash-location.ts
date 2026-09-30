import { useSyncExternalStore } from 'react'

interface NavigateOptions {
  state?: unknown
  replace?: boolean
}

let listeners: Array<() => void> = []

const onHashChange = () => listeners.forEach((cb) => cb())

const subscribeToHashUpdates = (callback: () => void) => {
  if (listeners.push(callback) === 1) addEventListener('hashchange', onHashChange)
  return () => {
    listeners = listeners.filter((item) => item !== callback)
    if (!listeners.length) removeEventListener('hashchange', onHashChange)
  }
}

const hashPrefix = /^#?\/?/
const currentHashLocation = () => '/' + location.hash.replace(hashPrefix, '')

export const navigate = (to: string, options: NavigateOptions = {}) => {
  const { state = null, replace = false } = options
  const oldURL = location.href
  const [hash, search = ''] = to.replace(hashPrefix, '').split('?')
  const url = new URL(oldURL)
  url.hash = `/${hash}`
  url.search = search
  const newURL = url.href
  history[replace ? 'replaceState' : 'pushState'](state, '', newURL)
  const event = typeof HashChangeEvent !== 'undefined'
    ? new HashChangeEvent('hashchange', { oldURL, newURL })
    : new Event('hashchange')
  dispatchEvent(event)
}

const useHashLocationHook = ({ ssrPath = '/' }: { ssrPath?: string } = {}) =>
  [
    useSyncExternalStore(subscribeToHashUpdates, currentHashLocation, () => ssrPath),
    navigate,
  ] as [string, typeof navigate]

useHashLocationHook.hrefs = (href: string) => '#' + href

export const useHashLocation = useHashLocationHook

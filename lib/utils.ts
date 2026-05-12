import { customAlphabet } from 'nanoid'

// URL-safe slug — not using nanoid since it's not installed; use crypto instead
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(8)
  crypto.getRandomValues(array)
  return Array.from(array).map((b) => chars[b % chars.length]).join('')
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

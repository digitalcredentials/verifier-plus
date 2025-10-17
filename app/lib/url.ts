import isURL from 'validator/lib/isURL'
export function isValidHttpUrl (value: string | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  
  const baseOptions = {
    require_protocol: true,
    require_host: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  }
  
  // Allow any http/https on localhost/127.0.0.1 for dev
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed)
  if (isLocal) {
    return isURL(trimmed, { ...baseOptions, protocols: ['http','https'] })
  }
  
  // Public hosts must be https
  return isURL(trimmed, { ...baseOptions, protocols: ['https'], require_tld: true })
}



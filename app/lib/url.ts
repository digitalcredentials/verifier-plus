import isURL from 'validator/lib/isURL'
export function isValidHttpUrl (value: string | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  // Allow any http/https on localhost/127.0.0.1 for dev
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed)
  if (isLocal) {
    return isURL(trimmed, {
      protocols: ['http','https'],
      require_protocol: true,
      require_host: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false
    })
  }
  // Public hosts must be https
  return isURL(trimmed, {
    protocols: ['https'],
    require_protocol: true,
    require_host: true,
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  })
}



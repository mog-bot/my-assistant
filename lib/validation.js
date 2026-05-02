import { ALLOWED_SCHEMES, BLOCKED_HOSTS } from './constants'

/**
 * Validate a URL for scraping — prevents SSRF attacks
 */
export function validateUrl(urlString) {
  let parsed
  try {
    parsed = new URL(urlString)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  // Check scheme
  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
  }

  // Check for blocked hosts (internal networks, metadata endpoints)
  const hostname = parsed.hostname.toLowerCase()
  for (const blocked of BLOCKED_HOSTS) {
    if (hostname === blocked || hostname.startsWith(blocked)) {
      return { valid: false, error: 'This URL cannot be accessed' }
    }
  }

  // Block IP addresses entirely (only allow domain names)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valid: false, error: 'Direct IP addresses are not allowed. Please use a domain name.' }
  }

  return { valid: true, url: parsed.toString() }
}

/**
 * Sanitize text input — strip control characters, limit length
 */
export function sanitizeInput(text, maxLength) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLength)
}

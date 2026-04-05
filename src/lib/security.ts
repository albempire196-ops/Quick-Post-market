/**
 * Security utilities for input sanitization and XSS prevention.
 * All user inputs should be sanitized before display or storage.
 */

// HTML entity encoding map
const ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const ENCODE_REGEX = /[&<>"'`/]/g;

/**
 * Encode HTML entities to prevent XSS when inserting user content into DOM.
 */
export function escapeHtml(str: string): string {
  return str.replace(ENCODE_REGEX, (char) => ENCODE_MAP[char] || char);
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input: trim, strip HTML, limit length.
 */
export function sanitizeInput(input: string, maxLength = 5000): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

/**
 * Validate URL to prevent javascript: protocol attacks.
 * Only allows http:, https:, and mailto: protocols.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return trimmed;
    }
    return "";
  } catch {
    // Could be a relative URL or invalid
    if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
    return "";
  }
}

/**
 * Rate limiter for client-side actions (form submissions, API calls).
 * Returns true if the action should be allowed.
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const attempts = rateLimitMap.get(key) || [];
  const recent = attempts.filter(t => now - t < windowMs);
  if (recent.length >= maxAttempts) return false;
  recent.push(now);
  rateLimitMap.set(key, recent);
  return true;
}

/**
 * Centralized API error normalization.
 * Use for consistent, user-friendly error messages in API routes.
 */

export function normalizeApiError(err: unknown): {
  message: string
  status: number
} {
  if (err instanceof Error) {
    const msg = err.message
    if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
      return { message: "Authentication failed. Check your API key.", status: 401 }
    }
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      return { message: "Resource not found.", status: 404 }
    }
    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
      return { message: "Rate limit exceeded. Try again later.", status: 429 }
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return { message: "Request timed out. The operation may still be in progress.", status: 504 }
    }
    return { message: msg, status: 500 }
  }
  return { message: String(err), status: 500 }
}

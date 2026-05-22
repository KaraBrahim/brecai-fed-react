/**
 * Centralised API error handler for admin pages.
 *
 * Usage:
 *   import { handleApiError } from '@/lib/handleApiError'
 *   ...
 *   } catch (err) {
 *     handleApiError(err, showToast)
 *   }
 *
 * Tone mapping:
 *   403  → amber  (permission boundary — the API message explains what role is missing)
 *   404  → slate  (resource not found)
 *   422  → pink   (validation error — API message contains field details)
 *   500+ → pink   (server error)
 *   else → pink   (unexpected)
 */
export function handleApiError(err, showToast) {
  const status  = err?.response?.status
  const message = err?.response?.data?.message || err?.message || 'An error occurred'

  if (status === 403) {
    showToast(message, 'amber')
  } else if (status === 404) {
    showToast('Resource not found', 'slate')
  } else {
    showToast(message, 'pink')
  }
}

/**
 * Generates a random short ID for client-side-created plan items (phases, units, exercises).
 * The backend will assign real UUIDs on save.
 */
export function nanoid(): string {
  return `tmp_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`
}

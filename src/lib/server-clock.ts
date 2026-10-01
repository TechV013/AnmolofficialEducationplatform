/**
 * Reads the wall clock on the server.
 *
 * Kept behind a helper so request-time reads are explicit and not mistaken for a
 * value computed during client render. The result is passed to client components
 * as a prop, which keeps their render pure and hydration-stable.
 */
export function serverNowMs(): number {
  return Date.now();
}

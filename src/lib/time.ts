/**
 * Moscow-time helpers.
 *
 * The whole app operates in Moscow time (MSK). Russia does not observe DST,
 * so MSK is a fixed UTC+3 offset year-round — we can safely hard-code it.
 *
 * The problem these helpers solve: `<input type="datetime-local">` produces a
 * naive string like "2026-06-14T10:00" with no timezone. `new Date(...)` parses
 * such strings in the *runtime's* timezone — which is UTC on Vercel — so the
 * tutor's "10:00" silently became 10:00 UTC (= 13:00 MSK). Always go through
 * these helpers so a naive value is interpreted as MSK, not as server-local.
 */

export const MSK_OFFSET = '+03:00'

/**
 * Interpret a naive datetime-local string ("2026-06-14T10:00", optionally with
 * seconds) as Moscow time and return the corresponding instant.
 */
export function mskNaiveToDate(naive: string): Date {
  const withSeconds = /T\d{2}:\d{2}$/.test(naive) ? `${naive}:00` : naive
  return new Date(`${withSeconds}${MSK_OFFSET}`)
}

/** Naive Moscow datetime-local value → UTC ISO string for storage. */
export function mskNaiveToUtcISO(naive: string): string {
  return mskNaiveToDate(naive).toISOString()
}

/** Today's date in Moscow as "YYYY-MM-DD". */
export function mskTodayDateString(): string {
  // en-CA formats as ISO-style YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(
    new Date()
  )
}

/** UTC ISO bounds [start, end] covering a full Moscow calendar day. */
export function mskDayRangeUtc(dateStr: string): { start: string; end: string } {
  return {
    start: new Date(`${dateStr}T00:00:00.000${MSK_OFFSET}`).toISOString(),
    end: new Date(`${dateStr}T23:59:59.999${MSK_OFFSET}`).toISOString(),
  }
}

/** Format an instant as Moscow "HH:mm". */
export function formatMskTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

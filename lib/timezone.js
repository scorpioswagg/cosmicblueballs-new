// Determine the IANA timezone for a lat/lng and the historical UTC offset
// at a specific local wall-clock date/time. Handles DST and historical
// timezone changes via the IANA database (luxon uses Intl under the hood).
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';

/**
 * Returns { tz, offsetHours, offsetMinutes } where tz is an IANA zone name.
 * If lat/lng not provided, falls back to UTC.
 *
 * @param {string} date - "YYYY-MM-DD"
 * @param {string|null} time - "HH:MM" (24h) or null
 * @param {number|null} lat
 * @param {number|null} lng
 */
export function resolveBirthTimezone({ date, time, lat, lng }) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { tz: 'UTC', offsetHours: 0, offsetMinutes: 0, source: 'fallback-utc' };
  }
  let tz;
  try {
    tz = tzlookup(lat, lng);
  } catch (e) {
    return { tz: 'UTC', offsetHours: 0, offsetMinutes: 0, source: 'lookup-failed' };
  }
  const [Y, M, D] = (date || '').split('-').map((x) => parseInt(x, 10));
  let hh = 12, mm = 0;
  if (time && /^\d{1,2}:\d{2}$/.test(time)) {
    [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
  }
  const dt = DateTime.fromObject(
    { year: Y, month: M, day: D, hour: hh, minute: mm },
    { zone: tz }
  );
  if (!dt.isValid) {
    return { tz, offsetHours: 0, offsetMinutes: 0, source: 'invalid-datetime' };
  }
  const offsetMinutes = dt.offset; // signed, minutes
  return {
    tz,
    offsetHours: offsetMinutes / 60,
    offsetMinutes,
    source: 'iana',
    isDST: dt.isInDST,
    abbrev: dt.toFormat('ZZZZ'),
  };
}

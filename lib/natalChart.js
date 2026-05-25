// Natal chart computation using astronomy-engine (geocentric, ecliptic of date)
import { Body, Equator, Ecliptic, MakeTime, Observer } from 'astronomy-engine';

const PLANETS = [
  { name: 'Sun', body: Body.Sun },
  { name: 'Moon', body: Body.Moon },
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
  { name: 'Uranus', body: Body.Uranus },
  { name: 'Neptune', body: Body.Neptune },
  { name: 'Pluto', body: Body.Pluto },
];

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const degNorm = (d) => ((d % 360) + 360) % 360;
const deg2rad = (d) => (d * Math.PI) / 180;
const rad2deg = (r) => (r * 180) / Math.PI;

function degToSign(lon) {
  const norm = degNorm(lon);
  const idx = Math.floor(norm / 30);
  return { sign: SIGNS[idx], degreeInSign: parseFloat((norm - idx * 30).toFixed(2)), signIndex: idx };
}

function eclipticLongitudeOfDate(body, time) {
  const obs = new Observer(0, 0, 0);
  const equ = Equator(body, time, obs, true, true);
  const ecl = Ecliptic(equ.vec);
  return degNorm(ecl.elon);
}

function localSiderealTimeDeg(utcDate, longitudeEastDeg) {
  const JD = utcDate.getTime() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525.0;
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  return degNorm(GMST + longitudeEastDeg);
}

const OBLIQUITY = 23.4367;

function computeAscendant(LSTdeg, latDeg) {
  const ramc = deg2rad(LSTdeg);
  const e = deg2rad(OBLIQUITY);
  const phi = deg2rad(latDeg);
  const y = -Math.cos(ramc);
  const x = Math.sin(ramc) * Math.cos(e) + Math.tan(phi) * Math.sin(e);
  return degNorm(rad2deg(Math.atan2(y, x)));
}

function computeMC(LSTdeg) {
  const ramc = deg2rad(LSTdeg);
  const e = deg2rad(OBLIQUITY);
  return degNorm(rad2deg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(e))));
}

function computeWholeSignHouses(ascLon) {
  const ascSignIdx = Math.floor(degNorm(ascLon) / 30);
  const houses = [];
  for (let i = 0; i < 12; i++) {
    houses.push({ house: i + 1, startDeg: ((ascSignIdx + i) % 12) * 30 });
  }
  return houses;
}

function houseForLongitude(houses, lon) {
  const norm = degNorm(lon);
  for (const h of houses) {
    const end = (h.startDeg + 30) % 360;
    if (h.startDeg < end) {
      if (norm >= h.startDeg && norm < end) return h.house;
    } else {
      if (norm >= h.startDeg || norm < end) return h.house;
    }
  }
  return null;
}

const MAJOR_ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trine', angle: 120, orb: 7 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Sextile', angle: 60, orb: 5 },
];

function computeAspects(planets) {
  const out = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i], b = planets[j];
      const diff = Math.abs(degNorm(a.longitude - b.longitude));
      const angle = diff > 180 ? 360 - diff : diff;
      for (const asp of MAJOR_ASPECTS) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          out.push({ p1: a.name, p2: b.name, aspect: asp.name, angle: asp.angle, orb: parseFloat(orb.toFixed(2)) });
        }
      }
    }
  }
  return out;
}

export function computeNatalChart({ date, time, lat, lng, tzOffsetHours = 0 }) {
  const [Y, M, D] = date.split('-').map((x) => parseInt(x, 10));
  let hh = 12, mm = 0;
  let unknownTime = false;
  if (time && /^\d{1,2}:\d{2}$/.test(time)) {
    [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
  } else {
    unknownTime = true;
  }
  const localMs = Date.UTC(Y, M - 1, D, hh, mm, 0);
  const utcMs = localMs - (tzOffsetHours || 0) * 3600 * 1000;
  const utcDate = new Date(utcMs);
  const t = MakeTime(utcDate);

  const planets = PLANETS.map((p) => {
    const lon = eclipticLongitudeOfDate(p.body, t);
    return { name: p.name, longitude: parseFloat(lon.toFixed(3)), ...degToSign(lon) };
  });

  let ascendant = null, midheaven = null, houses = null;
  if (!unknownTime && typeof lat === 'number' && typeof lng === 'number') {
    const LST = localSiderealTimeDeg(utcDate, lng);
    ascendant = computeAscendant(LST, lat);
    midheaven = computeMC(LST);
    houses = computeWholeSignHouses(ascendant);
    for (const p of planets) p.house = houseForLongitude(houses, p.longitude);
  }

  const aspects = computeAspects(planets);

  return {
    meta: { date, time: time || null, lat, lng, tzOffsetHours, unknownTime },
    planets,
    ascendant: ascendant != null ? { longitude: parseFloat(ascendant.toFixed(3)), ...degToSign(ascendant) } : null,
    midheaven: midheaven != null ? { longitude: parseFloat(midheaven.toFixed(3)), ...degToSign(midheaven) } : null,
    houses,
    aspects,
  };
}

export const CELEBRITY_CHARTS = [
  { id: 'einstein', name: 'Albert Einstein', date: '1879-03-14', time: '11:30', location: 'Ulm, Germany', lat: 48.4011, lng: 9.9876, tzOffsetHours: 1 },
  { id: 'beyonce', name: 'Beyoncé', date: '1981-09-04', time: '10:00', location: 'Houston, USA', lat: 29.7604, lng: -95.3698, tzOffsetHours: -5 },
  { id: 'gandhi', name: 'Mahatma Gandhi', date: '1869-10-02', time: '07:11', location: 'Porbandar, India', lat: 21.6417, lng: 69.6293, tzOffsetHours: 5.5 },
];

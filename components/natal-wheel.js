'use client';

import React from 'react';

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_COLORS = ['#ef4444','#84cc16','#eab308','#06b6d4','#f59e0b','#65a30d','#ec4899','#a855f7','#a855f7','#10b981','#06b6d4','#3b82f6'];
const PLANET_GLYPHS = { Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂', Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇' };

function polar(cx, cy, r, deg) {
  // 0° at left (9 o'clock) like a horoscope wheel, going counter-clockwise; rotate -180 so 0° Aries is on the left.
  const rad = ((180 - deg) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function NatalWheel({ chart, size = 420 }) {
  if (!chart) return null;
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.48;
  const rSign = size * 0.42;
  const rHouse = size * 0.34;
  const rPlanet = size * 0.28;
  const rInner = size * 0.18;

  // Rotation so the Ascendant sits on the left (0° in our polar coords is left).
  const ascLon = chart.ascendant?.longitude ?? 0;
  function lonToWheel(lon) { return ((lon - ascLon) + 360) % 360; }

  // Sign segments (12 × 30°)
  const signs = [];
  for (let i = 0; i < 12; i++) {
    const startWheelDeg = (i * 30 - ((ascLon) % 30)) % 360; // adjust so wheel aligns
    const start = lonToWheel(i * 30);
    const mid = lonToWheel(i * 30 + 15);
    const [mx, my] = polar(cx, cy, (rSign + rOuter) / 2, mid);
    signs.push({ i, start, mid, mx, my });
  }

  // Concentric circles
  // House cusps (whole sign)
  const houseSpokes = [];
  for (let i = 0; i < 12; i++) {
    const startDeg = lonToWheel(((Math.floor(ascLon / 30) + i) % 12) * 30);
    const [x1, y1] = polar(cx, cy, rInner, startDeg);
    const [x2, y2] = polar(cx, cy, rHouse, startDeg);
    houseSpokes.push({ x1, y1, x2, y2, num: i + 1, startDeg });
  }

  // Planet positions — avoid overlap by simple offsetting in degree-space (rough but workable).
  const placed = [];
  const sorted = [...(chart.planets || [])].sort((a, b) => lonToWheel(a.longitude) - lonToWheel(b.longitude));
  let lastDeg = -999;
  for (const p of sorted) {
    let d = lonToWheel(p.longitude);
    if (d - lastDeg < 6) d = lastDeg + 6;
    lastDeg = d;
    placed.push({ ...p, wheelDeg: d, realDeg: lonToWheel(p.longitude) });
  }

  // sign segment paths
  function arcPath(r1, r2, deg1, deg2) {
    const [x1, y1] = polar(cx, cy, r2, deg1);
    const [x2, y2] = polar(cx, cy, r2, deg2);
    const [x3, y3] = polar(cx, cy, r1, deg2);
    const [x4, y4] = polar(cx, cy, r1, deg1);
    const largeArc = Math.abs(deg2 - deg1) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r2} ${r2} 0 ${largeArc} 0 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${largeArc} 1 ${x4} ${y4} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]">
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a0f3e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0a0420" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* background */}
      <circle cx={cx} cy={cy} r={rOuter} fill="url(#wheelBg)" stroke="rgba(255,255,255,0.15)" />

      {/* sign segments */}
      {Array.from({ length: 12 }).map((_, i) => {
        const start = lonToWheel(i * 30);
        const end = lonToWheel(i * 30 + 30);
        const seg = arcPath(rSign, rOuter, start, end);
        const mid = lonToWheel(i * 30 + 15);
        const [tx, ty] = polar(cx, cy, (rSign + rOuter) / 2, mid);
        return (
          <g key={i}>
            <path d={seg} fill={SIGN_COLORS[i] + '22'} stroke="rgba(255,255,255,0.08)" />
            <text x={tx} y={ty} fontSize={size * 0.045} fill="#f0abfc" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 600 }}>{SIGN_GLYPHS[i]}</text>
          </g>
        );
      })}

      {/* house spokes */}
      {houseSpokes.map((h, i) => (
        <g key={i}>
          <line x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} stroke="rgba(255,255,255,0.18)" strokeWidth={i % 3 === 0 ? 1.4 : 0.6} />
          {(() => {
            const mid = (h.startDeg + 15) % 360;
            const [tx, ty] = polar(cx, cy, (rInner + rHouse) / 2, mid);
            return <text x={tx} y={ty} fontSize={size * 0.024} fill="rgba(255,255,255,0.4)" textAnchor="middle" dominantBaseline="middle">{h.num}</text>;
          })()}
        </g>
      ))}

      {/* inner circle */}
      <circle cx={cx} cy={cy} r={rHouse} fill="none" stroke="rgba(255,255,255,0.12)" />
      <circle cx={cx} cy={cy} r={rInner} fill="rgba(168,85,247,0.06)" stroke="rgba(255,255,255,0.1)" />

      {/* aspect lines (inside the inner ring) */}
      {(chart.aspects || []).slice(0, 60).map((a, i) => {
        const p1 = chart.planets.find(p => p.name === a.p1);
        const p2 = chart.planets.find(p => p.name === a.p2);
        if (!p1 || !p2) return null;
        const [x1, y1] = polar(cx, cy, rInner * 0.95, lonToWheel(p1.longitude));
        const [x2, y2] = polar(cx, cy, rInner * 0.95, lonToWheel(p2.longitude));
        const colors = { Conjunction: '#f0abfc', Opposition: '#ef4444', Trine: '#10b981', Square: '#f59e0b', Sextile: '#3b82f6' };
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[a.aspect] || 'white'} strokeOpacity={0.5} strokeWidth={0.7} />;
      })}

      {/* Ascendant marker */}
      {chart.ascendant && (() => {
        const d = lonToWheel(chart.ascendant.longitude);
        const [x1, y1] = polar(cx, cy, rInner, d);
        const [x2, y2] = polar(cx, cy, rOuter + 8, d);
        return (
          <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0abfc" strokeWidth={2} />
            <text x={x2 - 8} y={y2} fontSize={size * 0.028} fill="#f0abfc" textAnchor="end" dominantBaseline="middle">AC</text>
          </g>
        );
      })()}
      {/* MC */}
      {chart.midheaven && (() => {
        const d = lonToWheel(chart.midheaven.longitude);
        const [x1, y1] = polar(cx, cy, rInner, d);
        const [x2, y2] = polar(cx, cy, rOuter + 8, d);
        return (
          <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a78bfa" strokeWidth={2} strokeDasharray="3 2" />
            <text x={x2} y={y2 - 8} fontSize={size * 0.028} fill="#a78bfa" textAnchor="middle" dominantBaseline="middle">MC</text>
          </g>
        );
      })()}

      {/* planets */}
      {placed.map((p, i) => {
        const [px, py] = polar(cx, cy, rPlanet, p.wheelDeg);
        const [tx, ty] = polar(cx, cy, rHouse - 6, p.realDeg);
        return (
          <g key={i}>
            <line x1={tx} y1={ty} x2={px} y2={py} stroke="rgba(240,171,252,0.4)" strokeWidth={0.6} />
            <circle cx={px} cy={py} r={size * 0.024} fill="#1a0f3e" stroke="#f0abfc" strokeWidth={1} />
            <text x={px} y={py} fontSize={size * 0.03} fill="#f0abfc" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 600 }}>{PLANET_GLYPHS[p.name] || p.name[0]}</text>
          </g>
        );
      })}

      {/* center label */}
      <text x={cx} y={cy} fontSize={size * 0.05} fill="#f0abfc" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 600 }}>✦</text>
    </svg>
  );
}

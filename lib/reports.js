// 13 report types with metadata, prompts and prices

export const REPORT_TYPES = [
  {
    id: 'natal-chart',
    name: 'Natal Chart Reading',
    icon: '✨',
    blurb: 'Core personality, strengths and inner blueprint',
    color: 'from-violet-500 to-fuchsia-500',
    price: 999,
  },
  {
    id: 'love-romance',
    name: 'Love & Romance',
    icon: '❤️',
    blurb: 'Relationship patterns, attraction style and intimacy',
    color: 'from-rose-500 to-pink-500',
    price: 999,
  },
  {
    id: 'career-vocation',
    name: 'Career & Vocation',
    icon: '💼',
    blurb: 'Professional path, leadership style & purpose at work',
    color: 'from-amber-500 to-orange-500',
    price: 999,
  },
  {
    id: 'wealth-finance',
    name: 'Wealth & Finance',
    icon: '💰',
    blurb: 'Money mindset, abundance flow & financial timing',
    color: 'from-emerald-500 to-teal-500',
    price: 999,
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: '🌿',
    blurb: 'Body-mind constitution, vitality & wellness rhythms',
    color: 'from-green-500 to-emerald-500',
    price: 999,
  },
  {
    id: 'life-purpose',
    name: 'Life Purpose & Soul Path',
    icon: '🔮',
    blurb: 'Soul lessons, North Node and your deepest calling',
    color: 'from-indigo-500 to-purple-500',
    price: 999,
  },
  {
    id: 'year-ahead',
    name: 'Year Ahead Forecast',
    icon: '🌟',
    blurb: '12-month transit overview & major themes',
    color: 'from-sky-500 to-cyan-500',
    price: 999,
  },
  {
    id: 'monthly-horoscope',
    name: 'Monthly Horoscope',
    icon: '🌙',
    blurb: 'Detailed forecast for the current month',
    color: 'from-blue-500 to-indigo-500',
    price: 999,
  },
  {
    id: 'compatibility',
    name: 'Compatibility Reading',
    icon: '💑',
    blurb: 'Synastry insights for two partners (requires partner data)',
    color: 'from-pink-500 to-rose-500',
    price: 999,
  },
  {
    id: 'past-life',
    name: 'Past Life & Karmic',
    icon: '🕊️',
    blurb: 'Karmic patterns, ancestral threads and South Node themes',
    color: 'from-purple-500 to-violet-500',
    price: 999,
  },
  {
    id: 'spiritual-growth',
    name: 'Spiritual Growth',
    icon: '🗿',
    blurb: 'Inner evolution, intuition development & higher self',
    color: 'from-fuchsia-500 to-purple-500',
    price: 999,
  },
  {
    id: 'family-children',
    name: 'Family & Children',
    icon: '👪',
    blurb: 'Family dynamics, parenting style & children\u2019s themes',
    color: 'from-orange-500 to-rose-500',
    price: 999,
  },
  {
    id: 'travel-relocation',
    name: 'Travel & Relocation',
    icon: '✈️',
    blurb: 'Astrocartography & best places for love, work or growth',
    color: 'from-cyan-500 to-blue-500',
    price: 999,
  },
];

export const BUNDLE = {
  id: 'full-bundle',
  name: 'Full Cosmic Bundle',
  icon: '🌌',
  blurb: 'All 13 reports — your complete cosmic blueprint',
  price: 4999,
  reportIds: REPORT_TYPES.map((r) => r.id),
};

export function getReport(id) {
  return REPORT_TYPES.find((r) => r.id === id);
}

function toDegSign(lon) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const deg = norm - idx * 30;
  return `${signs[idx]} ${deg.toFixed(1)}°`;
}

export function chartSummary(chart) {
  if (!chart || !chart.planets) return '(chart data unavailable)';
  return chart.planets
    .map((p) => `${p.name} in ${toDegSign(p.longitude)}${p.house ? ' (House ' + p.house + ')' : ''}`)
    .join('\n');
}

export function buildReportPrompt(reportTypeId, birthData, chart, partnerChart = null) {
  const rt = getReport(reportTypeId);
  if (!rt) throw new Error('Unknown report type: ' + reportTypeId);

  const system = `You are a master astrologer at Cosmic Blueprint who combines Western tropical astrology, psychological depth, and practical wisdom. Write in a warm, grounded, empowering tone. Be specific to the chart data provided. Use clear paragraphs and section headings (no bullet lists). Never use deterministic language; emphasize free will and growth. Length: 800–1400 words.`;

  const chartText = chartSummary(chart);
  const partnerText = partnerChart ? `\n\nPARTNER\u2019S CHART:\n${chartSummary(partnerChart)}` : '';

  const focusByType = {
    'natal-chart': 'Write a comprehensive natal chart reading covering: Sun (core identity), Moon (emotional nature), Rising sign if available (outer expression), and 2\u20133 of the most striking planetary placements. End with a short summary of the person\u2019s gifts and key growth edge.',
    'love-romance': 'Focus on Venus, Mars, Moon, and the 5th and 7th house themes. Describe attraction style, intimacy patterns, what they need from a partner, and how to attract aligned love. Address red flags and growth invitations.',
    'career-vocation': 'Focus on the Sun, Saturn, Midheaven (10th house) themes, and the North Node\u2019s career hints. Describe leadership style, ideal work environment, professional gifts, and a specific suggestion for the next 6\u201312 months.',
    'wealth-finance': 'Focus on the 2nd house, Venus, Jupiter, and the part of fortune. Describe their money mindset, earning style, abundance lessons, and timing patterns for financial growth.',
    'health-wellness': 'Focus on the 6th house, Mars (energy), Moon (body rhythms), and the ascendant\u2019s elemental nature. Describe their constitutional type, common stressors, body areas to nurture, and 3 wellness practices that align with their chart.',
    'life-purpose': 'Center on the North Node (dharma) vs. South Node (karma), Sun, and Midheaven. Describe their soul path, the lessons they came to learn, and the contribution they\u2019re here to make.',
    'year-ahead': 'Provide a 12-month forecast organized by quarters. Reference major transits (Jupiter, Saturn, outer planets) impacting the chart. Identify peak windows for love, career, health, and growth.',
    'monthly-horoscope': 'Write a detailed forecast for the current calendar month. Reference current lunar cycle (new moon/full moon themes), Mercury status, and key transits over their personal planets.',
    'compatibility': 'This is a synastry reading between two charts (provided below). Compare Sun, Moon, Venus, Mars, and Ascendant placements. Describe harmonies, growth edges, and a practical love map for the relationship.',
    'past-life': 'Focus on the South Node, 12th house, Saturn, and Pluto. Describe karmic patterns carried in, ancestral themes, and the soul-medicine for this lifetime.',
    'spiritual-growth': 'Focus on Neptune, Pisces/12th house, Uranus, Pluto, and the North Node. Describe spiritual gifts, intuition style, shadow integration work, and 3 practices for awakening.',
    'family-children': 'Focus on the 4th house (roots), 5th house (children), Moon (mothering), Saturn (fathering), and Cancer placements. Describe family dynamics, parenting style, and themes around children.',
    'travel-relocation': 'Discuss astrocartography concepts and what the chart suggests about energizing places. Recommend 3 directional themes (east/west/north/south or specific zones) and what each activates.',
  };

  const user = `REPORT TYPE: ${rt.name}\nCLIENT: ${birthData.name || 'Anonymous'}\nBORN: ${birthData.date} at ${birthData.time || 'unknown time'} in ${birthData.location}\n\nNATAL CHART DATA:\n${chartText}${partnerText}\n\nINSTRUCTIONS:\n${focusByType[reportTypeId] || focusByType['natal-chart']}\n\nNow write the full reading.`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb, ensureIndexes } from '@/lib/mongo';
import { getCurrentUser, setSessionCookie, clearSessionCookie, findOrCreateUser } from '@/lib/auth';
import { computeNatalChart, CELEBRITY_CHARTS } from '@/lib/natalChart';
import { REPORT_TYPES, BUNDLE, getReport, buildReportPrompt } from '@/lib/reports';
import { chat } from '@/lib/llm';
import { sendMagicLinkEmail } from '@/lib/email';
import { getStripe } from '@/lib/stripe';
import { resolveBirthTimezone } from '@/lib/timezone';
const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'http://localhost:3000';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let indexesEnsured = false;
async function ensureSetup() {
  if (indexesEnsured) return;
  try {
    await ensureIndexes();
    // Seed admin user if not exists
    const db = await getDb();
    const admin = await db.collection('users').findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await db.collection('users').insertOne({
        id: crypto.randomUUID(),
        email: process.env.ADMIN_EMAIL,
        passwordHash: hash,
        role: 'admin',
        name: 'Admin',
        createdAt: new Date(),
      });
      console.log('[setup] Admin user seeded:', process.env.ADMIN_EMAIL);
    }
    indexesEnsured = true;
  } catch (e) {
    console.error('[setup] failed:', e.message);
  }
}

function hashToken(t) {
  return crypto.createHash('sha256').update(t).digest('hex');
}

function jsonOk(data, status = 200) {
  return NextResponse.json(data, { status });
}
function jsonErr(msg, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// ----------------- Handlers -----------------

async function handleGeocode(body) {
  const location = (body.location || '').trim();
  if (!location) return jsonErr('location is required');

  // Primary: Open-Meteo geocoding (free, no key, no rate limit)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=5&language=en&format=json`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      const results = (data?.results || []).map((r) => ({
        display_name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
        lat: r.latitude,
        lng: r.longitude,
        city: r.name,
        country: r.country,
      }));
      if (results.length > 0) return jsonOk({ results, source: 'open-meteo' });
    }
  } catch (e) {
    console.warn('[geocode] open-meteo failed, falling back:', e.message);
  }

  // Fallback: Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&addressdetails=1`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'CosmicBlueprint/1.0 (contact: admin@cosmicblueprint.com)' },
    });
    if (!resp.ok) return jsonOk({ results: [], source: 'nominatim-failed' });
    const data = await resp.json();
    const results = (data || []).map((r) => ({
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || '',
      country: r.address?.country || '',
    }));
    return jsonOk({ results, source: 'nominatim' });
  } catch (e) {
    return jsonOk({ results: [], source: 'error', error: e.message });
  }
}

async function handleChart(body) {
  const { date, time, lat, lng } = body || {};
  if (!date) return jsonErr('date is required');
  try {
    let tz = null, tzOffsetHours = 0;
    if (typeof lat === 'number' && typeof lng === 'number') {
      const r = resolveBirthTimezone({ date, time, lat, lng });
      tz = r.tz;
      tzOffsetHours = r.offsetHours;
    } else if (typeof body.tzOffsetHours === 'number') {
      tzOffsetHours = body.tzOffsetHours;
    }
    const chart = computeNatalChart({ date, time: time || null, lat, lng, tzOffsetHours });
    chart.meta.timezone = tz;
    return jsonOk({ chart });
  } catch (e) {
    return jsonErr('chart computation error: ' + e.message, 500);
  }
}

async function handleReportTypes() {
  return jsonOk({ reports: REPORT_TYPES, bundle: BUNDLE });
}

async function userOwnsReport(user, reportType) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const db = await getDb();
  const p = await db.collection('purchases').findOne(
    {
      userId: user.id,
      $or: [{ reportType }, { reportType: 'full-bundle' }],
      status: 'paid',
    },
    { projection: { _id: 1 } }
  );
  return !!p;
}

function normalizeBirthData(bd) {
  if (!bd || !bd.date) return bd;
  if (typeof bd.lat === 'number' && typeof bd.lng === 'number' && (bd.tzOffsetHours == null || bd.tz == null)) {
    const r = resolveBirthTimezone({ date: bd.date, time: bd.time, lat: bd.lat, lng: bd.lng });
    return { ...bd, tz: r.tz, tzOffsetHours: r.offsetHours, tzAbbrev: r.abbrev, isDST: r.isDST };
  }
  return bd;
}

async function handleGenerateReport(body, user) {
  const { reportType } = body || {};
  let { birthData, partnerBirthData } = body || {};
  birthData = normalizeBirthData(birthData);
  partnerBirthData = partnerBirthData ? normalizeBirthData(partnerBirthData) : null;
  if (!reportType || !getReport(reportType)) return jsonErr('invalid reportType');
  if (!birthData?.date) return jsonErr('birthData.date is required');

  if (!user) return jsonErr('Please sign in to generate a report', 401);

  const owns = await userOwnsReport(user, reportType);
  if (!owns) return jsonErr('Payment required for this report', 402);

  try {
    const chart = computeNatalChart({
      date: birthData.date,
      time: birthData.time,
      lat: birthData.lat,
      lng: birthData.lng,
      tzOffsetHours: birthData.tzOffsetHours ?? 0,
    });
    let partnerChart = null;
    if (reportType === 'compatibility' && partnerBirthData?.date) {
      partnerChart = computeNatalChart({
        date: partnerBirthData.date,
        time: partnerBirthData.time,
        lat: partnerBirthData.lat,
        lng: partnerBirthData.lng,
        tzOffsetHours: partnerBirthData.tzOffsetHours ?? 0,
      });
    }

    const messages = buildReportPrompt(reportType, birthData, chart, partnerChart);
    const content = await chat(messages, { temperature: 0.85, max_tokens: 2400 });

    const db = await getDb();
    const reportDoc = {
      id: crypto.randomUUID(),
      userId: user.id,
      userEmail: user.email,
      reportType,
      birthData,
      partnerBirthData: partnerBirthData || null,
      chart,
      partnerChart,
      content,
      createdAt: new Date(),
    };
    await db.collection('reports').insertOne(reportDoc);

    return jsonOk({ id: reportDoc.id, reportType, content, chart, partnerChart });
  } catch (e) {
    console.error('[generate report] error:', e);
    return jsonErr('Report generation failed: ' + e.message, 500);
  }
}

async function handleListReports(user) {
  if (!user) return jsonErr('unauthorized', 401);
  const db = await getDb();
  const query = user.role === 'admin' ? {} : { userId: user.id };
  const docs = await db.collection('reports')
    .find(query, { projection: { id: 1, userEmail: 1, reportType: 1, createdAt: 1, birthData: 1 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  return jsonOk({ reports: docs.map((d) => ({ id: d.id, userEmail: d.userEmail, reportType: d.reportType, createdAt: d.createdAt, birthData: d.birthData })) });
}

async function handleGetReport(id, user) {
  if (!user) return jsonErr('unauthorized', 401);
  const db = await getDb();
  const doc = await db.collection('reports').findOne({ id });
  if (!doc) return jsonErr('not found', 404);
  if (user.role !== 'admin' && doc.userId !== user.id) return jsonErr('forbidden', 403);
  return jsonOk({ report: doc });
}

async function handleMyPurchases(user) {
  if (!user) return jsonErr('unauthorized', 401);
  if (user.role === 'admin') {
    return jsonOk({ purchases: REPORT_TYPES.map((r) => ({ reportType: r.id, status: 'paid', admin: true })) });
  }
  const db = await getDb();
  const purchases = await db.collection('purchases').find({ userId: user.id, status: 'paid' }).toArray();
  return jsonOk({ purchases });
}

async function handleAdminLogin(body) {
  const { email, password } = body || {};
  if (!email || !password) return jsonErr('email and password required');
  const db = await getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user || !user.passwordHash) return jsonErr('Invalid credentials', 401);
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return jsonErr('Invalid credentials', 401);
  setSessionCookie({ id: user.id, email: user.email, role: user.role, name: user.name });
  return jsonOk({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
}

async function handleMagicRequest(body) {
  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) return jsonErr('valid email required');
  const db = await getDb();
  const tokens = db.collection('magic_tokens');
  await tokens.deleteMany({ email });
  const plain = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(plain);
  await tokens.insertOne({ email, tokenHash, createdAt: new Date() });

  const link = `${APP_URL}/auth/magic?token=${plain}`;
  const sent = await sendMagicLinkEmail({ to: email, magicLink: link });

  // In dev, also return the magic link for ease of testing
  const dev = process.env.NODE_ENV !== 'production';
  return jsonOk({ ok: true, sent: !sent?.error, devLink: dev ? link : undefined });
}

async function handleMagicConsume(body) {
  const { token } = body || {};
  if (!token) return jsonErr('token required');
  const db = await getDb();
  const tokens = db.collection('magic_tokens');
  const tokenHash = hashToken(token);
  const doc = await tokens.findOneAndDelete({ tokenHash });
  const val = doc?.value || doc; // mongodb v6 returns directly, v4 returns { value }
  if (!val || !val.email) return jsonErr('Invalid or expired link', 400);
  const ageMs = Date.now() - new Date(val.createdAt).getTime();
  if (ageMs > 10 * 60 * 1000) return jsonErr('Link expired', 400);
  // Find or create user
  const user = await findOrCreateUser(val.email, null, 'user');
  setSessionCookie({ id: user.id, email: user.email, role: user.role, name: user.name });
  return jsonOk({ user: { id: user.id, email: user.email, role: user.role } });
}

async function handleMe(user) {
  return jsonOk({ user });
}

async function handleLogout() {
  clearSessionCookie();
  return jsonOk({ ok: true });
}

async function handleSubscribe(body) {
  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) return jsonErr('valid email required');
  const db = await getDb();
  await db.collection('subscriptions').updateOne(
    { email },
    {
      $set: {
        email,
        name: body.name || null,
        birthData: body.birthData || null,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  return jsonOk({ ok: true });
}

async function handleStripeCheckout(body, user) {
  if (!user) return jsonErr('Please sign in first', 401);
  const { reportType } = body || {};
  let { birthData } = body || {};
  birthData = normalizeBirthData(birthData);
  if (!reportType) return jsonErr('reportType required');

  // Admin bypass: directly mark as paid
  if (user.role === 'admin') {
    const db = await getDb();
    await db.collection('purchases').updateOne(
      { userId: user.id, reportType },
      {
        $set: { userId: user.id, userEmail: user.email, reportType, status: 'paid', admin: true, updatedAt: new Date(), birthData: birthData || null },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    return jsonOk({ url: `${APP_URL}/dashboard?paid=${reportType}&source=admin` });
  }

  // Look up product
  let product;
  if (reportType === 'full-bundle') product = BUNDLE;
  else product = getReport(reportType);
  if (!product) return jsonErr('invalid reportType');

const stripe = getStripe();

try {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.blurb,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${APP_URL}/dashboard?paid=${reportType}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/?canceled=${reportType}`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      userEmail: user.email,
      reportType,
      birthData: birthData ? JSON.stringify(birthData) : '',
    },
  });
    });
    // Pre-record pending purchase to lock birthData
    const db = await getDb();
    await db.collection('purchases').insertOne({
      userId: user.id,
      userEmail: user.email,
      reportType,
      status: 'pending',
      stripeSessionId: session.id,
      birthData: birthData || null,
      createdAt: new Date(),
    });
    return jsonOk({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error('[stripe] create session failed:', e.message);
    return jsonErr('Stripe error: ' + e.message, 500);
  }
}

async function handleStripeVerifySession(body, user) {
  if (!user) return jsonErr('unauthorized', 401);
  const { sessionId } = body || {};
  if (!sessionId) return jsonErr('sessionId required');
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const reportType = session.metadata?.reportType;
      const userId = session.metadata?.userId;
      const birthData = session.metadata?.birthData ? JSON.parse(session.metadata.birthData) : null;
      if (reportType && userId) {
        const db = await getDb();
        await db.collection('purchases').updateOne(
          { userId, reportType },
          {
            $set: {
              userId,
              userEmail: session.metadata.userEmail,
              reportType,
              status: 'paid',
              stripeSessionId: sessionId,
              stripePaymentIntent: session.payment_intent,
              birthData: birthData || null,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
      }
    }
    return jsonOk({ status: session.payment_status });
  } catch (e) {
    return jsonErr('Stripe verify error: ' + e.message, 500);
  }
}

async function handleStripeWebhook(req) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();
  let event;
  try {
    if (webhookSecret && sig) {
      event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // dev: accept unsigned
      event = JSON.parse(rawBody);
    }
  } catch (e) {
    return new NextResponse('Webhook Error: ' + e.message, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const md = session.metadata || {};
    if (md.userId && md.reportType) {
      const db = await getDb();
      await db.collection('purchases').updateOne(
        { userId: md.userId, reportType: md.reportType },
        {
          $set: {
            userId: md.userId,
            userEmail: md.userEmail,
            reportType: md.reportType,
            status: 'paid',
            stripeSessionId: session.id,
            stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    }
  }
  return new NextResponse(null, { status: 200 });
}

async function handleDemoChart(body) {
  const { id } = body || {};
  const celeb = CELEBRITY_CHARTS.find((c) => c.id === id) || CELEBRITY_CHARTS[0];
  const chart = computeNatalChart({ date: celeb.date, time: celeb.time, lat: celeb.lat, lng: celeb.lng, tzOffsetHours: celeb.tzOffsetHours });
  return jsonOk({ celebrity: celeb, chart });
}

// ----------------- Dispatcher -----------------

async function dispatch(req, method) {
  const url = new URL(req.url);
  const pathSegs = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const path = '/' + pathSegs.join('/');

  await ensureSetup();

  // Webhook needs raw body, handle early
  if (method === 'POST' && path === '/stripe/webhook') {
    return handleStripeWebhook(req);
  }

  let body = {};
  if (method === 'POST') {
    try { body = await req.json(); } catch { body = {}; }
  }
  const user = await getCurrentUser();

  // Routing table
  if (method === 'GET' && (path === '' || path === '/')) {
    return jsonOk({ message: 'Cosmic Blueprint API ✨', version: '1.0' });
  }
  if (method === 'GET' && path === '/health') return jsonOk({ ok: true });
  if (method === 'GET' && path === '/report-types') return handleReportTypes();
  if (method === 'GET' && path === '/celebrities') return jsonOk({ celebrities: require('@/lib/natalChart').CELEBRITY_CHARTS });
  if (method === 'GET' && path === '/auth/me') return handleMe(user);
  if (method === 'GET' && path === '/reports') return handleListReports(user);
  if (method === 'GET' && path.startsWith('/reports/')) {
    const id = path.split('/')[2];
    return handleGetReport(id, user);
  }
  if (method === 'GET' && path === '/purchases') return handleMyPurchases(user);

  if (method === 'POST' && path === '/geocode') return handleGeocode(body);
  if (method === 'POST' && path === '/chart') return handleChart(body);
  if (method === 'POST' && path === '/demo-chart') return handleDemoChart(body);
  if (method === 'POST' && path === '/reports/generate') return handleGenerateReport(body, user);
  if (method === 'POST' && path === '/auth/admin/login') return handleAdminLogin(body);
  if (method === 'POST' && path === '/auth/magic/request') return handleMagicRequest(body);
  if (method === 'POST' && path === '/auth/magic/consume') return handleMagicConsume(body);
  if (method === 'POST' && path === '/auth/logout') return handleLogout();
  if (method === 'POST' && path === '/subscribe') return handleSubscribe(body);
  if (method === 'POST' && path === '/stripe/checkout') return handleStripeCheckout(body, user);
  if (method === 'POST' && path === '/stripe/verify') return handleStripeVerifySession(body, user);

  return jsonErr('Not found: ' + method + ' ' + path, 404);
}

export async function GET(req) { return dispatch(req, 'GET'); }
export async function POST(req) { return dispatch(req, 'POST'); }
export async function DELETE(req) { return dispatch(req, 'DELETE'); }
export async function PATCH(req) { return dispatch(req, 'PATCH'); }
export async function PUT(req) { return dispatch(req, 'PUT'); }

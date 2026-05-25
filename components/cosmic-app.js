'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Star, Moon, Sun, Calendar, MapPin, Clock, Download, LogOut, Shield, Heart, Briefcase, DollarSign, Leaf, Zap, TrendingUp, Users, Wand2, Plane, Baby, Loader2, Lock, Mail, Eye, ScrollText } from 'lucide-react';
import NatalWheel from '@/components/natal-wheel';

const ICON_MAP = {
  'natal-chart': Sparkles,
  'love-romance': Heart,
  'career-vocation': Briefcase,
  'wealth-finance': DollarSign,
  'health-wellness': Leaf,
  'life-purpose': Wand2,
  'year-ahead': TrendingUp,
  'monthly-horoscope': Moon,
  'compatibility': Users,
  'past-life': Star,
  'spiritual-growth': Zap,
  'family-children': Baby,
  'travel-relocation': Plane,
};

function StarsBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0420] via-[#1a0848] to-[#0a0420]" />
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(2px 2px at 40px 70px, white, transparent), radial-gradient(1px 1px at 50px 160px, white, transparent), radial-gradient(2px 2px at 90px 40px, #f0abfc, transparent), radial-gradient(1px 1px at 130px 80px, white, transparent), radial-gradient(2px 2px at 160px 120px, #a5b4fc, transparent)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
      }} />
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[160px]" />
      <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/15 blur-[140px]" />
    </div>
  );
}

function NavBar({ user, onLogout, onLogin }) {
  return (
    <nav className="relative z-20 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">Cosmic Blueprint</span>
        </a>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'admin' && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
              <span className="hidden md:inline text-sm text-slate-300">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-300 hover:text-white hover:bg-white/10">
                <LogOut className="w-4 h-4 mr-1.5" /> Sign out
              </Button>
            </>
          ) : (
            <Button onClick={onLogin} variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
              <Lock className="w-4 h-4 mr-1.5" /> Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero({ onScrollToForm }) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-fuchsia-200 mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Powered by GPT-4o astrology intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
          <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">Discover your</span>
          <br />
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">Cosmic Blueprint</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
          A precise natal chart, an interactive wheel, and <span className="text-fuchsia-200 font-medium">13 deeply personalized reports</span> — generated from your unique birth data.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" onClick={onScrollToForm} className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white shadow-lg shadow-fuchsia-500/30">
            <Star className="w-4 h-4 mr-2" /> Generate my chart
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
            <Eye className="w-4 h-4 mr-2" /> See a demo chart
          </Button>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-fuchsia-300" /> Accurate ephemeris</span>
          <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-violet-300" /> 10 planets + Asc/MC</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-pink-300" /> Whole-sign houses</span>
          <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-300" /> Major aspects</span>
        </div>
      </div>
    </section>
  );
}

function LocationInput({ value, onChange, onPicked }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useRef(null);
  useEffect(() => { setQuery(value || ''); }, [value]);

  async function search(q) {
    if (!q || q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/geocode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: q }) });
      const d = await r.json();
      setResults(d.results || []);
      setOpen(true);
    } catch { /* ignore */ }
    setLoading(false);
  }
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          placeholder="City, Country"
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); clearTimeout(t.current); t.current = setTimeout(() => search(e.target.value), 400); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-slate-500"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400 animate-spin" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-[#1a0f3e] border border-white/15 rounded-md shadow-xl max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button key={i} onClick={() => { setQuery(r.display_name); setOpen(false); onPicked(r); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 border-b border-white/5 last:border-0">
              <div className="text-slate-100">{r.display_name}</div>
              <div className="text-xs text-slate-400">{r.lat.toFixed(3)}, {r.lng.toFixed(3)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartForm({ onComputed, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [lat, setLat] = useState(initialData?.lat ?? null);
  const [lng, setLng] = useState(initialData?.lng ?? null);
  const [tzOffset, setTzOffset] = useState(initialData?.tzOffsetHours ?? 0);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!date) { toast.error('Please enter a birth date'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/chart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, time: time || null, lat, lng, tzOffsetHours: parseFloat(tzOffset) || 0 }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'failed');
      const birthData = { name, date, time, location, lat, lng, tzOffsetHours: parseFloat(tzOffset) || 0 };
      onComputed({ chart: d.chart, birthData });
      toast.success('Chart generated ✨');
    } catch (err) {
      toast.error('Chart computation failed: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-200">Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-white/5 border-white/15 text-white placeholder:text-slate-500" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-200">Birth date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="pl-9 bg-white/5 border-white/15 text-white" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-200">Birth time <span className="text-slate-400 text-xs">(optional but recommended)</span></Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-9 bg-white/5 border-white/15 text-white" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-200">Time zone offset (hours from UTC)</Label>
          <Input type="number" step="0.5" value={tzOffset} onChange={(e) => setTzOffset(e.target.value)} placeholder="e.g. -5, 0, 5.5" className="bg-white/5 border-white/15 text-white placeholder:text-slate-500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-slate-200">Birth place</Label>
        <LocationInput value={location} onChange={setLocation} onPicked={(p) => { setLocation(p.display_name); setLat(p.lat); setLng(p.lng); }} />
        {lat != null && (<p className="text-xs text-slate-400">📍 {lat.toFixed(3)}, {lng.toFixed(3)}</p>)}
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white">
        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating the heavens…</>) : (<><Sparkles className="w-4 h-4 mr-2" /> Generate my chart</>)}
      </Button>
    </form>
  );
}

function PlanetCard({ planet }) {
  const Icon = planet.name === 'Sun' ? Sun : planet.name === 'Moon' ? Moon : Star;
  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-fuchsia-300" />
          <span className="font-medium text-slate-100">{planet.name}</span>
        </div>
        {planet.house && <span className="text-xs text-slate-400">H{planet.house}</span>}
      </div>
      <div className="text-2xl font-semibold bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">{planet.sign}</div>
      <div className="text-xs text-slate-400 mt-1">{planet.degreeInSign.toFixed(2)}°</div>
    </div>
  );
}

function ChartDisplay({ chart, birthData }) {
  if (!chart) return null;
  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">{birthData?.name ? `${birthData.name}'s Natal Chart` : 'Your Natal Chart'}</CardTitle>
          <CardDescription className="text-slate-300">
            {birthData?.date}{birthData?.time ? ` · ${birthData.time}` : ''}{birthData?.location ? ` · ${birthData.location}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <NatalWheel chart={chart} size={420} />
          </div>
          {chart.ascendant && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-3">
                <div className="text-xs text-fuchsia-200">Ascendant</div>
                <div className="text-lg font-semibold text-white">{chart.ascendant.sign} {chart.ascendant.degreeInSign.toFixed(1)}°</div>
              </div>
              {chart.midheaven && (
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
                  <div className="text-xs text-violet-200">Midheaven</div>
                  <div className="text-lg font-semibold text-white">{chart.midheaven.sign} {chart.midheaven.degreeInSign.toFixed(1)}°</div>
                </div>
              )}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="text-xs text-amber-200">Sun Sign</div>
                <div className="text-lg font-semibold text-white">{chart.planets.find(p => p.name==='Sun')?.sign}</div>
              </div>
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
                <div className="text-xs text-sky-200">Moon Sign</div>
                <div className="text-lg font-semibold text-white">{chart.planets.find(p => p.name==='Moon')?.sign}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {chart.planets.map((p) => <PlanetCard key={p.name} planet={p} />)}
          </div>
          {chart.aspects?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-200 mb-3">Major Aspects</h3>
              <div className="flex flex-wrap gap-2">
                {chart.aspects.slice(0, 18).map((a, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {a.p1} {a.aspect.toLowerCase()} {a.p2} <span className="text-slate-500">({a.orb}°)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportTypes({ reportTypes, bundle, onBuy, owned, user, generating }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1">Choose your reading</h2>
          <p className="text-sm text-slate-400">Each report is uniquely generated from your chart by GPT-4o.</p>
        </div>
        {user?.role === 'admin' && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">Admin: all reports free</span>
        )}
      </div>
      {/* Bundle */}
      <Card className="bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 border-fuchsia-400/30 backdrop-blur-xl mb-6">
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">🌌 {bundle.name} <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500 text-white">Best value</span></h3>
            <p className="text-sm text-slate-200 mt-1">{bundle.blurb}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${(bundle.price/100).toFixed(2)}</div>
              <div className="text-xs text-slate-300 line-through">${(reportTypes.reduce((s, r) => s + r.price, 0) / 100).toFixed(2)}</div>
            </div>
            <Button onClick={() => onBuy(bundle.id)} disabled={generating} className="bg-white text-violet-700 hover:bg-slate-100">
              {user?.role === 'admin' ? 'Unlock all' : 'Get the bundle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((r) => {
          const Icon = ICON_MAP[r.id] || Sparkles;
          const isOwned = owned.includes(r.id);
          return (
            <Card key={r.id} className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-fuchsia-400/30 hover:bg-white/[0.07] transition group">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center mb-2 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-base">{r.name}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">{r.blurb}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="text-lg font-semibold text-white">${(r.price/100).toFixed(2)}</div>
                {isOwned ? (
                  <Button size="sm" onClick={() => onBuy(r.id)} disabled={generating} variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ScrollText className="w-4 h-4 mr-1.5" /> Generate</>}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onBuy(r.id)} disabled={generating} className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white">
                    {user?.role === 'admin' ? 'Generate free' : 'Unlock'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ReportView({ report, onClose }) {
  function downloadPdf() {
    if (typeof window === 'undefined') return;
    import('html2pdf.js').then((html2pdf) => {
      const el = document.getElementById('report-content');
      if (!el) return;
      html2pdf.default().set({
        margin: 12,
        filename: `cosmic-blueprint-${report.reportType}.pdf`,
        html2canvas: { scale: 2, backgroundColor: '#0a0420' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(el).save();
    }).catch(e => toast.error('PDF failed: ' + e.message));
  }
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-white">{report.reportType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</CardTitle>
          <CardDescription className="text-slate-400">Generated {new Date(report.createdAt || Date.now()).toLocaleString()}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadPdf} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
            <Download className="w-4 h-4 mr-1.5" /> PDF
          </Button>
          {onClose && <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">Close</Button>}
        </div>
      </CardHeader>
      <CardContent>
        <article id="report-content" className="prose prose-invert max-w-none text-slate-100 leading-relaxed whitespace-pre-line">
          {report.content}
        </article>
      </CardContent>
    </Card>
  );
}

function AuthDialog({ open, onOpenChange, onSignedIn }) {
  const [tab, setTab] = useState('magic');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  async function submitMagic(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/auth/magic/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMagicSent(true);
      if (d.devLink) setDevLink(d.devLink);
      toast.success('Magic link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }
  async function submitAdmin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/auth/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pwd }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success('Welcome back, ' + (d.user.name || d.user.email));
      onSignedIn(d.user);
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a0f3e] border-white/15 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to Cosmic Blueprint</DialogTitle>
          <DialogDescription className="text-slate-400">Save your charts and access purchased reports.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5 border border-white/10 w-full">
            <TabsTrigger value="magic" className="flex-1 data-[state=active]:bg-fuchsia-500/30 data-[state=active]:text-white">Magic link</TabsTrigger>
            <TabsTrigger value="admin" className="flex-1 data-[state=active]:bg-fuchsia-500/30 data-[state=active]:text-white">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="magic" className="mt-4">
            {magicSent ? (
              <div className="text-sm text-slate-300 space-y-2">
                <p>✨ Check your email at <span className="text-white font-medium">{email}</span> — your sign-in link expires in 10 minutes.</p>
                {devLink && (
                  <div className="mt-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-100 text-xs break-all">
                    <p className="font-medium mb-1">DEV — quick link:</p>
                    <a href={devLink} className="underline">{devLink}</a>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={submitMagic} className="space-y-3">
                <div>
                  <Label className="text-slate-200">Email</Label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/15 text-white" placeholder="you@example.com" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />} Send magic link
                </Button>
              </form>
            )}
          </TabsContent>
          <TabsContent value="admin" className="mt-4">
            <form onSubmit={submitAdmin} className="space-y-3">
              <div>
                <Label className="text-slate-200">Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/15 text-white" placeholder="admin@cosmicblueprint.com" />
              </div>
              <div>
                <Label className="text-slate-200">Password</Label>
                <Input type="password" required value={pwd} onChange={e => setPwd(e.target.value)} className="bg-white/5 border-white/15 text-white" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />} Sign in as admin
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SubscribeSection({ defaultEmail, defaultName, defaultBirthData }) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: defaultName, birthData: defaultBirthData }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
      toast.success('Subscribed ✨ We\'ll save your chart for future use.');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  }
  return (
    <Card className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 border-fuchsia-400/20 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">📬 Subscribe to save your blueprint</h3>
            <p className="text-sm text-slate-300 mt-1">We'll keep your chart and reports for future readings.</p>
          </div>
          {done ? (
            <p className="text-sm text-emerald-300">✓ You're subscribed</p>
          ) : (
            <form onSubmit={submit} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
              <Input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/15 text-white placeholder:text-slate-500" />
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CosmicAppInner() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [chart, setChart] = useState(null);
  const [birthData, setBirthData] = useState(null);
  const [reportTypes, setReportTypes] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [owned, setOwned] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [demoChart, setDemoChart] = useState(null);
  const [demoCeleb, setDemoCeleb] = useState(null);
  const formRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => d.user && setUser(d.user)).catch(() => {});
    fetch('/api/report-types').then(r => r.json()).then(d => { setReportTypes(d.reports || []); setBundle(d.bundle); });
  }, []);

  useEffect(() => {
    if (user) fetch('/api/purchases').then(r => r.json()).then(d => setOwned((d.purchases || []).map(p => p.reportType)));
    else setOwned([]);
  }, [user]);

  // Handle Stripe success redirect
  useEffect(() => {
    const sid = searchParams.get('session_id');
    const paid = searchParams.get('paid');
    if (sid) {
      fetch('/api/stripe/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid }) })
        .then(r => r.json()).then(() => {
          toast.success('Payment successful — your report is unlocked!');
          fetch('/api/purchases').then(r => r.json()).then(d => setOwned((d.purchases || []).map(p => p.reportType)));
        });
      router.replace('/');
    } else if (paid) {
      toast.success('Unlocked!');
      fetch('/api/purchases').then(r => r.json()).then(d => setOwned((d.purchases || []).map(p => p.reportType)));
      router.replace('/');
    }
  }, [searchParams]);

  function scrollForm() { formRef.current?.scrollIntoView({ behavior: 'smooth' }); }

  async function loadDemo(id) {
    const r = await fetch('/api/demo-chart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const d = await r.json();
    if (r.ok) { setDemoChart(d.chart); setDemoCeleb(d.celebrity); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOwned([]);
    toast.success('Signed out');
  }

  async function generateReport(reportType) {
    if (!chart || !birthData) { toast.error('Generate your chart first'); scrollForm(); return; }
    if (!user) { setAuthOpen(true); toast.message('Please sign in first'); return; }
    setGenerating(true);
    try {
      // Admin: directly mark as paid then generate
      if (user.role === 'admin' && !owned.includes(reportType)) {
        const r0 = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportType, birthData }) });
        if (!r0.ok) { const d0 = await r0.json(); throw new Error(d0.error); }
        setOwned(prev => Array.from(new Set([...prev, reportType])));
      }
      const r = await fetch('/api/reports/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportType, birthData }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setActiveReport({ ...d, createdAt: new Date() });
      toast.success('Your reading is ready ✨');
      setTimeout(() => document.getElementById('active-report')?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (err) { toast.error('Failed: ' + err.message); }
    setGenerating(false);
  }

  async function handleBuy(reportType) {
    if (!chart || !birthData) { toast.error('Generate your chart first'); scrollForm(); return; }
    if (!user) { setAuthOpen(true); toast.message('Please sign in first'); return; }
    if (owned.includes(reportType) || user.role === 'admin') return generateReport(reportType);
    setGenerating(true);
    try {
      const r = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportType, birthData }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      window.location.href = d.url;
    } catch (err) { toast.error('Stripe error: ' + err.message); setGenerating(false); }
  }

  return (
    <div className="relative min-h-screen">
      <StarsBg />
      <NavBar user={user} onLogout={logout} onLogin={() => setAuthOpen(true)} />
      <Hero onScrollToForm={scrollForm} />

      {/* Form */}
      <section ref={formRef} className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Your birth details</CardTitle>
            <CardDescription className="text-slate-400">All data stays private. Time zone offset = hours from UTC at birth (e.g. -5 for EST).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartForm onComputed={({ chart, birthData }) => { setChart(chart); setBirthData(birthData); setTimeout(() => document.getElementById('chart-view')?.scrollIntoView({ behavior: 'smooth' }), 200); }} initialData={birthData} />
          </CardContent>
        </Card>
      </section>

      {/* Chart */}
      {chart && (
        <section id="chart-view" className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
          <ChartDisplay chart={chart} birthData={birthData} />
        </section>
      )}

      {/* Reports catalog */}
      {chart && reportTypes.length > 0 && bundle && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
          <ReportTypes reportTypes={reportTypes} bundle={bundle} onBuy={handleBuy} owned={owned} user={user} generating={generating} />
        </section>
      )}

      {/* Active report */}
      {activeReport && (
        <section id="active-report" className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
          <ReportView report={activeReport} onClose={() => setActiveReport(null)} />
        </section>
      )}

      {/* Subscribe */}
      {chart && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
          <SubscribeSection defaultEmail={user?.email} defaultName={birthData?.name} defaultBirthData={birthData} />
        </section>
      )}

      {/* Demo section */}
      <section id="demo" className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5" /> Demo: famous birth charts</CardTitle>
            <CardDescription className="text-slate-400">Try a celebrity chart to see what your reading might look like.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" onClick={() => loadDemo('einstein')} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">Albert Einstein</Button>
              <Button variant="outline" onClick={() => loadDemo('beyonce')} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">Beyoncé</Button>
              <Button variant="outline" onClick={() => loadDemo('gandhi')} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">Mahatma Gandhi</Button>
            </div>
            {demoChart && demoCeleb && (
              <div>
                <p className="text-sm text-slate-300 mb-3">{demoCeleb.name} · {demoCeleb.date} {demoCeleb.time} · {demoCeleb.location}</p>
                <div className="flex justify-center"><NatalWheel chart={demoChart} size={360} /></div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="relative z-10 text-center text-xs text-slate-500 py-8 border-t border-white/5">
        Cosmic Blueprint · Built with care · Powered by GPT-4o, astronomy-engine, Stripe, Resend
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSignedIn={setUser} />
    </div>
  );
}

export default function CosmicApp() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <CosmicAppInner />
    </Suspense>
  );
}

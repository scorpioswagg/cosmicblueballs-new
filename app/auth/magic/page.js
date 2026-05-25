'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ConsumePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sp.get('token');
    if (!token) { setStatus('error'); setError('Missing token.'); return; }
    fetch('/api/auth/magic/consume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Invalid link');
        setStatus('success');
        setTimeout(() => router.push('/'), 1200);
      })
      .catch((e) => { setStatus('error'); setError(e.message); });
  }, [sp, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-[#0a0420] to-[#1a0848]">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        {status === 'verifying' && (
          <>
            <h1 className="text-xl font-semibold text-white mb-2">Verifying your link…</h1>
            <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400 mx-auto mt-3" />
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-white mb-2">You're signed in ✨</h1>
            <p className="text-sm text-slate-300">Redirecting to your dashboard…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-white mb-2">Link error</h1>
            <p className="text-sm text-slate-300 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-fuchsia-500 to-violet-500">Back to home</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function MagicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <ConsumePage />
    </Suspense>
  );
}

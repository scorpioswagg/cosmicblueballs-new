import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Cosmic Blueprint — Discover Your Natal Chart',
  description: 'AI-powered astrology readings, beautifully personalized. 13 deep reports drawn from your unique birth chart.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0420] text-slate-100 antialiased">
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}

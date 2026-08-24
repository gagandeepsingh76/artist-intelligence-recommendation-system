import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'AIRS — Artist Intelligence & Recommendation Console',
  description: 'Evidence-backed decision intelligence platform for creative artists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 flex min-h-screen antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

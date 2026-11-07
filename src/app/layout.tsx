import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'I Gede Arya Krisnanda Sutasoma | Personal Portfolio',
  description:
    'Portfolio resmi I Gede Arya Krisnanda Sutasoma — Mahasiswa S1 Kedokteran FK Undiksha, full-stack & mobile software engineer, perancang sistem UI/UX, dan peneliti PKM/karya ilmiah.',
  authors: [{ name: 'I Gede Arya Krisnanda Sutasoma', url: 'https://github.com/sutasomakrisnanda' }],
  keywords: [
    'I Gede Arya Krisnanda Sutasoma',
    'Arya Krisnanda',
    'Portfolio',
    'S1 Kedokteran Undiksha',
    'Full-Stack Developer',
    'Laravel',
    'Next.js',
    'React',
    'TypeScript',
    'UI/UX Design',
    'PKM-PM',
    'BSO Hermestha',
    'HMJ Kedokteran',
    'Bali',
    'Software Engineer'
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://sutasomakrisnanda.github.io',
    siteName: 'Arya Krisnanda Portfolio',
    title: 'I Gede Arya Krisnanda Sutasoma | Multi-Mode Portfolio',
    description:
      'Mahasiswa S1 Kedokteran FK Undiksha, full-stack engineer, UI/UX designer, dan peneliti PKM/karya ilmiah.'
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body antialiased selection:bg-white selection:text-slate-950`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

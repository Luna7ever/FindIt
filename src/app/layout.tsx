import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.findit-us.workers.dev';

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: 'ETHOS | منظومة النزاهة والمشاركة المدرسية وحفظ الأمانات',
    template: '%s | ETHOS',
  },
  description: 'المنظومة السلوكية الذكية لترسيخ قيم النزاهة والمشاركة المدرسية وحفظ الأمانات واسترداد المقتنيات.',
  applicationName: 'ETHOS',
  authors: [{ name: 'ETHOS Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ETHOS | منظومة النزاهة والمشاركة المدرسية',
    description: 'المنظومة السلوكية الذكية لترسيخ قيم النزاهة والمشاركة المدرسية وحفظ الأمانات.',
    url: appBaseUrl,
    siteName: 'ETHOS',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ETHOS | منظومة النزاهة والمشاركة المدرسية',
    description: 'المنظومة السلوكية الذكية لترسيخ قيم النزاهة والمشاركة المدرسية وحفظ الأمانات.',
  },
  appleWebApp: {
    capable: true,
    title: 'ETHOS',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#176B5B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibmPlexArabic.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('findit_theme_v4');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (savedTheme !== 'light' && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var savedLang = localStorage.getItem('findit_language_v4');
                  if (savedLang === 'en') {
                    document.documentElement.lang = 'en';
                    document.documentElement.dir = 'ltr';
                  } else if (savedLang === 'ar') {
                    document.documentElement.lang = 'ar';
                    document.documentElement.dir = 'rtl';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F7F7F4] dark:bg-[#0D1412] text-[#18201D] dark:text-[#F0F4F2] font-sans antialiased selection:bg-[#E6F1ED] selection:text-[#176B5B]">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}

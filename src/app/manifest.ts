import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ETHOS — منظومة النزاهة والمشاركة المدرسية وحفظ الأمانات',
    short_name: 'ETHOS',
    description: 'المنظومة السلوكية الذكية لترسيخ قيم النزاهة والمشاركة المدرسية وحفظ الأمانات.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F7F4',
    theme_color: '#176B5B',
    dir: 'rtl',
    lang: 'ar',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

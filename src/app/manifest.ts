import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FindIt — منصة مفقودات المدرسة',
    short_name: 'FindIt',
    description: 'منصة ذكية لمساعدة طلاب المدرسة على العثور على المفقودات واستردادها بأمان.',
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

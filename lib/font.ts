// src/ui/fonts.ts or similar

import localFont from 'next/font/local';

export const SnellFont = localFont({
  src: [
    {
      path: '../public/fonts/snellroundhand_black.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/snellroundhand_bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-snell', // Define a CSS variable name
  display: 'swap',
});

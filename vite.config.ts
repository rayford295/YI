import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  base: '/',
  plugins: [
    // Clean paths on a static host: GitHub Pages answers any unknown path with 404.html, so a copy
    // of the app shell there lets /cs or /sync?c=J7A open the app directly (see src/core/router.ts).
    { name: 'spa-404', closeBundle() { copyFileSync('dist/index.html', 'dist/404.html'); } },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'YI · 仪见钟情',
        short_name: 'YI',
        description: 'A journey of levels for two people.',
        lang: 'zh-CN',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf4ee',
        theme_color: '#102e49',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell is precached; photos, rings and the hand model are fetched on demand and
        // then kept, so the 21 MB MediaPipe bundle never downloads at install time.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['**/media/**', '**/mediapipe/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.includes('/media/') || url.pathname.includes('/mediapipe/'),
            handler: 'CacheFirst', options: { cacheName: 'yi-media', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate', options: { cacheName: 'yi-fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
            handler: 'CacheFirst', options: { cacheName: 'yi-tiles', expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 } } },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
});

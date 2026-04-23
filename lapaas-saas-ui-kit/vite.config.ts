import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Lapaas OS - Founder Productivity',
        short_name: 'Lapaas OS',
        description: 'Your Personal Productivity Command Center - Smart time-blocking, meeting management, and interruption firewall.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'My Week',
            short_name: 'My Week',
            url: '/founder-os?tab=overview',
            icons: [{ src: '/icons/icon.svg', sizes: '96x96' }]
          },
          {
            name: 'Meetings',
            short_name: 'Meetings',
            url: '/founder-os?tab=meetings',
            icons: [{ src: '/icons/icon.svg', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/localhost:3000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: 'localhost',
    open: false,
    hmr: {
      protocol: 'http',
      host: 'localhost',
      port: 5174,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});

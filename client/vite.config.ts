import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Muestra aviso para actualizar
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cancionero San Francisco',
        short_name: 'Cancionero',
        description: 'Cancionero Católico San Francisco',
        theme_color: '#1a1a1a', // Ajusta según tu diseño (modo oscuro o color principal ej: #ED8C2F)
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cambia la ruta según apunte tu hook useCanciones a la API
            urlPattern: /^https:\/\/cancionero-web-api\.vercel\.app\/api\/canciones/, // Reemplazar con URL real
            handler: 'NetworkFirst', // NetworkFirst devuelve datos frescos y si estás offline, busca en local
            options: {
              cacheName: 'api-canciones-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // Cachear 30 días
              },
              cacheableResponse: {
                statuses: [0, 200] // Importante para respuestas opacas u OK
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0' // o host: true
  }
})

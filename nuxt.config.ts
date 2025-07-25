// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-24',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/web-vitals'
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000',
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3001',
    }
  },
  nitro: {
    experimental: {
      wasm: true
    },
    storage: {
      redis: {
        driver: 'redis',
        // Redis configuration for caching
      }
    }
  },
  ssr: true,
  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    viewTransition: true
  },
  // Build optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'pinia'],
            socket: ['socket.io-client'],
            utils: ['@vueuse/core']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['socket.io-client', '@vueuse/core']
    }
  },
  // App performance settings
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      charset: 'utf-8'
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  // Route rules for caching
  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/collect': { ssr: false }, // SPA mode for interactive pages
    '/inventory': { ssr: false },
    '/skills': { ssr: false }
  }
})
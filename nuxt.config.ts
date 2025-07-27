// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth'
  ],
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'local'
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    public: {
      authUrl: process.env.NUXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  css: ['~/assets/css/main.css']
})
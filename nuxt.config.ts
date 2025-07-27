// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',

  ],
runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    public: {
      authUrl: process.env.NUXT_PUBLIC_AUTH_URL || ''
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  css: ['~/assets/css/main.css']
})
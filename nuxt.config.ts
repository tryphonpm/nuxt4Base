// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  srcDir: 'app/',
  modules: ['@nuxt/ui', 'nuxt-mongoose'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark'
  },
  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: 'server/models',
    devtools: true
  }
})
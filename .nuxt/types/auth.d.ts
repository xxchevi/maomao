declare module '#auth' {
  const getServerSession: typeof import('D:/demo/maomao4/node_modules/@sidebase/nuxt-auth/dist/runtime/server/services').getServerSession
  const getToken: typeof import('D:/demo/maomao4/node_modules/@sidebase/nuxt-auth/dist/runtime/server/services').getToken
  const NuxtAuthHandler: typeof import('D:/demo/maomao4/node_modules/@sidebase/nuxt-auth/dist/runtime/server/services').NuxtAuthHandler
interface SessionData {
  id: string | number
}
}
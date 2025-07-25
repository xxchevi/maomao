export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 如果用户已登录，重定向到首页
  if (authStore.isLoggedIn) {
    return navigateTo('/')
  }
})
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 如果用户未登录，重定向到登录页
  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
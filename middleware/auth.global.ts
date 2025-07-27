export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // 排除登录和注册页面的认证检查
  if (to.path === '/login' || to.path === '/register') {
    return
  }
  
  // 在服务端和客户端都检查认证状态
  await authStore.checkAuth()
  
  // 如果用户未登录，重定向到登录页面
  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
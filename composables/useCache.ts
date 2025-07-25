import { ref, reactive } from 'vue'

interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

class CacheManager {
  private cache = new Map<string, CacheItem>()
  private stats = reactive<CacheStats>({
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0
  })
  
  constructor(private namespace: string) {}
  
  set(key: string, data: any, ttl: number = 300000): void {
    const fullKey = `${this.namespace}:${key}`
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    }
    
    this.cache.set(fullKey, item)
    this.updateStats()
  }
  
  get(key: string): any {
    const fullKey = `${this.namespace}:${key}`
    const item = this.cache.get(fullKey)
    
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }
    
    const age = Date.now() - item.timestamp
    if (age > item.ttl) {
      this.cache.delete(fullKey)
      this.stats.misses++
      this.updateStats()
      return null
    }
    
    this.stats.hits++
    this.updateHitRate()
    return item.data
  }
  
  has(key: string): boolean {
    const fullKey = `${this.namespace}:${key}`
    const item = this.cache.get(fullKey)
    
    if (!item) return false
    
    const age = Date.now() - item.timestamp
    if (age > item.ttl) {
      this.cache.delete(fullKey)
      this.updateStats()
      return false
    }
    
    return true
  }
  
  delete(key: string): boolean {
    const fullKey = `${this.namespace}:${key}`
    const result = this.cache.delete(fullKey)
    this.updateStats()
    return result
  }
  
  clear(): void {
    // 只清除当前命名空间的缓存
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`${this.namespace}:`)
    )
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.updateStats()
  }
  
  clearExpired(): number {
    const now = Date.now()
    let clearedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(`${this.namespace}:`)) {
        const age = now - item.timestamp
        if (age > item.ttl) {
          this.cache.delete(key)
          clearedCount++
        }
      }
    }
    
    this.updateStats()
    return clearedCount
  }
  
  getStats(): CacheStats {
    return { ...this.stats }
  }
  
  size(): number {
    return Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`${this.namespace}:`)
    ).length
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys())
      .filter(key => key.startsWith(`${this.namespace}:`))
      .map(key => key.replace(`${this.namespace}:`, ''))
  }
  
  private updateStats(): void {
    this.stats.size = this.size()
  }
  
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
}

// 全局缓存实例管理
const cacheInstances = new Map<string, CacheManager>()

export const useCache = (namespace: string = 'default') => {
  if (!cacheInstances.has(namespace)) {
    cacheInstances.set(namespace, new CacheManager(namespace))
  }
  
  const cache = cacheInstances.get(namespace)!
  
  // 缓存辅助函数
  const memoize = <T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      let result = cache.get(key)
      if (result === null) {
        result = fn(...args)
        cache.set(key, result, ttl)
      }
      
      return result
    }
  }
  
  // 异步缓存函数
  const asyncMemoize = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ) => {
    const pendingPromises = new Map<string, Promise<any>>()
    
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      // 检查缓存
      let result = cache.get(key)
      if (result !== null) {
        return result
      }
      
      // 检查是否有正在进行的请求
      if (pendingPromises.has(key)) {
        return pendingPromises.get(key)!
      }
      
      // 执行函数并缓存结果
      const promise = fn(...args).then(result => {
        cache.set(key, result, ttl)
        pendingPromises.delete(key)
        return result
      }).catch(error => {
        pendingPromises.delete(key)
        throw error
      })
      
      pendingPromises.set(key, promise)
      return promise
    }
  }
  
  // 定期清理过期缓存
  const startAutoCleanup = (interval: number = 60000) => {
    const cleanup = () => {
      const cleared = cache.clearExpired()
      if (cleared > 0) {
        console.log(`[Cache:${namespace}] 清理了 ${cleared} 个过期缓存项`)
      }
    }
    
    const intervalId = setInterval(cleanup, interval)
    
    return () => clearInterval(intervalId)
  }
  
  return {
    cache,
    memoize,
    asyncMemoize,
    startAutoCleanup
  }
}

// 全局缓存管理
export const useCacheManager = () => {
  const getAllStats = () => {
    const stats: Record<string, CacheStats> = {}
    for (const [namespace, cache] of cacheInstances.entries()) {
      stats[namespace] = cache.getStats()
    }
    return stats
  }
  
  const clearAllCaches = () => {
    for (const cache of cacheInstances.values()) {
      cache.clear()
    }
  }
  
  const clearExpiredInAllCaches = () => {
    let totalCleared = 0
    for (const cache of cacheInstances.values()) {
      totalCleared += cache.clearExpired()
    }
    return totalCleared
  }
  
  return {
    getAllStats,
    clearAllCaches,
    clearExpiredInAllCaches,
    cacheInstances: Array.from(cacheInstances.keys())
  }
}

export default useCache
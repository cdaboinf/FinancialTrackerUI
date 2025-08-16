// src/services/CacheService.ts

export default class CacheService {
  static set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  static get(key: string): any | null {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  static remove(key: string) {
    localStorage.removeItem(key)
  }

  static clearAll() {
    localStorage.clear()
  }
}

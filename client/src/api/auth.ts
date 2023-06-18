import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export class Auth {
  private paths: string[] = ['/signin', '/signup']

  constructor() {}

  public attemptAuth() {
    return async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const userStore = useUserStore()
      const { getUser } = userStore
      const { user, error } = storeToRefs(userStore)
      if (user.value?.username) return next()

      if (this.paths.includes(to.path) && this.paths.includes(from.path)) return next()

      try {
        await getUser()

        if (error.value.message || !user.value?.username) {
          if (this.paths.includes(to.path)) return next()

          if (error.value.statusCode === 401) {
            return next('/signin')
          }

          return next(false)
        }

        if (this.paths.includes(to.path)) return next('/chat')

        next()
      } catch {
        if (this.paths.includes(to.path)) return next()
        next(false)
      }
    }
  }
}

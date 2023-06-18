import { createRouter, createWebHistory } from 'vue-router'
import { Auth } from '@/api/auth'

const auth = new Auth()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to) => {
    if (to.meta['scroll-bottom']) {
      return { bottom: 0 }
    }

    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: { name: 'SignIn' }
    },
    {
      path: '/signin',
      name: 'SignIn',
      beforeEnter: auth.attemptAuth(),
      component: () => import('../views/SignIn/SignInView.vue')
    },
    {
      path: '/signup',
      name: 'SignUp',
      beforeEnter: auth.attemptAuth(),
      component: () => import('../views/SignUp/SignUpView.vue')
    },
    {
      path: '/chat',
      meta: {
        auth: true
      },
      beforeEnter: auth.attemptAuth(),
      component: () => import('../views/Chat/ChatView.vue'),
      children: [
        {
          path: ':id',
          meta: {
            auth: true,
            'scroll-bottom': true
          },
          component: () => import('../views/ChatRoom/ChatRoomView.vue')
        }
      ]
    }
  ]
})

export default router

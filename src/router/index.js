import { createRouter, createWebHistory } from 'vue-router'
import Heroes from '../views/Heroes.vue'
import HeroDetail from '../views/HeroDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/heroes',
      name: 'heroes',
      component: Heroes
    },
    {
      path: '/heroes',
      name: 'Heroes',
      component: Heroes
    },
    {
      path: '/hero/:heroId',
      name: 'heroDetail',
      component: HeroDetail
    }
  ]
})

export default router

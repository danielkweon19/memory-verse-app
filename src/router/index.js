import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PeaceWithGodVue from '../views/PeaceWithGod.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/peace-with-God',
      name: 'peacewithGod',
      component: PeaceWithGodVue
    }
  ]
})

export default router

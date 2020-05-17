import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Gallery from '../views/Gallery.vue'

import Rubric from '../components/rubric.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/i'
  },
  {
    path: '/i',
    name: 'Gallery',
    component: Gallery,
    children: [
      {
        path: 'rubric',
        component: Rubric
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

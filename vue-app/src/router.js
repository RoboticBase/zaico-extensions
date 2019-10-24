import Vue from 'vue'
import Router from 'vue-router'
import Stocks from '@/views/Stocks.vue'
import Detail from '@/views/Detail.vue'
import Cart from '@/views/Cart.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(Router)
Vue.use(BootstrapVue)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/stocks'
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: Stocks
    },
    {
      path: '/detail',
      name: 'detail',
      component: Detail
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart
    }
  ]
})

import "@/plugins/veevalidate"
import Vue from 'vue'
import vuetify from '../plugins/vuetify'
import App from './App.vue'
import { router } from '@/plugins/router'

const app = new Vue({
  el: '#app',
  vuetify,
  router,
  render: (h) => h(App),
})

export default app

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './utils/axios'
import iView from 'iview';
import 'iview/dist/styles/iview.css';    // 使用 CSS
import './assets/style/base-dark.scss';
import './assets/style/base-light.scss';
import './assets/style/theme.scss';

Vue.config.productionTip = false
Vue.use(iView);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

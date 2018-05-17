import 'babel-polyfill';
import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';

import eventHub from '@/plugins/event-hub';
import router from './routes';
import '@/components/global';
import { ENV } from '@/utils/consts';
import './styles/index.less';
import app from './components/app';

Vue.use(iView);
Vue.use(VueRouter);
Vue.use(eventHub);

Vue.config.productionTip = ENV.DEBUG;
Vue.config.debug = ENV.DEBUG;
Vue.config.devtools = ENV.DEBUG;
window._vueInstance = new Vue({
  debug: ENV.DEBUG,
  components: { app },
  template: '<app/>',
  el: '#app',
  router
});

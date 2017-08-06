import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App';
import router from './router';

import 'bootstrap/dist/css/bootstrap.min.css';

Vue.use(VueRouter);

new Vue({
  render(h) {
    return h('div', {
      style: {
        padding: '1em',
        fontSize: '14px',
        minWidth: '30em',
      },
    }, [h(App)]);
  },

  router,
}).$mount('#app');

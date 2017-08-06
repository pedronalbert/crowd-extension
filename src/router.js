import VueRouter from 'vue-router';

import MatchersView from './views/MatchersView';
import ConfigView from './views/ConfigView';

export default new VueRouter({
  routes: [
    { path: '/', name: 'matchers', component: MatchersView },
    { path: '/config', name: 'config', component: ConfigView },
  ]
});


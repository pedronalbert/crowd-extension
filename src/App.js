import moment from 'moment';

import NavTabs from './components/NavTabs';
import matchersStorage from './utils/matchersStorage';

export default {
  name: 'App',

  created() {
    this.loadNextCheckTime();

    chrome.storage.onChanged.addListener(this.loadNextCheckTime);

    setInterval(this.updateNextCheckTimeAgo, 1e3);
  },

  data() {
    return {
      nextCheckTimeAgo: 'calculating...',
    };
  },

  methods: {
    loadNextCheckTime() {
      chrome.storage.local.get('nextCheckTime', ({ nextCheckTime = null }) => {
        this.nextCheckTime = nextCheckTime;
      });
    },

    updateNextCheckTimeAgo() {
      const seconds = moment(this.nextCheckTime || undefined).diff(moment(), 'seconds');

      this.nextCheckTimeAgo = seconds >= 1 ? `${seconds} seconds` : `right now`;
    }
  },

  render(h) {
    const children = [
      h(NavTabs, { class: 'mb-4' }),
      h('router-view'),
      h('div', {
        class: 'text-right',
      }, 'Next Check: ' + this.nextCheckTimeAgo),
    ];

    return h('div', children);
  },
};


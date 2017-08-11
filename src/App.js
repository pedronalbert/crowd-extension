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
      h('div', { class: 'd-flex' }, [
        h('a', {
          attrs: {
            href: 'https://www.paypal.me/pedronalbert',
            target: '_blank',
          },
        }, [
          h('img', {
            style: {
              width: '4em',
            },
            attrs: {
              title: 'Donate',
              src: './assets/icons/paypal_donate.png',
            },
          }),
        ]),
        h('div', {
          class: 'text-right flex',
          style: { flex: 1 },
        }, 'Next Check: ' + this.nextCheckTimeAgo),
      ])
    ];

    return h('div', children);
  },
};


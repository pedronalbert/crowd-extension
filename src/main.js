import Vue from 'vue';
import moment from 'moment';

import MatchersList from './components/MatchersList';
import MatchersForm from './components/MatchersForm';
import matchersStorage from './utils/matchersStorage';

import 'bootstrap/dist/css/bootstrap.min.css';

new Vue({
  el: '#app',

  created() {
    this.loadMatchers();
    this.loadNextCheckTime();

    chrome.storage.onChanged.addListener(this.loadNextCheckTime);

    setInterval(this.updateNextCheckTimeAgo, 1e3);
  },

  data() {
    return {
      matchers: [],
      nextCheckTimeAgo: 'right now',
    };
  },

  methods: {
    loadMatchers() {
      matchersStorage.all()
        .then(matchers => this.matchers = matchers);
    },

    loadNextCheckTime() {
      chrome.storage.local.get('nextCheckTime', ({ nextCheckTime = null }) => {
        this.nextCheckTime = nextCheckTime;
      });
    },

    onSubmitMatcher(matcher) {
      matchersStorage.add(matcher)
        .then(m => this.matchers.push(m));
    },

    onDeleteMatcher(id) {
      matchersStorage.remove(id);
      this.matchers = this.matchers.filter(m => m.id !== id);
    },

    updateNextCheckTimeAgo() {
      const seconds = moment(this.nextCheckTime || undefined).diff(moment(), 'seconds');

      this.nextCheckTimeAgo = seconds >= 1 ? `${seconds} seconds` : `right now`;
    }
  },

  render(h) {
    const children = [
      h(MatchersForm, { on: {
        submit: this.onSubmitMatcher,
      }}),
      h(MatchersList, {
        class: 'mt-3',
        props: { matchers: this.matchers },
        on: {
          delete: this.onDeleteMatcher,
        },
      }),
      h('div', {
        class: 'text-right',
      }, 'Next Check: ' + this.nextCheckTimeAgo),
    ];

    return h('div', {
      style: {
        minWidth: '28em',
        padding: '1em',
        fontSize: '12px',
      },
    }, children);
  }
});

import MatchersList from '../components/MatchersList';
import MatchersForm from '../components/MatchersForm';
import matchersStorage from '../utils/matchersStorage';

export default {
  name: 'MatchersView',

  created() {
    this.loadMatchers();
  },

  data() {
    return {
      matchers: [],
    };
  },

  methods: {
    loadMatchers() {
      matchersStorage.all()
        .then(matchers => this.matchers = matchers);
    },

    onSubmitMatcher(matcher) {
      matchersStorage.add(matcher)
        .then(m => this.matchers.push(m));
    },

    onDeleteMatcher(id) {
      matchersStorage.remove(id);
      this.matchers = this.matchers.filter(m => m.id !== id);
    },
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
    ];

    return h('div', children);
  },
};


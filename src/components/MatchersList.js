import MatcherItem from './MatcherItem';

export default {
  name: 'MatchersList',

  props: {
    matchers: { type: Array, required: true },
  },

  render(h) {
    const children = [
      h('tr', [
        h('th', 'Keywords'),
        h('th', 'minTasks'),
        h('th', 'actions'),
      ]),
      this.matchers.map((matcher) => h(
        MatcherItem,
        {
          props: {
            matcher: matcher,
          },
          on: {
            delete: args => this.$emit('delete', args),
          },
        },
      )),
    ];

    return h('table', { class: 'table table-sm' }, children) ;
  }
}

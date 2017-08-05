export default {
  name: 'MatcherItem',

  props: {
    matcher: { type: Object, required: true },
  },

  render(h) {
    const children = [
      h('td', this.matcher.keywords.toString()),
      h('td', this.matcher.minTasks),
      h('td', [
        h('a', {
          style: {
            color: 'red',
          },
          attrs: {
            href: '#',
          },
          on: {
            click: () => {
              this.$emit('delete',this.matcher.id);
            },
          },
        }, 'Delete'),
      ]),
    ];

    return h('tr', children);
  },
};


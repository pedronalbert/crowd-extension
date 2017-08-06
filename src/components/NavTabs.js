
export default {
  name: 'NavTabs',

  methods: {
    genTab(h, { to, text, active = false }) {
      return h('li', { class: 'nav-item'}, [
        h('router-link', {
          class: 'nav-link',
          props: {
            to,
            activeClass: 'active',
          },
        }, text),
      ]);
    },
  },

  render(h) {
    const children = [
      this.genTab(h, { to: { name: 'matchers' }, text: 'Matchers' }),
      this.genTab(h, { to: { name: 'config' }, text: 'Configuration' }),
    ];

    return h('ul', {
      class: 'nav nav-tabs',
    }, children);
  }
};


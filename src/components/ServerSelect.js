const SERVERS = [
  { text: 'Neobux', value: 'neodev' },
  { text: 'EliteMierdower', value: 'elite' },
];

export default {
  name: 'ServerSelect',

  methods: {
    onInput(e) {
      console.debug('ServerSelect$input');

      this.$emit('input', e.target.value);
    },
  },

  props: {
    value: { type: String, default: '' },
  },

  render(h) {
    const options = SERVERS.map(server => h('option', {
      attrs: {
        value: server.value,
        selected: this.value === server.value,
      },
    }, server.text));

    options.unshift(h('option', {
      attrs: {
        value: '',
        selected: !this.value,
      },
    }, 'Select Server'));

    const select  = h('select', {
      class: 'form-control form-control-sm',
      on: {
        input: this.onInput,
      },
    }, options);

    const children = [
      h('div', { class: 'form-group row' }, [
        h('label', { class: 'col-4 col-form-label' }, 'Server'),
        h('div', { class: 'col-8' }, [
          select
        ]),
      ]),
    ];

    return h('div', [children]);
  },
}

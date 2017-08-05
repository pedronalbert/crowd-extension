const styles = {
  root: {
    display: 'flex',
  },
};

export default {
  name: 'MatchersForm',

  data() {
    return {
      keywords: null,
      minTasks: 0,
    };
  },

  methods: {
    onSubmit() {
      if (!this.keywords) return null;

      this.$emit('submit', {
        keywords: this.keywords,
        minTasks: this.minTasks,
      });

      this.keywords = null;
      this.minTask = 0;
    },
  },

  render(h) {
    const children = [
      h('div', { class: 'form w-100' }, [
        h('div', { class: 'form-group row' }, [
          h('label', { class: 'col-4 col-form-label' }, 'Keywords'),
          h('div', { class: 'col-8' }, [
            h('input', {
              class: 'form-control form-control-sm',
              attrs: {
                placeholder: 'clothing,catego',
                value: this.keywords,
              },
              on: {
                input: e => this.keywords = e.target.value,
              },
            }),
          ]),
        ]),
        h('div', { class: 'form-group row' }, [
          h('label', { class: 'col-4 col-form-label' }, '# Tasks'),
          h('div', { class: 'col-8' }, [
            h('input', {
              class: 'form-control form-control-sm',
              attrs: {
                type: 'number',
                value: this.minTasks,
              },
              on: {
                input: e => this.minTasks = e.target.value,
              },
            }),
          ]),
        ]),
        h('button', {
          class: 'btn btn-sm btn-primary w-100',
          on: {
            click: this.onSubmit,
          },
        }, 'Add Task Matcher'),
      ]),
    ];

    return h('div', { style: styles.root }, children);
  },
};


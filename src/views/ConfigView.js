import { assign } from 'lodash';

import configStorage from '../utils/configStorage';
import ServerSelect from '../components/ServerSelect';

export default {
  name: 'ConfigView',

  data() {
    return {
      config: {},
    };
  },

  created() {
    this.loadConfig();
  },

  methods: {
    loadConfig() {
      configStorage.all()
        .then((configs) => {
          this.config = configs;
        });
    },

    onChangeServer(server) {
      configStorage.add({ server });
      assign(this.config, { server });
    },
  },

  render(h) {
    const children = [
      h(ServerSelect, {
        props: {
          value: this.config.server,
        },
        on: {
          input: this.onChangeServer,
        },
      }),
    ];

    return h('div', children);
  },
}

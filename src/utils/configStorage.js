import { extend } from 'lodash';

const KEY = 'config';

function all() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(KEY, (r) => {
      resolve(r[KEY] || {});
    });
  });
}

function add(config) {
  all()
    .then(configs => extend(configs, config))
    .then((configs) => {
      chrome.storage.local.set({ [KEY]: configs });
    });
}

export default { all, add };

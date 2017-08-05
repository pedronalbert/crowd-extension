import uuid from 'uuid';

const KEY = 'matchers';

function all() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(KEY, (matchers) => {
      resolve(matchers[KEY] ? matchers[KEY] : []);
    });
  });
}

function add(matcherData) {
  console.debug('matchersStorage#add');

  const matcher = Object.assign({
    id: uuid.v4(),
  }, matcherData, {
    keywords: matcherData.keywords.split(','),
  });

  return new Promise((resolve, reject) => {
    all()
      .then((matchers) => {
        matchers.push(matcher);

        chrome.storage.local.set({ [KEY]: matchers }, () => {
          resolve(matcher);
        });
      });
  });
}

function remove(id) {
  console.debug('matchersStorage#remove');

  all()
    .then(matchers => matchers.filter(m => m.id !== id))
    .then((matchers) => {
      chrome.storage.local.set({ [KEY]: matchers });
    });
}

export default { all, add, remove };

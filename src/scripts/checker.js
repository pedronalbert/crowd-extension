const TASKS_URL = 'https://tasks.crowdflower.com/channels/neodev/tasks';
const NOTI_ICON = '/assets/images/crowd-logo.jpg';
const NOTI_ICON_RED = '/assets/images/crowd-logo-red.jpg';
const NOTI_AUDIO = new Audio('/assets/audios/notification.mp3');

let ERROR = null;
let nextCheckTimeout;

class NoServerError extends Error {
  constructor() {
    super('No ha seleccionado un servidor');
  }
}

class NoActiveMatchersError extends Error {
  constructor() {
    super('No ha agregado matchers');
  }
}

class SignInError extends Error {
  constructor() {
    super('No has iniciado session');
  }
}

class FetchError extends Error {
  constructor() {
    super('No se ha podido obtener la lista de tareas');
  }
}

const getTasksUrl = () => new Promise((resolve, reject) => {
  chrome.storage.local.get('config', (r) => {
    if (r && r.config && r.config.server) {
      resolve(`https://tasks.crowdflower.com/channels/${r.config.server}/tasks`);
    } else {
      reject(new NoServerError());
    }
  });
})

const getMatchers = () => new Promise((resolve) => {
  chrome.storage.local.get(
    'matchers',
    res => resolve(res.matchers || []),
  );
});


const getActiveTaskId = () => new Promise((resolve) => {
  chrome.tabs.executeScript(null, {
    code: `document.getElementById('assignment-job-id').innerText`,
  }, (results) => {
    resolve(results && parseInt(results[0], 10) || null);
  });
})

const getCrowdPage = (url) => new Promise((resolve, reject) => {
  $.ajax({
    url,
    method: 'GET',
    dataType: 'html',
  })
    .done((data) => {
      resolve($(data).find('#content').first());
    })
    .fail((err) => {
      if (err.status === 404) {
        throw new SignInError();
      } else {
        throw new FetchError();
      }
    });
});


const getTasks = ($pageContent) => $pageContent
  .find('#task-listing-datatable')
  .data('tasks')
  .map(data => ({
    id: data[0],
    title: data[1],
    nTasks: data[5],
  }));

const getAlertableTasks = async (tasks, matchers) =>  {
  const activeTaskId = await getActiveTaskId();

  console.debug('Active task ID', activeTaskId);

  const alertableTasks = tasks.filter((task) => {
    if (activeTaskId === task.id) return false;

    return matchers.some((matcher) => {
      const { keywords, minTasks } = matcher;

      return keywords
        .every(kw => task.title.toLowerCase().includes(kw.toLowerCase())) &&
        task.nTasks >= minTasks;
    });
  });

  return Promise.resolve(alertableTasks);
};

const notifyTasks = (tasks) => {
  const body = tasks.reduce((body, { title, nTasks }) => body + `(${nTasks}) ${title}\n`, '');

  const notification = new Notification('Nuevas Tareas', {
      body,
      icon: NOTI_ICON,
    }
  );

  notification.onclick = async () => {
    const tasksUrl = await getTasksUrl();
    const url = tasks.length === 1 ?  `${tasksUrl}/${tasks[0].id}` : tasksUrl;

    chrome.tabs.create({ url });
  };

  NOTI_AUDIO.play();

  setTimeout(notification.close.bind(notification), 5e3);
};


const check = async (matchers) => {
  const tasksUrl = await getTasksUrl();
  const crowdPage = await getCrowdPage(tasksUrl);
  const tasks = await getTasks(crowdPage);
  const alertableTasks = await getAlertableTasks(tasks, matchers);

  if (alertableTasks.length > 0) {
    notifyTasks(alertableTasks);
  }
}

const saveNextCheckTime = (nextCheckTime) => {
  chrome.storage.local.set({ nextCheckTime });
}

const scheduleNextCheck = () => {
    const nextCheckMS = Math.floor(Math.random() * (35e3 - 25e3)) + 25e3;

    saveNextCheckTime(Date.now() + nextCheckMS);

    nextCheckTimeout = setTimeout(init, nextCheckMS);
}

const cancelNextCheck = () => {
  clearTimeout(nextCheckTimeout);
};

const changeActionIcon = (name) => {
  const path = `assets/icons/${name}.png`

  chrome.browserAction.setIcon({
    path,
  });
};

const showInactiveIcon = () => changeActionIcon('icon_red48');

const showActiveIcon = () => changeActionIcon('icon48');

const setError = (error) => {
  if (ERROR !== error) {
    const notification = new Notification('Algo ha salido mal', {
      body: error.message,
      icon: NOTI_ICON_RED,
    });

    ERROR = error;
    showInactiveIcon();
  }
};

const clearError = () => {
  if (ERROR) {
    ERROR = null;
    showActiveIcon();
  }
}

const init = async () => {
  console.debug('Checker init');

  try {
    const matchers = await getMatchers();

    if (matchers.length > 0) {
      clearError();

      await check(matchers);
    } else {
      throw new NoActiveMatchersError();
    }
  } catch (error) {
    setError(error);

    console.error(error);
  }

  scheduleNextCheck();
}

init();

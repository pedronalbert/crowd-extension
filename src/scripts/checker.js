const TASKS_URL = 'https://tasks.crowdflower.com/channels/neodev/tasks';
const NOTI_ICON = '/assets/images/crowd-logo.jpg';
const NOTI_AUDIO = new Audio('/assets/audios/notification.mp3');

const getTasksUrl = () => new Promise((resolve, reject) => {
  chrome.storage.local.get('config', (r) => {
    if (r && r.config && r.config.server) {
      resolve(`https://tasks.crowdflower.com/channels/${r.config.server}/tasks`);
    } else {
      reject(Error('No has seleccionado un servidor'));
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
        reject(Error('No has iniciado session'));
      } else {
        reject(Error('No se ha podido cargar la lista de tareas'));
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
  try {
    const tasksUrl = await getTasksUrl();
    const crowdPage = await getCrowdPage(tasksUrl);
    const tasks = await getTasks(crowdPage);
    const alertableTasks = await getAlertableTasks(tasks, matchers);

    console.log(alertableTasks);

    if (alertableTasks.length > 0) {
      notifyTasks(alertableTasks);
    }
  } catch ({ message }) {
    const notification = new Notification('Error', {
      icon: NOTI_ICON,
      body: message,
    });

    setTimeout(notification.close.bind(notification), 7e3);
  }
}

const saveNextCheckTime = (nextCheckTime) => {
  chrome.storage.local.set({ nextCheckTime });
}

const scheduleNextCheck = () => {
    const nextCheckMS = Math.floor(Math.random() * (35e3 - 25e3)) + 25e3;

    saveNextCheckTime(Date.now() + nextCheckMS);

    setTimeout(init, nextCheckMS);
}

const init = async () => {
  console.debug('Checker init');

  try {
    const matchers = await getMatchers();

    if (matchers.length > 0) check(matchers);
  } catch (error) {
    console.error(error);
  }

  scheduleNextCheck();
}

init();

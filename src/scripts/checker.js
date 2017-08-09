const TASKS_URL = 'https://tasks.crowdflower.com/channels/neodev/tasks';
const NOTI_ICON = '/assets/images/crowd-logo.jpg';
const NOTI_AUDIO = new Audio('/assets/audios/notification.mp3');

function getTasksUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('config', (r) => {
      if (r && r.config && r.config.server) {
        resolve(`https://tasks.crowdflower.com/channels/${r.config.server}/tasks`);
      } else {
        reject(Error('No has seleccionado un servidor'));
      }
    });
  });
}

function getMatchers() {
  return new Promise((resolve) => {
    chrome.storage.local.get('matchers', (res) => {
      resolve(res.matchers || []);
    });
  });
}

function getCrowdPage(url) {
  return new Promise((resolve, reject) => {
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
}

function getTasks($pageContent) {
  return $pageContent.find('#task-listing-datatable')
    .data('tasks')
    .map(data => ({
      id: data[0],
      title: data[1],
      nTasks: data[5],
    }));
}

function getAlertableTasks(tasks, matchers) {
	return tasks.filter((task) => {
    return matchers.some((matcher) => {
      const { keywords, minTasks } = matcher;

      return keywords
        .every(kw => task.title.toLowerCase().includes(kw.toLowerCase())) &&
        task.nTasks >= minTasks;
    });
	});
}


function notifyTasks(tasks) {
  body = tasks.reduce((body, { title, nTasks }) => body + `(${nTasks}) ${title}\n`, '');

  const notification = new Notification('Nuevas Tareas', {
      body,
      icon: NOTI_ICON,
    }
  );

  notification.onclick = () => {
    getTasksUrl()
      .then(tasksUrl => {
        const url = tasks.length === 1 ?  `${tasksUrl}/${tasks[0].id}` : tasksUrl;

        chrome.tabs.create({ url });
      });
  }

  NOTI_AUDIO.play();

  setTimeout(notification.close.bind(notification), 5e3);
}

function check(matchers) {
  return getTasksUrl()
    .then(getCrowdPage)
    .then(getTasks)
    .then(tasks => getAlertableTasks(tasks, matchers))
    .then(tasks => {
      if (tasks.length > 0) {
        notifyTasks(tasks);
      }
    })
    .catch(err => {
      const notification = new Notification('Error', {
        icon: NOTI_ICON,
        body: err.message,
      });

      setTimeout(notification.close.bind(notification), 5e3);
    });
}

function saveNextCheckTime(nextCheckTime) {
  chrome.storage.local.set({ nextCheckTime });
}

function scheduleNextCheck() {
    const nextCheckMS = Math.floor(Math.random() * (45e3 - 35e3)) + 35e3;

    saveNextCheckTime(Date.now() + nextCheckMS);

    setTimeout(init, nextCheckMS);
}

function init() {
  getMatchers()
    .then(check)
    .then(scheduleNextCheck)
    .catch(scheduleNextCheck)
}

init();

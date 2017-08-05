const TASKS_URL = 'https://tasks.crowdflower.com/channels/neodev/tasks';
const NOTI_ICON = '/assets/images/crowd-logo.jpg';

function getMatchers() {
  return new Promise((resolve) => {
    chrome.storage.local.get('matchers', (res) => {
      resolve(res.matchers || []);
    });
  });
}

function getCrowdPage() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: TASKS_URL,
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
        .every(kw => task.title.toLowerCase().includes(kw)) &&
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
    url = tasks.length === 1 ?  `${TASKS_URL}/${tasks[0].id}` : TASKS_URL;
    chrome.tabs.create({ url });
  }
}

function check(matchers) {
  getCrowdPage()
    .then(getTasks)
    .then(tasks => getAlertableTasks(tasks, matchers))
    .then(tasks => {
      if (tasks.length > 0) {
        notifyTasks(tasks);
      }
    })
    .catch(err => {
      new Notification('Error', {
        icon: NOTI_ICON,
        body: err.message,
      });
    });
}

function init() {
  getMatchers()
    .then((matchers) => {
      if (matchers.length > 0) {
        check(matchers);
      }
    });
}

init();
setInterval(init,  Math.floor(Math.random() * (35 * 1000)) + (50 * 1000))

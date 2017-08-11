const URLS = [
  '*://tasks.crowdflower.com/*',
];

var responseListener = function(details){
  details.responseHeaders.push({ name: 'Access-Control-Allow-Origin', value: '*' });

  return {responseHeaders: details.responseHeaders};
};

function requestListener(details) {
  const idx = details.requestHeaders.indexOf('Origin');

  details.requestHeaders = details.requestHeaders.splice(idx, 1);

  return { requestHeaders: details.requestHeaders };
}

/*On install*/
chrome.webRequest.onHeadersReceived.addListener(responseListener, {
  urls: URLS,
}, ['blocking', 'responseHeaders']);

chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
  urls: URLS,
},["blocking", "requestHeaders"]);

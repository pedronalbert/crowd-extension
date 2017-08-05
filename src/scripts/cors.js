var responseListener = function(details){
  details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders});
  details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": exposedHeaders});
  details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

  return {responseHeaders: details.responseHeaders};
};

function requestListener(details) {
  const idx = details.requestHeaders.indexOf('Origin');

  details.requestHeaders = details.requestHeaders.splice(idx, 1);

  return { requestHeaders: details.requestHeaders };
}

/*On install*/
chrome.webRequest.onHeadersReceived.addListener(responseListener, {
  urls: '<all_urls>',
}, ['blocking', 'responseHeaders']);

chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
  urls: '<all_urls>',
},["blocking", "requestHeaders"]);

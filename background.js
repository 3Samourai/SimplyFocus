let isBlocking = false;
let sitesToBlock = [];

// Load initial state
browser.storage.local.get(['isBlocking', 'sites'], function(result) {
  isBlocking = result.isBlocking || false;
  sitesToBlock = result.sites || [];
  updateIcon(isBlocking);
});

// Listen for changes in storage
browser.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === 'local') {
    if (changes.isBlocking) {
      isBlocking = changes.isBlocking.newValue;
      updateIcon(isBlocking);
    }
    if (changes.sites) {
      sitesToBlock = changes.sites.newValue;
    }
  }
});

// Listen for messages from popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateBlocking') {
    isBlocking = request.isBlocking;
    updateIcon(isBlocking);
  }
});

// Web request listener
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (isBlocking) {
      const url = new URL(details.url);
      if (sitesToBlock.some(site => url.hostname.includes(site))) {
        return {cancel: true};
      }
    }
    return {cancel: false};
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

function updateIcon(isBlocking) {
  const iconPath = isBlocking ? 'icon_active.png' : 'icon.png';
  browser.browserAction.setIcon({ path: iconPath });
}

document.addEventListener('DOMContentLoaded', function() {
  const siteList = document.getElementById('siteList');
  const addSiteButton = document.getElementById('addSite');
  const toggleBlockingButton = document.getElementById('toggleBlocking');
  const statusDiv = document.getElementById('status');

  // Load saved sites and blocking state
  browser.storage.local.get(['sites', 'isBlocking'], function(result) {
    if (result.sites) {
      siteList.value = result.sites.join('\n');
    }
    updateToggleButton(result.isBlocking);
  });

  // Update site list
  addSiteButton.addEventListener('click', function() {
    const sites = siteList.value.split('\n')
      .map(site => site.trim().toLowerCase())
      .filter(site => site !== '')
      .map(site => site.replace(/^www\./, '')); // Remove 'www.' if present
    
    browser.storage.local.set({sites: sites}, function() {
      showStatus('Site list updated');
    });
  });

  // Toggle blocking
  toggleBlockingButton.addEventListener('click', function() {
    browser.storage.local.get('isBlocking', function(result) {
      const newState = !result.isBlocking;
      browser.storage.local.set({isBlocking: newState}, function() {
        updateToggleButton(newState);
        browser.runtime.sendMessage({action: 'updateBlocking', isBlocking: newState});
        showStatus(newState ? 'Blocking enabled' : 'Blocking disabled');
      });
    });
  });

  function updateToggleButton(isBlocking) {
    toggleBlockingButton.textContent = isBlocking ? 'Disable Blocking' : 'Enable Blocking';
    toggleBlockingButton.classList.toggle('active', isBlocking);
    updateIcon(isBlocking);
  }

  function updateIcon(isBlocking) {
    const iconPath = isBlocking ? 'icon_active.png' : 'icon.png';
    browser.browserAction.setIcon({ path: iconPath });
  }

  function showStatus(message) {
    statusDiv.textContent = message;
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 2000);
  }
});

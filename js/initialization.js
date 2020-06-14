// Installation Message
chrome.runtime.onInstalled.addListener(function() {
    chrome.notifications.create(config.installation);
    chrome.storage.local.set({authorization: true, sent: false});
});

// Add Notification Click Event
chrome.notifications.onClicked.addListener( function() {
    chrome.tabs.create({url: config.url});
});

// On Start
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.set({sent: false});
});

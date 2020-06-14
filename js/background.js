// Start Detection Loop
check(); setInterval(function () {check(); }, 10000);

async function check() {

    let storage = await getStorageData();

    const streamData = await getStreamData();
    if (streamData && streamData.type === 'live') {
        chrome.browserAction.setIcon({path: config.images.icon_on_64});
        if (storage.notifications && !await streamIsOpen()) {
            if (storage.notified || (new Date()) - storage.notified > 60 * 60 * 1000) {
                if (config.notification.message === '') config.notification.message = streamData.title;
                chrome.notifications.create(config.notification);
                chrome.storage.local.set({notified: new Date()});
            }
        }
    } else {
        chrome.browserAction.setIcon({path: config.images.icon_off_64});
        chrome.storage.local.set({sent: null});
    }
    //Youtube
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + config.channelid_youtube + '&maxResults=10&order=date&type=video&key=' + config.api_key_youtube,
        type: "GET",
        success: function(result){
            $('.youtube .miniature img').attr('src', result["items"][0]["snippet"]["thumbnails"]["default"]["url"]);
            $('.youtube .title').text(result["items"][0]["snippet"]["title"]);

            chrome.storage.sync.get(['youtube_end_video'], function(youtube_local) {
                if(youtube_local.key < result["items"][0]["snippet"]["publishedAt"]){
                    chrome.storage.local.set({youtube_end_video: result["items"][0]["snippet"]["publishedAt"]});
                    chrome.notifications.create(config.notification_youtube);
                }
            });
        }
    });
}

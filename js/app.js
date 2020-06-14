$(async function () {
    
    const auth = await OAuth();
    if (auth && auth.access_token) {
        config.access_token = auth.access_token;
    }

    const user = await getUserInfos();
    const data = await getStreamData();
    const storage = await getStorageData();
    const viewsCount = user && user.view_count
        ? user.view_count.toLocaleString('fr')
        : '0';

    // Init HTML Content
    $('body').on('click', 'a', function () {
        chrome.tabs.create({url: $(this).attr('href')});
    });
    var twitter_api = config.social.twitter;
    if(twitter_api != null){
        twitter_api = twitter_api.replace('https://twitter.com/', '');
        $('.twitter').addClass('active');
        $('.twitter').attr('src', 'http://landextension.22web.org/?id=' + twitter_api);
    }
    $('.channel').attr('href', 'https://twitch.tv/' + config.channel_name);
    if (storage.notifications) $('.switch input').attr('checked', 'checked');
    for (let [key, value] of Object.entries(config.social)) {
        if (value) $('.social').append(`<a href="${value}"><img alt="${key}" src="img/assets/${key}.png"></a>`);
    }
    $(".switch input").on("change", function() {
        this.checked
            ? chrome.storage.local.set({notifications: true})
            : chrome.storage.local.set({notifications: false, sent: false});
    });
    $('#views').html(viewsCount + ' vues');

    // If Stream is Online
    if (user && data && data.type === 'live') {

        // Switch to Online View
        $('.offline').addClass('disabled');
        $('.online').removeClass('disabled');

        // Get Informations
        const gameName = await getGameName(data.game_id);
        const viewersCount = data.viewer_count ? data.viewer_count.toLocaleString('fr') : 0;
        const thumnailUrl = data.thumbnail_url.replace('-{width}x{height}', '') || 'img/assets/placeholder.png';

        // Change Informations
        $('.channel .online img').attr('src', thumnailUrl);
        $('.channel h1').html(data.title);
        $('#viewers').html(viewersCount + ' spectateurs');
        $('#game').html(gameName);


    // if Streeam is Offline
    } else if (user) {

        // Switch to Offline View
        $('.online').addClass('disabled');
        $('.offline').removeClass('disabled');

        // Change Informations
        $('.channel .offline img').attr('src', user.profile_image_url);
        $('.channel h1').html(user.display_name);
        $('#game').html('Stream hors-ligne');


    // If Twitch Error
    } else {

        $('.loading').addClass('disabled');
        $('.error').removeClass('disabled');
        return;
    }

    // Show App View
    $('.loading').addClass('disabled');
    $('.app').removeClass('disabled');

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
});
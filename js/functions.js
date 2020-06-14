async function OAuth() {
    return await new Promise(resolve => {
        $.ajax({
            type: 'POST',
            url: `https://id.twitch.tv/oauth2/token?client_id=${config.client_id}&client_secret=${config.client_secret}&grant_type=client_credentials`,
            success: res => resolve(res || null),
            error: err => resolve(null),
        })
    });
}

async function streamIsOpen() {

    return await new Promise(resolve =>
        chrome.windows.getAll({populate: true}, (windows) => {
            for (let window of windows) {
                const tabs = window.tabs;
                for (let tab of tabs) {
                    if (tab.url.includes('twitch.tv/' + config.channel_name)) {
                        return resolve(true);
                    }
                }
            }
            return resolve(false);
        })
    );
}
async function getUserInfos() {
    return await new Promise(resolve => {
        $.ajax({
            dataType: 'json',
            headers: {'Client-ID': config.client_id, 'Authorization': 'Bearer ' + config.access_token},
            url: "https://api.twitch.tv/helix/users?login=" + config.channel_name,
            success: user => 
                user && user.data && user.data[0]
                    ? resolve(user.data[0])
                    : resolve(null),
            error: err => resolve(null),
        })
    });
}
async function getStreamData() {

    return await new Promise(resolve => {
        $.ajax({
            dataType: 'json',
            headers: {'Client-ID': config.client_id, 'Authorization': 'Bearer ' + config.access_token},
            url: "https://api.twitch.tv/helix/streams?user_login=" + config.channel_name,
            success: stream =>
                stream && stream.data && stream.data[0]
                    ? resolve(stream.data[0])
                    : resolve(null),
             error: err => resolve(null),
        });
    });
}
async function getGameName(id) {
    return await new Promise(resolve => {
        $.ajax({
            dataType: 'json',
            headers: {'Client-ID': config.client_id, 'Authorization': 'Bearer ' + config.access_token},
            url: "https://api.twitch.tv/helix/games?id=" + id,
            success: game => 
                game && game.data && game.data[0]
                    ? resolve(game.data[0].name)
                    : resolve(null),
             error: err => resolve(null),
           
        })
    });
}
async function getStorageData() {
    return await new Promise(resolve => {
        chrome.storage.local.get(null, function (result) {
            resolve(result);
        });
    });
}

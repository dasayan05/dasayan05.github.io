function handle_love_response(info) {
    if (!info.status)
        return;
    let love_msgbox = document.getElementById('love_msg');
    if (info.have_identity && info.lovecount > 0) {
        let message = `You and ${info.total_count} other(s) loved it.`;
        let love = document.getElementById('love_button');
        love.style.color = 'red';
        love_msgbox.innerHTML = message;
    } else {
        let message = `${info.total_count} loved it.`;
        love_msgbox.innerHTML = message;
    }
}

function loveClicked (pagepath, clicked = true) {
    FB.getLoginStatus(async function(response) {
        if (response.status === "connected") {
            FB.api('/me?field=id,name', async function(resp){
                var fbid = resp.id;
                var fbname = resp.name;
                var packet = {
                    'have_identity': true,
                    'id': fbid, 'name': fbname,
                    'liked': Boolean(clicked),
                    'page': pagepath
                };
                var outcome = await fetch('https://dasayan05.herokuapp.com/social', {
                    method: 'POST',
                    body: JSON.stringify(packet),
                    headers: {"Content-Type": "application/json"}
                });
                var info = await outcome.text();
                info = JSON.parse(info);
                handle_love_response(info);
            });
        } else {
            var packet = {
                'have_identity': false,
                'id': "0",
                'name': "",
                'liked': Boolean(clicked),
                'page': pagepath
            };
            var outcome = await fetch('https://dasayan05.herokuapp.com/social', {
                method: 'POST',
                body: JSON.stringify(packet),
                headers: {"Content-Type": "application/json"}
            });
            var info = await outcome.text();
            info = JSON.parse(info);
            handle_love_response(info);
        }
    });
}
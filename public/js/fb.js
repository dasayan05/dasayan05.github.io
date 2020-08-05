// Javascript code to deal with FB logins

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status === "connected") {
            // ..
            console.log('Connected to FB');
        } else if (response.status === "unknown") {
            // ..
            console.log('Not logged in.');
        } else {
            // ..
            console.log('Logged in but not authorized');
        }
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '3268236546577201',
        cookie     : true,
        xfbml      : true,
        version    : 'v7.0'
    });

    checkLoginState();
};

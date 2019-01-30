(function () {
    "use strict";

    var signInButton = document.getElementById("sign-in");
    var signOutButton = document.getElementById("sign-out");

    signInButton.onclick = srs.google.signIn;
    signOutButton.onclick = srs.google.signOut;

    srs.google.setSigninStatusListener(function (isSignedIn) {
        if (!isSignedIn) {
            srs.setScreenSignIn();
        } else {
            srs.setScreenMain();
        }
    });
})();
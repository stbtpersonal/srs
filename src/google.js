(function () {
    "use strict";

    var signInButton = document.getElementById("sign-in");
    var signOutButton = document.getElementById("sign-out");

    signInButton.onclick = signIn;
    signOutButton.onclick = signOut;

    function handleClientLoad() {
        gapi.load("client:auth2", initializeClient);
    }

    function initializeClient() {
        gapi.client.init({
            apiKey: "AIzaSyAS4siDIzKNcdlEx6pcj_FtIHbAyBHLABI",
            clientId: "438625201729-ain7qqt8jceoa6ckrv0n5u1qi30ld78f.apps.googleusercontent.com",
            discoveryDocs: [
                "https://sheets.googleapis.com/$discovery/rest?version=v4",
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            ],
            scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly"
        }).then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(notifySigninStatusChanged);
            notifySigninStatusChanged(gapi.auth2.getAuthInstance().isSignedIn.get());
        }, function (error) {
            console.log(error);
        });
    }

    function notifySigninStatusChanged(isSignedIn) {
        if (!isSignedIn) {
            srs.setScreenSignIn();
        } else {
            srs.setScreenMain();
        }
    }

    function signIn() {
        gapi.auth2.getAuthInstance().signIn();
    }

    function signOut() {
        gapi.auth2.getAuthInstance().signOut();
    }

    function fetchSpreadsheets() {
        return new Promise(function (resolve, reject) {
            gapi.client.drive.files.list({
                "fields": "files(id, name)",
                "q": "mimeType = 'application/vnd.google-apps.spreadsheet' and name contains '[SRS]'"
            }).then(function (response) {
                resolve(response.result.files);
            }, function (response) {
                reject(response.result.error.message);
            });
        });
    }

    function fetchRows(spreadsheetId, column) {
        return new Promise(function (resolve, reject) {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: "SRS!" + column,
            }).then(function (response) {
                resolve(response.result.values);
            }, function (response) {
                reject(response.result.error.message);
            });
        });
    }

    srs.google = {
        handleClientLoad: handleClientLoad,
        fetchSpreadsheets: fetchSpreadsheets,
        fetchRows: fetchRows,
    };
})();
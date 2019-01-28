(function () {
    "use strict";

    var google = (function () {
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

        var signinListener = undefined;

        function setSigninStatusListener(listener) {
            signinListener = listener;
        }

        function notifySigninStatusChanged(isSignedIn) {
            if (signinListener) {
                signinListener(isSignedIn);
            }
        }

        function signIn() {
            gapi.auth2.getAuthInstance().signIn();
        }

        function signOut() {
            gapi.auth2.getAuthInstance().signOut();
        }

        function fetchSpreadsheets(callback) {
            gapi.client.drive.files.list({
                "fields": "files(id, name)",
                "q": "mimeType = 'application/vnd.google-apps.spreadsheet' and name contains '[SRS]'"
            }).then(function (response) {
                callback(response.result.files);
            }, function (response) {
                console.log('Error: ' + response.result.error.message);
            });
        }

        function fetchRows(spreadsheetId, column, callback) {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: "SRS!" + column,
            }).then(function (response) {
                callback(response.result.values);
            }, function (response) {
                console.log('Error: ' + response.result.error.message);
            });
        }

        return {
            handleClientLoad: handleClientLoad,
            setSigninStatusListener: setSigninStatusListener,
            signIn: signIn,
            signOut: signOut,
            fetchSpreadsheets: fetchSpreadsheets,
            fetchRows: fetchRows
        };
    })();

    var authorizeButton = document.getElementById("authorize_button");
    var signoutButton = document.getElementById("signout_button");
    var fetchButton = document.getElementById("fetch_button");

    google.setSigninStatusListener(function (isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = "none";
            signoutButton.style.display = "block";
            fetchButton.style.display = "block";
        } else {
            authorizeButton.style.display = "block";
            signoutButton.style.display = "none";
            fetchButton.style.display = "none";
        }
    });

    authorizeButton.onclick = google.signIn;
    signoutButton.onclick = google.signOut;
    fetchButton.onclick = function () {
        google.fetchSpreadsheets(function (spreadsheets) {
            console.log(spreadsheets);
            for (var spreadsheet of spreadsheets) {
                google.fetchRows(spreadsheet.id, "A1:A", function (rows) {
                    console.log(rows);
                    for (var row of rows) {
                        var cell = row[0];
                        console.log(cell);
                    }
                });
            }
        });
    };

    window.srs = {
        google: google
    };
})();
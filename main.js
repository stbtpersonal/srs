(function () {
    "use strict";

    var google = (function () {
        function handleClientLoad() {
            gapi.load('client:auth2', initializeClient);
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

        function signIn(event) {
            gapi.auth2.getAuthInstance().signIn();
        }

        function signOut(event) {
            gapi.auth2.getAuthInstance().signOut();
        }

        return {
            handleClientLoad: handleClientLoad,
            setSigninStatusListener: setSigninStatusListener,
            signIn: signIn,
            signOut: signOut
        };
    })();

    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');

    google.setSigninStatusListener(function (isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';

            listMajors();
            listFiles();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }

        authorizeButton.onclick = google.signIn;
        signoutButton.onclick = google.signOut;
    });

    /**
     * Print the names and majors of students in a sample spreadsheet:
     * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     */
    function listMajors() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
        }).then(function (response) {
            var range = response.result;
            if (range.values.length > 0) {
                console.log('Name, Major:');
                for (var i = 0; i < range.values.length; i++) {
                    var row = range.values[i];
                    // Print columns A and E, which correspond to indices 0 and 4.
                    console.log(row[0] + ', ' + row[4]);
                }
            } else {
                console.log('No data found.');
            }
        }, function (response) {
            console.log('Error: ' + response.result.error.message);
        });
    }

    /**
     * Print files.
     */
    function listFiles() {
        gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)",
            'q': "mimeType='application/vnd.google-apps.spreadsheet'"
        }).then(function (response) {
            console.log('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log(file);
                    console.log(file.name + ' (' + file.id + ')');
                }
            } else {
                console.log('No files found.');
            }
        });
    }

    window.srs = {
        google: google
    };
})();
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
    var rebuildButton = document.getElementById("rebuild_button");

    google.setSigninStatusListener(function (isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = "none";
            signoutButton.style.display = "block";
            rebuildButton.style.display = "block";
        } else {
            authorizeButton.style.display = "block";
            signoutButton.style.display = "none";
            rebuildButton.style.display = "none";
        }
    });

    var COLUMN_INDEX_JAPANESE = 0;
    var COLUMN_INDEX_ENGLISH = 1;
    var COLUMN_INDEX_MNEMONIC = 2;
    var COLUMN_INDEX_EXAMPLES = 3;
    var COLUMN_INDEX_J_TO_E_LEVEL = 4;
    var COLUMN_INDEX_J_TO_E_TIME = 5;
    var COLUMN_INDEX_E_TO_J_LEVEL = 6;
    var COLUMN_INDEX_E_TO_J_TIME = 7;

    function deserializeDatabaseEntry(serializedEntry, spreadsheetRow) {
        if (!serializedEntry[COLUMN_INDEX_JAPANESE] || !serializedEntry[COLUMN_INDEX_ENGLISH]) {
            return undefined;
        }

        var serializedJapanese = serializedEntry[COLUMN_INDEX_JAPANESE];
        var japanese = serializedJapanese.split("; ");

        var serializedEnglish = serializedEntry[COLUMN_INDEX_ENGLISH];
        var english = serializedEnglish.split("; ");

        var serializedMnemonic = serializedEntry[COLUMN_INDEX_MNEMONIC];
        var mnemonic = serializedMnemonic ? serializedMnemonic : "";

        var serializedExamples = serializedEntry[COLUMN_INDEX_EXAMPLES];
        var examples = serializedExamples ? serializedExamples.split("; ") : [];

        var serializedJToELevel = serializedEntry[COLUMN_INDEX_J_TO_E_LEVEL];
        var jToELevel = serializedJToELevel ? serializedJToELevel : 0;

        var serializedJToETime = serializedEntry[COLUMN_INDEX_J_TO_E_TIME];
        var jToETime = serializedJToETime ? serializedJToETime : 0;

        var serializedEToJLevel = serializedEntry[COLUMN_INDEX_E_TO_J_LEVEL];
        var eToJLevel = serializedEToJLevel ? serializedEToJLevel : 0;

        var serializedEToJTime = serializedEntry[COLUMN_INDEX_E_TO_J_TIME];
        var eToJTime = serializedEToJTime ? serializedEToJTime : 0;

        return {
            japanese: japanese,
            english: english,
            mnemonic: mnemonic,
            examples: examples,
            jToELevel: jToELevel,
            jToETime: jToETime,
            eToJLevel: eToJLevel,
            eToJTime: eToJTime,

            spreadsheetRow: spreadsheetRow
        };
    }

    function rebuildDatabase() {
        var database = { collections: [] };

        function fetchNextRows(remainingSpreadsheets) {
            if (remainingSpreadsheets.length == 0) {
                console.log(database);
            }
            else {
                var spreadsheet = remainingSpreadsheets.pop();
                var collection = { entries: [] };
                google.fetchRows(spreadsheet.id, "B2:I", function (rows) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var entry = deserializeDatabaseEntry(row, 2 + i);
                        if (entry) {
                            collection.entries.push(entry);
                        }
                    }
                    database.collections.push(collection);
                    fetchNextRows(remainingSpreadsheets);
                });
            }
        }

        google.fetchSpreadsheets(fetchNextRows);
    }

    authorizeButton.onclick = google.signIn;
    signoutButton.onclick = google.signOut;
    rebuildButton.onclick = rebuildDatabase;

    window.srs = {
        google: google
    };
})();
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

    authorizeButton.onclick = google.signIn;
    signoutButton.onclick = google.signOut;

    google.setSigninStatusListener(function (isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = "none";
            signoutButton.style.display = "block";

            refresh();
        } else {
            authorizeButton.style.display = "block";
            signoutButton.style.display = "none";
        }
    });

    var database = undefined;

    function refresh() {
        refreshDatabase().then(function () {
            refreshStudyAmount();
            refreshReviewAmount();
        });
    }

    function refreshDatabase() {
        return new Promise(function (resolve, reject) {
            if (database) {
                resolve();
                return;
            }

            var entries = [];

            function fetchNextRows(remainingSpreadsheets) {
                if (remainingSpreadsheets.length == 0) {
                    database = entries;
                    resolve();
                    return;
                }

                var spreadsheet = remainingSpreadsheets.pop();
                google.fetchRows(spreadsheet.id, "B2:I").then(function (rows) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var srsData = deserializeSrsData(row);
                        if (srsData) {
                            var databaseEntry = {
                                srsData: srsData,
                                spreadsheetId: spreadsheet.id,
                                spreadsheetRow: 2 + i,
                            };
                            entries.push(databaseEntry);
                        }
                    }
                    fetchNextRows(remainingSpreadsheets);
                });
            }

            google.fetchSpreadsheets().then(fetchNextRows);
        });
    }

    var COLUMN_INDEX_JAPANESE = 0;
    var COLUMN_INDEX_ENGLISH = 1;
    var COLUMN_INDEX_MNEMONIC = 2;
    var COLUMN_INDEX_EXAMPLES = 3;
    var COLUMN_INDEX_J_TO_E_LEVEL = 4;
    var COLUMN_INDEX_J_TO_E_TIME = 5;
    var COLUMN_INDEX_E_TO_J_LEVEL = 6;
    var COLUMN_INDEX_E_TO_J_TIME = 7;

    function deserializeSrsData(serializedData) {
        if (!serializedData[COLUMN_INDEX_JAPANESE] || !serializedData[COLUMN_INDEX_ENGLISH]) {
            return undefined;
        }

        var serializedJapanese = serializedData[COLUMN_INDEX_JAPANESE];
        var japanese = serializedJapanese.split("; ");

        var serializedEnglish = serializedData[COLUMN_INDEX_ENGLISH];
        var english = serializedEnglish.split("; ");

        var serializedMnemonic = serializedData[COLUMN_INDEX_MNEMONIC];
        var mnemonic = serializedMnemonic ? serializedMnemonic : "";

        var serializedExamples = serializedData[COLUMN_INDEX_EXAMPLES];
        var examples = serializedExamples ? serializedExamples.split("; ") : [];

        var serializedJToELevel = serializedData[COLUMN_INDEX_J_TO_E_LEVEL];
        var jToELevel = serializedJToELevel ? serializedJToELevel : 0;

        var serializedJToETime = serializedData[COLUMN_INDEX_J_TO_E_TIME];
        var jToETime = serializedJToETime ? new Date(JSON.serializedJToETime) : new Date(0);

        var serializedEToJLevel = serializedData[COLUMN_INDEX_E_TO_J_LEVEL];
        var eToJLevel = serializedEToJLevel ? serializedEToJLevel : 0;

        var serializedEToJTime = serializedData[COLUMN_INDEX_E_TO_J_TIME];
        var eToJTime = serializedEToJTime ? new Date(serializedEToJTime) : new Date(0);

        return {
            japanese: japanese,
            english: english,
            mnemonic: mnemonic,
            examples: examples,
            jToELevel: jToELevel,
            jToETime: jToETime,
            eToJLevel: eToJLevel,
            eToJTime: eToJTime
        };
    }

    var studyAmountElement = document.getElementById("study_amount");
    var reviewAmountElement = document.getElementById("review_amount");

    function refreshStudyAmount() {
        studyAmountElement.innerHTML = getEntriesForStudy().length;
    }

    function refreshReviewAmount() {
        reviewAmountElement.innerHTML = getEntriesForReview().length;
    }

    function getEntriesForStudy() {
        if (!database) {
            return [];
        }

        return database.filter(function (entry) {
            return entry.srsData.jToELevel == 0;
        });
    }

    function getEntriesForReview() {
        if (!database) {
            return [];
        }

        var now = Date.now();
        return database.filter(function (entry) {
            var srsLevel = entry.srsData.jToELevel;
            if (!srsLevel) {
                return false;
            }

            var levelDurationInHours = Math.pow(2, srsLevel);
            var levelDurationInMillis = levelDurationInHours * 60 * 60 * 1000;

            return entry.srsData.jToETime + levelDurationInMillis < now;
        });
    }

    window.srs = {
        google: google
    };
})();
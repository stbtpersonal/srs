(function () {
    "use strict";

    var SHEET_NAME = "SRS";

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
            srs.panic(error);
        });
    }

    function notifySigninStatusChanged(isSignedIn) {
        if (!isSignedIn) {
            srs.setScreenSignIn();
        }
        else {
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
        return new Promise(function (resolve) {
            gapi.client.drive.files.list({
                "fields": "files(id, name, webViewLink)",
                "q": "mimeType = 'application/vnd.google-apps.spreadsheet' and name contains '[" + SHEET_NAME + "]'"
            }).then(function (response) {
                resolve(response.result.files);
            }, function (response) {
                reject(response.result.error.message);
                srs.panic(response.result.error.message);
            });
        });
    }

    function fetchRows(spreadsheetId, range) {
        return new Promise(function (resolve, reject) {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: SHEET_NAME + "!" + range,
            }).then(function (response) {
                resolve(response.result.values || []);
            }, function (response) {
                reject(response.result.error.message);
                srs.panic(response.result.error.message);
            });
        });
    }

    function updateCells(spreadsheetId, range, values) {
        return new Promise(function (resolve, reject) {
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: SHEET_NAME + "!" + range,
                valueInputOption: "RAW",
                resource: { values: values },
            }).then(function (response) {
                resolve(response.result.files);
            }, function (response) {
                reject(response.result.error.message);
                srs.panic(response.result.error.message);
            });
        });
    }

    function createSpreadsheet() {
        var title = "[" + SHEET_NAME + "] " + new Date().toUTCString();
        return new Promise(function (resolve, reject) {
            gapi.client.sheets.spreadsheets.create({
                properties: { title: title },
            }).then(function (response) {
                var spreadsheetId = response.result.spreadsheetId;
                var sheetId = response.result.sheets[0].properties.sheetId;
                gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: spreadsheetId,
                    requests: [
                        {
                            updateSheetProperties: {
                                properties: {
                                    sheetId: sheetId,
                                    title: SHEET_NAME
                                },
                                fields: "title"
                            }
                        },
                        {
                            repeatCell: {
                                range: {
                                    sheetId: sheetId,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        textFormat: {
                                            bold: true,
                                        }
                                    }
                                },
                                fields: "userEnteredFormat.textFormat.bold"
                            }
                        }
                    ],
                }).then(function () {
                    resolve(spreadsheetId);
                }, function (response) {
                    reject(response.result.error.message);
                    srs.panic(response.result.error.message);
                });
            }, function (response) {
                reject(response.result.error.message);
                srs.panic(response.result.error.message);
            });
        });
    }

    srs.google = {
        handleClientLoad: handleClientLoad,
        fetchSpreadsheets: fetchSpreadsheets,
        fetchRows: fetchRows,
        updateCells: updateCells,
        createSpreadsheet: createSpreadsheet,
    };
})();
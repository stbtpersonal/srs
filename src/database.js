(function () {
    "use strict";

    var START_COLUMN_NAME = "B";
    var START_ROW_INDEX = 2;

    var COLUMN_INDEX_FRONT = 0;
    var COLUMN_INDEX_BACK = 1;
    var COLUMN_INDEX_INPUT = 2;
    var COLUMN_INDEX_NOTES = 3;
    var COLUMN_INDEX_LEVEL = 4;
    var COLUMN_INDEX_TIME = 5;

    var END_COLUMN_INDEX = COLUMN_INDEX_TIME;

    var TEMPLATE_DATA = [
        ["Front", "Back", "Input", "Notes", "Level", "Time"],
        ["これ", "this one; this", "E", "<b>これ</b>はペンです - <b>This</b> is a pen", "", ""],
    ];

    function refreshEntries() {
        return new Promise(function (resolve, reject) {
            var entries = [];
            var spreadsheets = [];

            function fetchNextRows(remainingSpreadsheets) {
                if (remainingSpreadsheets.length === 0) {
                    resolve({ "entries": entries, "spreadsheets": spreadsheets });
                    return;
                }

                var spreadsheet = remainingSpreadsheets.pop();
                var range = getColumnName(0) + START_ROW_INDEX + ":" + getColumnName(END_COLUMN_INDEX);
                srs.google.fetchRows(spreadsheet.id, range).then(function (rows) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var srsData = deserializeSrsData(row);
                        if (srsData) {
                            var databaseEntry = {
                                srsData: srsData,
                                spreadsheetId: spreadsheet.id,
                                spreadsheetRow: START_ROW_INDEX + i,
                            };
                            entries.push(databaseEntry);
                        }
                    }
                    fetchNextRows(remainingSpreadsheets);
                });
            }

            srs.google.fetchSpreadsheets().then(function (fetchedSpreadsheets) {
                spreadsheets = fetchedSpreadsheets.slice(0);
                fetchNextRows(fetchedSpreadsheets);
            });
        });
    }

    function getColumnName(index) {
        return String.fromCharCode(START_COLUMN_NAME.charCodeAt(0) + index);
    }

    function deserializeSrsData(serializedData) {
        if (!serializedData[COLUMN_INDEX_FRONT] || !serializedData[COLUMN_INDEX_BACK]) {
            return undefined;
        }

        var serializedFront = serializedData[COLUMN_INDEX_FRONT];
        var front = serializedFront.split("; ");

        var serializedBack = serializedData[COLUMN_INDEX_BACK];
        var back = serializedBack.split("; ");

        var input = serializedData[COLUMN_INDEX_INPUT];

        var serializedNotes = serializedData[COLUMN_INDEX_NOTES];
        var notes = serializedNotes ? serializedNotes : "";

        var serializedLevel = serializedData[COLUMN_INDEX_LEVEL];
        var level = serializedLevel ? parseInt(serializedLevel) : 0;

        var serializedTime = serializedData[COLUMN_INDEX_TIME];
        var time = serializedTime ? new Date(parseInt(serializedTime)).getTime() : new Date(0).getTime();

        return {
            front: front,
            back: back,
            input: input,
            notes: notes,
            level: level,
            time: time,
        };
    }

    function updateEntry(entry) {
        var range = getColumnName(COLUMN_INDEX_LEVEL) + entry.spreadsheetRow + ":" + getColumnName(COLUMN_INDEX_TIME) + entry.spreadsheetRow;
        srs.google.updateCells(entry.spreadsheetId, range, [[entry.srsData.level, entry.srsData.time]]);
    }

    function createSpreadsheet() {
        var range = getColumnName(0) + "1:" + getColumnName(END_COLUMN_INDEX) + "2";
        return new Promise(function (resolve, reject) {
            srs.google.createSpreadsheet().then(function (spreadsheetId) {
                srs.google.updateCells(spreadsheetId, range, TEMPLATE_DATA).then(function () {
                    resolve();
                });
            });
        });
    }

    srs.database = {
        refreshEntries: refreshEntries,
        updateEntry: updateEntry,
        createSpreadsheet: createSpreadsheet,
    };
})();
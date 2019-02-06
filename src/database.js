(function () {
    "use strict";

    var START_COLUMN_NAME = "B";
    var START_ROW_INDEX = 2;

    var COLUMN_INDEX_JAPANESE = 0;
    var COLUMN_INDEX_ENGLISH = 1;
    var COLUMN_INDEX_EXPLANATION = 2;
    var COLUMN_INDEX_MNEMONIC = 3;
    var COLUMN_INDEX_EXAMPLES = 4;
    var COLUMN_INDEX_LEVEL = 5;
    var COLUMN_INDEX_TIME = 6;

    var END_COLUMN_INDEX = COLUMN_INDEX_TIME;

    var TEMPLATE_DATA = [
        ["Japanese", "English", "Explanation", "Mnemonic", "Examples", "Level", "Time"],
        ["これ", "this one; this", "Detailed explanation", "A mnemonic to help remember the word", "Example 1; Example 2", "", ""],
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
        if (!serializedData[COLUMN_INDEX_JAPANESE] || !serializedData[COLUMN_INDEX_ENGLISH]) {
            return undefined;
        }

        var serializedJapanese = serializedData[COLUMN_INDEX_JAPANESE];
        var japanese = serializedJapanese.split("; ");

        var serializedEnglish = serializedData[COLUMN_INDEX_ENGLISH];
        var english = serializedEnglish.split("; ");

        var serializedExplanation = serializedData[COLUMN_INDEX_EXPLANATION];
        var explanation = serializedExplanation ? serializedExplanation : "";

        var serializedMnemonic = serializedData[COLUMN_INDEX_MNEMONIC];
        var mnemonic = serializedMnemonic ? serializedMnemonic : "";

        var serializedExamples = serializedData[COLUMN_INDEX_EXAMPLES];
        var examples = serializedExamples ? serializedExamples.split("; ") : [];

        var serializedLevel = serializedData[COLUMN_INDEX_LEVEL];
        var level = serializedLevel ? parseInt(serializedLevel) : 0;

        var serializedTime = serializedData[COLUMN_INDEX_TIME];
        var time = serializedTime ? new Date(parseInt(serializedTime)).getTime() : new Date(0);

        return {
            japanese: japanese,
            english: english,
            explanation: explanation,
            mnemonic: mnemonic,
            examples: examples,
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
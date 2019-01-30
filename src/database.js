(function () {
    "use strict";

    var COLUMN_INDEX_JAPANESE = 0;
    var COLUMN_INDEX_ENGLISH = 1;
    var COLUMN_INDEX_MNEMONIC = 2;
    var COLUMN_INDEX_EXAMPLES = 3;
    var COLUMN_INDEX_LEVEL = 4;
    var COLUMN_INDEX_TIME = 5;

    var entriesCache = [];

    function refreshEntries() {
        return new Promise(function (resolve, reject) {
            var entries = [];

            function fetchNextRows(remainingSpreadsheets) {
                if (remainingSpreadsheets.length == 0) {
                    entriesCache = entries;
                    resolve();
                    return;
                }

                var spreadsheet = remainingSpreadsheets.pop();
                srs.google.fetchRows(spreadsheet.id, "B2:I").then(function (rows) {
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

            srs.google.fetchSpreadsheets().then(fetchNextRows);
        });
    }

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

        var serializedLevel = serializedData[COLUMN_INDEX_LEVEL];
        var level = serializedLevel ? serializedLevel : 0;

        var serializedTime = serializedData[COLUMN_INDEX_TIME];
        var time = serializedTime ? new Date(JSON.serializedJToETime) : new Date(0);

        return {
            japanese: japanese,
            english: english,
            mnemonic: mnemonic,
            examples: examples,
            level: level,
            time: time,
        };
    }

    function getEntries() {
        return entriesCache.slice();
    }

    srs.database = {
        refreshEntries: refreshEntries,
        getEntries: getEntries
    };
})();
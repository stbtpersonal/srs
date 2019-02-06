(function () {
    "use strict";

    var studyAmountElement = document.getElementById("study-amount");
    var reviewAmountElement = document.getElementById("review-amount");
    var studyButton = document.getElementById("study");
    var reviewButton = document.getElementById("review");
    var databaseEntriesElement = document.getElementById("main-database-entries");
    var databaseNoEntriesElement = document.getElementById("main-database-no-entries");
    var databaseEntryTemplateElement = document.getElementById("main-database-entry-template");

    studyButton.onclick = function () { srs.setScreenStudy() };
    reviewButton.onclick = function () { srs.setScreenReview() };

    function refresh() {
        studyAmountElement.innerHTML = "?";
        reviewAmountElement.innerHTML = "?";
        databaseEntriesElement.innerHTML = "";
        databaseNoEntriesElement.style.display = "block";
        srs.database.refreshEntries().then(function (result) {
            refreshStudyAmount(result.entries);
            refreshReviewAmount(result.entries);
            refreshDatabases(result.spreadsheets, result.entries);
        });
    }

    function refreshStudyAmount(entries) {
        studyAmountElement.innerHTML = srs.findEntriesForStudy(entries).length;
    }

    function refreshReviewAmount(entries) {
        reviewAmountElement.innerHTML = srs.findEntriesForReview(entries).length;
    }

    function refreshDatabases(spreadsheets, entries) {
        if (!spreadsheets || spreadsheets.length === 0) {
            return;
        }

        databaseNoEntriesElement.style.display = "none";
        for (var spreadsheet of spreadsheets) {
            var databaseEntryElement = databaseEntryTemplateElement.cloneNode(true);
            databaseEntryElement.style.display = "block";
            databaseEntryElement.removeAttribute("id");
            databaseEntryElement.href = spreadsheet.webViewLink;

            var nameElement = databaseEntryElement.querySelector("#main-database-entry-name");
            nameElement.innerHTML = spreadsheet.name;

            var amount = 0;
            for (var entry of entries) {
                if (entry.spreadsheetId === spreadsheet.id) {
                    amount++;
                }
            }
            var amountElement = databaseEntryElement.querySelector("#main-database-entry-amount");
            amountElement.innerHTML = amount;

            databaseEntriesElement.appendChild(databaseEntryElement);
        }
    }

    srs.screenMain = {
        refresh: refresh,
    };
})();
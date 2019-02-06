(function () {
    "use strict";

    var DATE_FORMAT = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

    var studyAmountElement = document.getElementById("study-amount");
    var reviewAmountElement = document.getElementById("review-amount");
    var studyButton = document.getElementById("study");
    var reviewButton = document.getElementById("review");
    var databaseNewButton = document.getElementById("main-database-new-button");
    var databaseNewSpinner = document.getElementById("main-database-new-spinner");
    var databaseEntriesElement = document.getElementById("main-database-entries");
    var databaseNoEntriesElement = document.getElementById("main-database-no-entries");
    var databaseEntryTemplateElement = document.getElementById("main-database-entry-template");
    var scheduleEntriesElement = document.getElementById("main-schedule-entries");
    var scheduleNoEntriesElement = document.getElementById("main-schedule-no-entries");
    var scheduleDateEntryTemplateElement = document.getElementById("main-schedule-date-entry-template");
    var scheduleEntryTemplateElement = document.getElementById("main-schedule-entry-template");

    databaseNewButton.onclick = function () { createDatabase() };
    studyButton.onclick = function () { srs.setScreenStudy() };
    reviewButton.onclick = function () { srs.setScreenReview() };

    var isCreatingDatabase = false;

    function refresh() {
        studyAmountElement.innerHTML = "?";
        reviewAmountElement.innerHTML = "?";
        databaseEntriesElement.innerHTML = "";
        databaseNoEntriesElement.style.display = "block";
        scheduleEntriesElement.innerHTML = "";
        scheduleNoEntriesElement.style.display = "block";
        srs.database.refreshEntries().then(function (result) {
            refreshStudyAmount(result.entries);
            refreshReviewAmount(result.entries);
            refreshDatabases(result.spreadsheets, result.entries);
            refreshSchedule(result.entries);
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

    function refreshSchedule(entries) {
        if (!entries || entries.length === 0) {
            return;
        }

        entries.sort(function (a, b) { return a.srsData.time - b.srsData.time });

        var dates = {};
        for (var entry of entries) {
            var timestamp = entry.srsData.time;
            if (timestamp === 0) {
                continue;
            }

            var date = new Date(timestamp);
            date.setHours(0, 0, 0, 0);
            var dateTimestamp = date.getTime();
            if (!dates[dateTimestamp]) {
                dates[dateTimestamp] = {};
            }

            var hour = new Date(timestamp).getHours();
            if (!dates[dateTimestamp][hour]) {
                dates[dateTimestamp][hour] = 0;
            }
            dates[dateTimestamp][hour]++;
        }

        for (var date in dates) {
            var dateEntryElement = scheduleDateEntryTemplateElement.cloneNode(true);
            dateEntryElement.style.display = "block";
            dateEntryElement.removeAttribute("id");

            var nameElement = dateEntryElement.querySelector("#main-schedule-date-entry-text");
            nameElement.innerHTML = new Date(parseInt(date)).toLocaleDateString("en-US", DATE_FORMAT);

            scheduleEntriesElement.appendChild(dateEntryElement);

            for (var hour in dates[date]) {
                var scheduleEntryElement = scheduleEntryTemplateElement.cloneNode(true);
                scheduleEntryElement.style.display = "block";
                scheduleEntryElement.removeAttribute("id");

                var timeElement = scheduleEntryElement.querySelector("#main-schedule-entry-time");
                timeElement.innerHTML = hour + ":00";

                var amountElement = scheduleEntryElement.querySelector("#main-schedule-entry-amount");
                amountElement.innerHTML = dates[date][hour];

                scheduleEntriesElement.appendChild(scheduleEntryElement);
            }
        }

        scheduleNoEntriesElement.style.display = "none";
    }

    function createDatabase() {
        if (isCreatingDatabase) {
            return;
        }

        isCreatingDatabase = true;
        databaseNewSpinner.style.display = "block";
        srs.database.createSpreadsheet().then(function () {
            isCreatingDatabase = false;
            databaseNewSpinner.style.display = "none";
            refresh();
        });
    }

    srs.screenMain = {
        refresh: refresh,
    };
})();
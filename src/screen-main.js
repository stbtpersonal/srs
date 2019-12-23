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

        var incompleteEntries = srs.findIncompleteEntries(entries);

        databaseNoEntriesElement.style.display = "none";
        for (var spreadsheet of spreadsheets) {
            var amount = incompleteEntries.filter(function(entry) {
                return entry.spreadsheetId === spreadsheet.id;
            }).length;

            appendDatabaseEntry(spreadsheet.name, amount, spreadsheet.webViewLink);
        }
    }

    function appendDatabaseEntry(name, amount, url) {
        var databaseEntryElement = databaseEntryTemplateElement.cloneNode(true);
        databaseEntryElement.style.display = "block";
        databaseEntryElement.removeAttribute("id");
        databaseEntryElement.href = url;

        var nameElement = databaseEntryElement.querySelector("#main-database-entry-name");
        nameElement.innerHTML = name;

        var amountElement = databaseEntryElement.querySelector("#main-database-entry-amount");
        amountElement.innerHTML = amount;

        databaseEntriesElement.appendChild(databaseEntryElement);
    }

    function refreshSchedule(entries) {
        if (!entries || entries.length === 0) {
            return;
        }

        entries.sort(function (a, b) {
            var aReviewTime = a.srsData.time + srs.getLevelDurationMillis(a.srsData.level);
            var bReviewTime = b.srsData.time + srs.getLevelDurationMillis(b.srsData.level);
            return aReviewTime - bReviewTime;
        });

        var nowEntries = 0;
        var dates = {};
        var nowTimestamp = new Date().getTime();
        for (var entry of entries) {
            var timestamp = entry.srsData.time;
            if (timestamp === 0) {
                continue;
            }

            var levelDuration = srs.getLevelDurationMillis(entry.srsData.level);
            if (!levelDuration) {
                continue;
            }

            var reviewTimestamp = timestamp + levelDuration;

            if (reviewTimestamp < nowTimestamp) {
                nowEntries++;
                continue;
            }

            var date = new Date(reviewTimestamp);
            date.setHours(0, 0, 0, 0);
            var dateTimestamp = date.getTime();
            if (!dates[dateTimestamp]) {
                dates[dateTimestamp] = {};
            }

            var hour = new Date(reviewTimestamp).getHours();
            if (!dates[dateTimestamp][hour]) {
                dates[dateTimestamp][hour] = 0;
            }
            dates[dateTimestamp][hour]++;
        }

        if (nowEntries > 0) {
            appendScheduleEntry("Now", nowEntries);
        }

        for (var date in dates) {
            if (date > nowTimestamp) {
                appendScheduleDateEntry(date);
            }
            for (var hour in dates[date]) {
                appendScheduleEntry(hour + ":00", dates[date][hour]);
            }
        }

        if (scheduleEntriesElement.childElementCount > 0) {
            scheduleNoEntriesElement.style.display = "none";
        }
    }

    function appendScheduleDateEntry(date) {
        var scheduleDateEntryElement = scheduleDateEntryTemplateElement.cloneNode(true);
        scheduleDateEntryElement.style.display = "block";
        scheduleDateEntryElement.removeAttribute("id");

        var nameElement = scheduleDateEntryElement.querySelector("#main-schedule-date-entry-text");
        nameElement.innerHTML = new Date(parseInt(date)).toLocaleDateString("en-US", DATE_FORMAT);

        scheduleEntriesElement.appendChild(scheduleDateEntryElement);
    }

    function appendScheduleEntry(time, amount) {
        var scheduleEntryElement = scheduleEntryTemplateElement.cloneNode(true);
        scheduleEntryElement.style.display = "block";
        scheduleEntryElement.removeAttribute("id");

        var timeElement = scheduleEntryElement.querySelector("#main-schedule-entry-time");
        timeElement.innerHTML = time;

        var amountElement = scheduleEntryElement.querySelector("#main-schedule-entry-amount");
        amountElement.innerHTML = amount;

        scheduleEntriesElement.appendChild(scheduleEntryElement);
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
(function () {
    "use strict";

    var studyAmountElement = document.getElementById("study-amount");
    var reviewAmountElement = document.getElementById("review-amount");

    function refresh() {
        srs.database.refreshEntries().then(function () {
            var entries = srs.database.getEntries();
            refreshStudyAmount(entries);
            refreshReviewAmount(entries);
        });
    }

    function refreshStudyAmount(entries) {
        studyAmountElement.innerHTML = findEntriesForStudy(entries).length;
    }

    function refreshReviewAmount(entries) {
        reviewAmountElement.innerHTML = findEntriesForReview(entries).length;
    }

    function findEntriesForStudy(entries) {
        return entries.filter(function (entry) {
            return entry.srsData.level == 0;
        });
    }

    function findEntriesForReview(entries) {
        var now = Date.now();
        return entries.filter(function (entry) {
            var srsLevel = entry.srsData.level;
            if (!srsLevel) {
                return false;
            }

            var levelDurationInHours = Math.pow(2, srsLevel);
            var levelDurationInMillis = levelDurationInHours * 60 * 60 * 1000;

            return entry.srsData.time + levelDurationInMillis < now;
        });
    }

    srs.screenMain = {
        refresh: refresh
    };
})();
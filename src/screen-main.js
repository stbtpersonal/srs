(function () {
    "use strict";

    var studyAmountElement = document.getElementById("study-amount");
    var reviewAmountElement = document.getElementById("review-amount");
    var studyButton = document.getElementById("study");
    var reviewButton = document.getElementById("review");

    studyButton.onclick = srs.setScreenStudy;
    reviewButton.onclick = srs.setScreenReview;

    function refresh() {
        studyAmountElement.innerHTML = "?";
        reviewAmountElement.innerHTML = "?";
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
        refresh: refresh,
    };
})();
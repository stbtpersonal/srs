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
        srs.database.refreshEntries().then(function (entries) {
            refreshStudyAmount(entries);
            refreshReviewAmount(entries);
        });
    }

    function refreshStudyAmount(entries) {
        studyAmountElement.innerHTML = srs.findEntriesForStudy(entries).length;
    }

    function refreshReviewAmount(entries) {
        reviewAmountElement.innerHTML = srs.findEntriesForReview(entries).length;
    }

    srs.screenMain = {
        refresh: refresh,
    };
})();
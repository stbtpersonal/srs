(function () {
    "use strict";

    var ENTRIES_PER_SESSION = 5;

    var spinnerElement = document.getElementById("study-spinner");
    var contentsElement = document.getElementById("study-contents");
    var homeButton = document.getElementById("study-home");
    var frontElement = document.getElementById("study-front");
    var backElement = document.getElementById("study-back");
    var detailsFrontElement = document.getElementById("study-details-front");
    var detailsBackElement = document.getElementById("study-details-back");
    var notesElement = document.getElementById("study-notes");
    var previousButton = document.getElementById("study-previous");
    var nextButton = document.getElementById("study-next");

    var sessionEntries = [];
    var visibleEntryIndex = 0;

    homeButton.onclick = function () { srs.setScreenMain() };
    previousButton.onclick = function () { goBack() };
    nextButton.onclick = function () { goForward() };

    document.addEventListener("keyup", function (event) {
        if (srs.isScreenStudyShown()) {
            if (event.key === "ArrowLeft") {
                goBack();
            }
            else if (event.key === "ArrowRight") {
                goForward();
            }
        }
    });

    function startNewSession() {
        showSpinner();
        sessionEntries = [];
        visibleEntryIndex = 0;
        srs.database.refreshEntries().then(function (result) {
            var studyEntries = srs.findEntriesForStudy(result.entries);
            sessionEntries = studyEntries.slice(0, ENTRIES_PER_SESSION);

            refreshEntry();
            showContents();
        });
    }

    function showSpinner() {
        spinnerElement.style.display = "block";
        contentsElement.style.display = "none";
    }

    function showContents() {
        spinnerElement.style.display = "none";
        contentsElement.style.display = "block";
    }

    function refreshEntry() {
        if (sessionEntries.length === 0) {
            endSession();
            return;
        }

        var visibleEntry = sessionEntries[visibleEntryIndex];

        frontElement.innerHTML = visibleEntry.srsData.front[0];
        backElement.innerHTML = visibleEntry.srsData.back[0];
        detailsFrontElement.innerHTML = srs.arrayToString(visibleEntry.srsData.front);
        detailsBackElement.innerHTML = srs.arrayToString(visibleEntry.srsData.back);
        notesElement.innerHTML = visibleEntry.srsData.notes;
    }

    function goBack() {
        if (visibleEntryIndex === 0) {
            return;
        }

        visibleEntryIndex--;
        refreshEntry();
    }

    function goForward() {
        if (visibleEntryIndex === sessionEntries.length - 1) {
            startQuiz();
            return;
        }

        visibleEntryIndex++;
        refreshEntry();
    }

    function startQuiz() {
        srs.setScreenReview(sessionEntries);
    }

    function endSession() {
        srs.setScreenMain();
    }

    srs.screenStudy = {
        startNewSession: startNewSession,
    }
})();
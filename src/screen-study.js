(function () {
    "use strict";

    var ENTRIES_PER_SESSION = 5;

    var homeButton = document.getElementById("study-home");
    var japaneseElement = document.getElementById("study-japanese");
    var englishElement = document.getElementById("study-english");
    var mnemonicElement = document.getElementById("study-mnemonic");
    var examplesElement = document.getElementById("study-examples");
    var previousButton = document.getElementById("study-previous");
    var nextButton = document.getElementById("study-next");
    var quizButton = document.getElementById("study-quiz");

    var sessionEntries = [];
    var visibleEntryIndex = 0;

    homeButton.onclick = function () { srs.setScreenMain() };
    previousButton.onclick = function () { goBack() };
    nextButton.onclick = function () { goForward() };
    quizButton.onclick = function () { startQuiz() };

    function startNewSession() {
        sessionEntries = [];
        visibleEntryIndex = 0;
        srs.database.refreshEntries().then(function (entries) {
            var studyEntries = srs.findEntriesForStudy(entries);
            sessionEntries = studyEntries.slice(0, ENTRIES_PER_SESSION);

            refreshEntry();
        });
    }

    function refreshEntry() {
        if (sessionEntries.length === 0) {
            endSession();
            return;
        }

        var visibleEntry = sessionEntries[visibleEntryIndex];

        japaneseElement.innerHTML = visibleEntry.srsData.japanese;
        englishElement.innerHTML = visibleEntry.srsData.english;
        mnemonicElement.innerHTML = visibleEntry.srsData.mnemonic;
        examplesElement.innerHTML = "";

        for (var example of visibleEntry.srsData.examples) {
            var exampleElement = document.createElement("div");
            exampleElement.innerHTML = example;

            examplesElement.appendChild(exampleElement);
        }
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
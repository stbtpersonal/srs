(function () {
    "use strict";

    var ENTRIES_PER_SESSION = 5;

    var spinnerElement = document.getElementById("study-spinner");
    var contentsElement = document.getElementById("study-contents");
    var homeButton = document.getElementById("study-home");
    var japaneseElement = document.getElementById("study-japanese");
    var englishElement = document.getElementById("study-english");
    var allJapaneseElement = document.getElementById("study-all-japanese");
    var allEnglishElement = document.getElementById("study-all-english");
    var explanationElement = document.getElementById("study-explanation");
    var mnemonicElement = document.getElementById("study-mnemonic");
    var examplesElement = document.getElementById("study-examples");
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
        srs.database.refreshEntries().then(function (entries) {
            var studyEntries = srs.findEntriesForStudy(entries);
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

        japaneseElement.innerHTML = visibleEntry.srsData.japanese[0];
        englishElement.innerHTML = visibleEntry.srsData.english[0];
        allJapaneseElement.innerHTML = srs.arrayToString(visibleEntry.srsData.japanese);
        allEnglishElement.innerHTML = srs.arrayToString(visibleEntry.srsData.english);
        explanationElement.innerHTML = visibleEntry.srsData.explanation;
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
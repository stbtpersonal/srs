(function () {
    "use strict";

    var ENTRY_TYPE_J_TO_E = "J_TO_E";
    var ENTRY_TYPE_E_TO_J = "E_TO_J";

    var homeButton = document.getElementById("review-home");
    var toTranslateElement = document.getElementById("review-to-translate");
    var translationInputElement = document.getElementById("review-translation");
    var submitButton = document.getElementById("review-submit");
    var nextButton = document.getElementById("review-next");

    var sessionEntries = [];
    var visibleEntryIndex = 0;

    homeButton.onclick = srs.setScreenMain;
    submitButton.onclick = submit;
    nextButton.onclick = refreshEntry;

    function startQuizSession(quizEntries) {
        sessionEntries = [];
        visibleEntryIndex = 0;
        buildSessionEntries(quizEntries);
        refreshEntry();
    }

    function startReviewSession() {

    }

    function buildSessionEntries(entries) {
        sessionEntries = entries.flatMap(function (entry) {
            var jToEEntry = {
                srsEntry: entry,
                type: ENTRY_TYPE_J_TO_E
            };
            var eToJEntry = {
                srsEntry: entry,
                type: ENTRY_TYPE_E_TO_J
            };

            return [jToEEntry, eToJEntry];
        });
    }

    function refreshEntry() {
        var randomIndex = Math.floor(Math.random() * sessionEntries.length);
        var visibleEntry = sessionEntries[randomIndex];

        var srsData = visibleEntry.srsEntry.srsData;
        if (visibleEntry.type === ENTRY_TYPE_J_TO_E) {
            toTranslateElement.innerHTML = srsData.japanese;
        }
        else {
            toTranslateElement.innerHTML = srsData.english;
        }

        visibleEntryIndex = randomIndex;

        translationInputElement.value = "";
        translationInputElement.style.backgroundColor = "";
    }

    function submit() {
        var answer = translationInputElement.value;

        var visibleEntry = sessionEntries[visibleEntryIndex];
        var srsData = visibleEntry.srsEntry.srsData;
        var expectedAnswers = visibleEntry.type === ENTRY_TYPE_J_TO_E ? srsData.english : srsData.japanese;

        if (!expectedAnswers.includes(answer)) {
            translationInputElement.style.backgroundColor = "red";
        }
        else {
            translationInputElement.style.backgroundColor = "green";
        }
    }

    srs.screenReview = {
        startQuizSession: startQuizSession,
        startReviewSession: startReviewSession,
    };
})();
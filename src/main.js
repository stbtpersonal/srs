(function () {
    "use strict";

    var initializingScreenElement = document.getElementById("initializing-screen");
    var signInScreenElement = document.getElementById("sign-in-screen");
    var mainScreenElement = document.getElementById("main-screen");
    var studyScreenElement = document.getElementById("study-screen");
    var reviewScreenElement = document.getElementById("review-screen");

    function setScreen(screenElement) {
        initializingScreenElement.style.display = "none";
        signInScreenElement.style.display = "none";
        mainScreenElement.style.display = "none";
        studyScreenElement.style.display = "none";
        reviewScreenElement.style.display = "none";

        screenElement.style.display = "block";
    }

    function setScreenInitializing() {
        setScreen(initializingScreenElement);
    }

    function setScreenSignIn() {
        setScreen(signInScreenElement);
    }

    function setScreenMain() {
        setScreen(mainScreenElement);

        srs.screenMain.refresh();
    }

    function setScreenStudy() {
        setScreen(studyScreenElement);

        srs.screenStudy.startNewSession();
    }

    function setScreenReview(quizEntries) {
        setScreen(reviewScreenElement);

        if (quizEntries) {
            srs.screenReview.startQuizSession(quizEntries);
        }
        else {
            srs.screenReview.startReviewSession();
        }
    }

    function isScreenStudyShown() {
        return studyScreenElement.style.display !== "none";
    }

    function isScreenReviewShown() {
        return reviewScreenElement.style.display !== "none";
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

    function arrayToString(array) {
        if (!array || array.length === 0) {
            return "";
        }
        return array.reduce(function (a, b) { return a + ", " + b });
    }

    setScreenInitializing();

    window.srs = {
        setScreenInitializing: setScreenInitializing,
        setScreenSignIn: setScreenSignIn,
        setScreenMain: setScreenMain,
        setScreenStudy: setScreenStudy,
        setScreenReview: setScreenReview,

        isScreenStudyShown: isScreenStudyShown,
        isScreenReviewShown: isScreenReviewShown,

        findEntriesForStudy: findEntriesForStudy,
        findEntriesForReview: findEntriesForReview,

        arrayToString: arrayToString,
    };
})();
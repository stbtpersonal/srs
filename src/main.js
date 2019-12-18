(function () {
    "use strict";

    var LEVEL_DURATIONS_IN_HOURS = [0, 4, 8, 23, 47, 167, 335, 719, 2879];

    var MAX_ENTRIES_BELOW_LEVEL_THRESHOLD = 100;
    var LEVEL_THRESHOLD = 5;

    var initializingScreenElement = document.getElementById("initializing-screen");
    var signInScreenElement = document.getElementById("sign-in-screen");
    var mainScreenElement = document.getElementById("main-screen");
    var studyScreenElement = document.getElementById("study-screen");
    var reviewScreenElement = document.getElementById("review-screen");
    var errorOverlayElement = document.getElementById("error-overlay");
    var errorDetailsElement = document.getElementById("error-details");

    window.onerror = function (event, source, lineNumber, columnNumber, error) { panic(error); }
    window.onunhandledrejection = function (event) { panic(event); }
    errorOverlayElement.onclick = function () { location.reload(true) };

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

    function panic(details) {
        console.error(details);
        errorDetailsElement.innerHTML = typeof (details) === "string" ? details : JSON.stringify(details);
        errorOverlayElement.style.display = "block";
    }

    function findEntriesForStudy(entries) {
        var entriesBelowThresholdCount = entries.filter(function (entry) {
            return entry.srsData.level > 0 && entry.srsData.level < LEVEL_THRESHOLD;
        }).length;
        if (entriesBelowThresholdCount >= MAX_ENTRIES_BELOW_LEVEL_THRESHOLD) {
            return [];
        }

        var studyEntries = entries.filter(function (entry) {
            return entry.srsData.level == 0;
        });
        return studyEntries.slice(0, MAX_ENTRIES_BELOW_LEVEL_THRESHOLD - entriesBelowThresholdCount);
    }

    function findEntriesForReview(entries) {
        var now = Date.now();
        return entries.filter(function (entry) {
            var srsLevel = entry.srsData.level;
            if (!srsLevel) {
                return false;
            }

            var levelDuration = getLevelDurationMillis(srsLevel);
            if (!levelDuration) {
                return false;
            }

            return entry.srsData.time + levelDuration < now;
        });
    }

    function getLevelDurationMillis(level) {
        if (level >= LEVEL_DURATIONS_IN_HOURS.length) {
            return 0;
        }

        var levelDurationInHours = LEVEL_DURATIONS_IN_HOURS[level];
        return levelDurationInHours * 60 * 60 * 1000;
    }

    function getLevelName(level) {
        if (level >= LEVEL_DURATIONS_IN_HOURS.length) {
            return "DONE";
        }
        return LEVEL_DURATIONS_IN_HOURS[level] + "h";
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

        panic: panic,

        findEntriesForStudy: findEntriesForStudy,
        findEntriesForReview: findEntriesForReview,
        getLevelDurationMillis: getLevelDurationMillis,
        getLevelName: getLevelName,

        arrayToString: arrayToString,
    };
})();
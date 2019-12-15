(function () {
    "use strict";

    var ENTRY_SELECTION_THRESHOLD = 10;

    var INPUT_TYPE_JAPANESE = "J";
    var INPUT_TYPE_ENGLISH = "E";

    var INPUT_TRANSFORMATION_DICTIONARY = {
        "a": "あ", "i": "い", "u": "う", "e": "え", "o": "お",
        "ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
        "sa": "さ", "shi": "し", "su": "す", "se": "せ", "so": "そ",
        "ta": "た", "chi": "ち", "tsu": "つ", "te": "て", "to": "と",
        "na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
        "ha": "は", "hi": "ひ", "fu": "ふ", "he": "へ", "ho": "ほ",
        "ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
        "ya": "や", "yu": "ゆ", "yo": "よ",
        "ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
        "wa": "わ", "wo": "を", "nn": "ん",

        "ga": "が", "gi": "ぎ", "gu": "ぐ", "ge": "げ", "go": "ご",
        "za": "ざ", "ji": "じ", "zu": "ず", "ze": "ぜ", "zo": "ぞ",
        "da": "だ", "di": "ぢ", "du": "づ", "de": "で", "do": "ど",
        "ba": "ば", "bi": "び", "bu": "ぶ", "be": "べ", "bo": "ぼ",
        "pa": "ぱ", "pi": "ぴ", "pu": "ぷ", "pe": "ぺ", "po": "ぽ",

        "kya": "きゃ", "kyu": "きゅ", "kyo": "きょ",
        "gya": "ぎゃ", "gyu": "ぎゅ", "gyo": "ぎょ",
        "nya": "にゃ", "nyu": "にゅ", "nyo": "にょ",
        "hya": "ひゃ", "hyu": "ひゅ", "hyo": "ひょ",
        "bya": "びゃ", "byu": "びゅ", "byo": "びょ",
        "pya": "ぴゃ", "pyu": "ぴゅ", "pyo": "ぴょ",
        "mya": "みゃ", "myu": "みゅ", "myo": "みょ",
        "rya": "りゃ", "ryu": "りゅ", "ryo": "りょ",
        "sha": "しゃ", "shu": "しゅ", "she": "しぇ", "sho": "しょ",
        "ja": "じゃ", "ju": "じゅ", "je": "じぇ", "jo": "じょ",
        "cha": "ちゃ", "chu": "ちゅ", "che": "ちぇ", "cho": "ちょ",
    };

    var SMALL_TSU_CONSONANTS = ["k", "s", "t", "h", "m", "y", "r", "w", "g", "z", "d", "b", "p", "j", "c"];

    var OVERLAY_GREEN = "rgba(0, 255, 0, 0.5)";
    var OVERLAY_YELLOW = "rgba(255, 255, 0, 0.5)";
    var OVERLAY_RED = "rgba(255, 0, 0, 0.5)";

    var RESULT_GREEN = "rgb(127, 255, 127)";
    var RESULT_RED = "rgb(255, 127, 127)";

    var spinnerElement = document.getElementById("review-spinner");
    var contentsElement = document.getElementById("review-contents");
    var homeButton = document.getElementById("review-home");
    var remainingElement = document.getElementById("review-remaining");
    var toTranslateElement = document.getElementById("review-to-translate");
    var resultElement = document.getElementById("review-result");
    var translationInputElement = document.getElementById("review-translation");
    var translationInputOverlayElement = document.getElementById("review-translation-overlay");
    var detailsElement = document.getElementById("review-details");
    var detailsFrontElement = document.getElementById("review-details-front");
    var detailsBackElement = document.getElementById("review-details-back");
    var notesElement = document.getElementById("review-notes");
    var nextButton = document.getElementById("review-next");

    var isQuizSession = false;
    var sessionEntries = [];
    var startEntryAmount = 0;
    var currentEntryAmount = 0;
    var visibleEntryIndex = 0;
    var wrongEntries = [];
    var isReviewingAnswer = false;

    homeButton.onclick = function () { srs.setScreenMain() };
    translationInputElement.oninput = function () { transformInput() };
    nextButton.onclick = function () { goForward() };

    document.addEventListener("keyup", function (event) {
        if (srs.isScreenReviewShown()) {
            if (event.key === "Enter" || event.key === "NumpadEnter") {
                goForward();
            }
        }
    });

    function startQuizSession(quizEntries) {
        reset();
        isQuizSession = true;
        startSession(quizEntries);
        showContents();
    }

    function startReviewSession() {
        showSpinner();
        reset();
        srs.database.refreshEntries().then(function (result) {
            var reviewEntries = srs.findEntriesForReview(result.entries);
            startSession(reviewEntries);
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

    function reset() {
        isQuizSession = false;
        sessionEntries = [];
        startEntryAmount = 0;
        currentEntryAmount = 0;
        visibleEntryIndex = 0;
        wrongEntries = [];
        isReviewingAnswer = false;
    }

    function startSession(entries) {
        buildSessionEntries(entries);

        startEntryAmount = entries.length;
        currentEntryAmount = entries.length;
        refreshRemaining();
        
        refreshEntry();
    }

    function buildSessionEntries(entries) {
        var entriesClone = entries.slice();
        shuffle(entriesClone);
        sessionEntries = entriesClone;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function refreshRemaining() {
        remainingElement.innerHTML = currentEntryAmount + "/" + startEntryAmount;
    }

    function refreshEntry() {
        if (sessionEntries.length === 0) {
            endSession();
            return;
        }

        var entrySelectionThreshold = min(ENTRY_SELECTION_THRESHOLD, sessionEntries.length);
        var randomIndex = Math.floor(Math.random() * entrySelectionThreshold);
        var visibleEntry = sessionEntries[randomIndex];

        var srsData = visibleEntry.srsData;
        toTranslateElement.innerHTML = srsData.front[0];
        
        visibleEntryIndex = randomIndex;

        resultElement.style.display = "none";

        translationInputElement.value = "";
        translationInputOverlayElement.style.backgroundColor = "transparent";
        translationInputElement.focus();
        isReviewingAnswer = false;

        detailsElement.style.display = "none";
        detailsFrontElement.innerHTML = srs.arrayToString(srsData.front);
        detailsBackElement.innerHTML = srs.arrayToString(srsData.back);
        notesElement.innerHTML = srsData.notes;
    }

    function min(left, right) {
        return left < right ? left : right;
    }

    function transformInput() {
        var lowerCaseInput = translationInputElement.value.toLowerCase();

        var visibleEntry = sessionEntries[visibleEntryIndex];
        if (visibleEntry.srsData.input === INPUT_TYPE_ENGLISH) {
            translationInputElement.value = lowerCaseInput;
            return;
        }

        var originalInput = lowerCaseInput;
        var transformedInput = "";

        function tryDictionaryTransform(keyLength) {
            var key = originalInput.substring(0, keyLength);
            var value = INPUT_TRANSFORMATION_DICTIONARY[key];
            if (value) {
                transformedInput += value;
                originalInput = originalInput.substring(keyLength);
                return true;
            }

            return false;
        }

        function trySmallTsuTransform() {
            if (originalInput.length < 2) {
                return false;
            }

            var firstCharacter = originalInput[0];
            var secondCharacter = originalInput[1];
            if (SMALL_TSU_CONSONANTS.includes(firstCharacter) && firstCharacter === secondCharacter) {
                transformedInput += "っ";
                originalInput = originalInput.substring(1);
                return true;
            }

            return false;
        }

        while (originalInput.length > 0) {
            var success = false;
            for (var i = 1; i <= 3 && i <= originalInput.length; i++) {
                success = tryDictionaryTransform(i);
                if (success) {
                    continue;
                }
            }

            if (!success) {
                success = trySmallTsuTransform();
            }

            if (!success) {
                transformedInput += originalInput[0];
                originalInput = originalInput.substring(1);
            }
        }

        translationInputElement.value = transformedInput;
    }

    function goForward() {
        if (!isAnswerValid()) {
            translationInputOverlayElement.style.backgroundColor = OVERLAY_YELLOW;
        }
        else if (!isReviewingAnswer) {
            submit();
        }
        else {
            refreshEntry();
        }
    }

    function isAnswerValid() {
        var answer = translationInputElement.value;
        return answer !== "";
    }

    function submit() {
        var answer = translationInputElement.value;
        var normalizedAnswer = normalize(answer);

        var visibleEntry = sessionEntries[visibleEntryIndex];
        var srsData = visibleEntry.srsData;
        var expectedAnswers = srsData.back;
        var normalizedExpectedAnswers = expectedAnswers.map(normalize);

        if (!normalizedExpectedAnswers.includes(normalizedAnswer)) {
            translationInputOverlayElement.style.backgroundColor = OVERLAY_RED;
            markEntryWrong(visibleEntry);
        }
        else {
            translationInputOverlayElement.style.backgroundColor = OVERLAY_GREEN;
            sessionEntries.splice(visibleEntryIndex, 1);
            tryCommitEntry(visibleEntry);
        }

        detailsElement.style.display = "block";
        isReviewingAnswer = true;
    }

    function normalize(text) {
        return text.toLowerCase().replace(/[^\sa-z\u3041-\u3096]/g, "");
    }

    function markEntryWrong(entry) {
        if (!containsEntry(wrongEntries, entry)) {
            wrongEntries.push(entry);

            var level = entry.srsData.level;
            entry.srsData.level = level <= 1 ? 1 : level - 1;
            updateEntry(entry);
        }
    }

    function tryCommitEntry(entry) {
        var isEntryFinished = !containsEntry(sessionEntries, entry);
        if (isEntryFinished) {
            var hasGotEntryRight = !containsEntry(wrongEntries, entry);
            if (hasGotEntryRight) {
                entry.srsData.level++;
                updateEntry(entry);

                resultElement.style.backgroundColor = RESULT_GREEN;
            }
            else {
                resultElement.style.backgroundColor = RESULT_RED;
            }
            resultElement.innerHTML = srs.getLevelName(entry.srsData.level);
            resultElement.style.display = "block";

            currentEntryAmount--;
            refreshRemaining();
        }
    }

    function updateEntry(entry) {
        var newSrsTime = new Date();
        newSrsTime.setHours(newSrsTime.getHours(), 0, 0, 0);
        entry.srsData.time = newSrsTime.getTime();

        srs.database.updateEntry(entry);
    }

    function containsEntry(entries, toFind) {
        return entries.filter(function (entry) { return entry.srsEntry === toFind.srsEntry }).length > 0;
    }

    function endSession() {
        if (isQuizSession) {
            srs.setScreenStudy();
        }
        else {
            srs.setScreenMain();
        }
    }

    srs.screenReview = {
        startQuizSession: startQuizSession,
        startReviewSession: startReviewSession,
    };
})();
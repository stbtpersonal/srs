(function () {
    "use strict";

    var initializingScreenElement = document.getElementById("initializing-screen");
    var signInScreenElement = document.getElementById("sign-in-screen");
    var mainScreenElement = document.getElementById("main-screen");
    var studyScreenElement = document.getElementById("study-screen");

    function setScreen(screenElement) {
        initializingScreenElement.style.display = "none";
        signInScreenElement.style.display = "none";
        mainScreenElement.style.display = "none";
        studyScreenElement.style.display = "none";

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
    }

    window.srs = {
        setScreenInitializing: setScreenInitializing,
        setScreenSignIn: setScreenSignIn,
        setScreenMain: setScreenMain,
        setScreenStudy: setScreenStudy,
    };
})();
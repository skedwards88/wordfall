import React from "react";
import {gameInit} from "../logic/gameInit";
import {gameReducer} from "../logic/gameReducer";
import Game from "./Game";
import Rules from "./Rules";
import Heart from "./Heart";
import IosWarning from "./IosWarning";
import {
  handleAppInstalled,
  handleBeforeInstallPrompt,
} from "../logic/handleInstall";

// iOS doesn't consistently support the falling animation
// so detect if iOS so that we can display a warning
function iosQ() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  let isIOSDevice = /iphone|ipad/.test(userAgent);
  // newer ipads no longer state that they are ipads, so need do more hacky checks
  if (!isIOSDevice) {
    isIOSDevice = navigator.maxTouchPoints > 0 && /mac/.test(userAgent);
  }

  return isIOSDevice;
}

function displayIOSWarningQ() {
  const isIOS = iosQ();
  if (!isIOS) {
    return false;
  }

  const lastSawIOSWarning = JSON.parse(
    localStorage.getItem("wordfallLastSawIOSWarning"),
  );

  if (!lastSawIOSWarning) {
    return true;
  }

  const warningDelta = Date.now() - parseInt(lastSawIOSWarning);

  const msInDay = 1000 * 60 * 60 * 24;

  const daysSinceWarning = warningDelta / msInDay;

  if (daysSinceWarning > 7) {
    return true;
  }

  return false;
}

export default function App() {
  const [displayIOSWarning, setDisplayIOSWarning] = React.useState(() =>
    displayIOSWarningQ(),
  );

  React.useEffect(() => {
    if (displayIOSWarning) {
      window.localStorage.setItem(
        "wordfallLastSawIOSWarning",
        JSON.stringify(Date.now()),
      );
    }
  }, [displayIOSWarning]);

  const [display, setDisplay] = React.useState(
    displayIOSWarning ? "iOS" : "game",
  );
  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {},
    gameInit,
  );

  React.useEffect(() => {
    window.localStorage.setItem("wordfallGameState", JSON.stringify(gameState));
  }, [gameState]);

  React.useEffect(() => {
    window.addEventListener("beforeinstallprompt", (event) =>
      handleBeforeInstallPrompt(
        event,
        setInstallPromptEvent,
        setShowInstallButton,
      ),
    );
    return () =>
      window.removeEventListener("beforeinstallprompt", (event) =>
        handleBeforeInstallPrompt(
          event,
          setInstallPromptEvent,
          setShowInstallButton,
        ),
      );
  }, []);

  React.useEffect(() => {
    window.addEventListener("appinstalled", () =>
      handleAppInstalled(setInstallPromptEvent, setShowInstallButton),
    );
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);
  switch (display) {
    case "heart":
      return <Heart setDisplay={setDisplay} />;

    case "info":
      return <Rules setDisplay={setDisplay} />;

    case "iOS":
      return (
        <IosWarning
          setDisplay={setDisplay}
          setDisplayIOSWarning={setDisplayIOSWarning}
        />
      );

    default:
      return (
        <Game
          gameState={gameState}
          dispatchGameState={dispatchGameState}
          setDisplay={setDisplay}
          setInstallPromptEvent={setInstallPromptEvent}
          showInstallButton={showInstallButton}
          installPromptEvent={installPromptEvent}
        ></Game>
      );
  }
}

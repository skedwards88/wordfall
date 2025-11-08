import React from "react";
import {gameInit} from "../logic/gameInit";
import {gameReducer} from "../logic/gameReducer";
import Game from "./Game";
import Rules from "./Rules";
import MoreGames from "@skedwards88/shared-components/src/components/MoreGames";
import IosWarning from "./IosWarning";
import {
  handleAppInstalled,
  handleBeforeInstallPrompt,
} from "@skedwards88/shared-components/src/logic/handleInstall";
import InstallOverview from "@skedwards88/shared-components/src/components/InstallOverview";
import PWAInstall from "@skedwards88/shared-components/src/components/PWAInstall";
import {getUserId} from "@skedwards88/shared-components/src/logic/getUserId";
import {v4 as uuidv4} from "uuid";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";
import {isRunningStandalone} from "@skedwards88/shared-components/src/logic/isRunningStandalone";

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
  // *****
  // Install handling setup
  // *****
  // Set up states that will be used by the handleAppInstalled and handleBeforeInstallPrompt listeners
  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = (event) =>
      handleBeforeInstallPrompt(
        event,
        setInstallPromptEvent,
        setShowInstallButton,
      );

    window.addEventListener("beforeinstallprompt", listener);

    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = () =>
      handleAppInstalled(setInstallPromptEvent, setShowInstallButton);

    window.addEventListener("appinstalled", listener);

    return () => window.removeEventListener("appinstalled", listener);
  }, []);
  // *****
  // End install handling setup
  // *****

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

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {},
    gameInit,
  );

  const previousStateRef = React.useRef(gameState);

  React.useEffect(() => {
    window.localStorage.setItem("wordfallGameState", JSON.stringify(gameState));
  }, [gameState]);

  // ******
  // Start analytics setup
  // ******

  // Store userID so I don't have to read local storage every time
  const userId = getUserId("wordfall_uid");

  // Store sessionID as a ref so I have the same session ID until app refresh
  const sessionIdRef = React.useRef(uuidv4());
  const sessionId = sessionIdRef.current;

  // Send analytics on load
  React.useEffect(() => {
    sendAnalyticsCF({
      userId,
      sessionId,
      analyticsToLog: [
        {
          eventName: "app_load",
          // os, browser, and isMobile are parsed on the server from the user agent headers
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          isStandalone: isRunningStandalone(),
          devicePixelRatio: window.devicePixelRatio,
        },
      ],
    });
    // Just run once on app load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send analytics following reducer updates, if needed
  React.useEffect(() => {
    const previousState = previousStateRef.current;

    const analyticsToLog = [];

    // If a new color was added, infer level completion
    if (previousState.colors.length < gameState.colors.length) {
      analyticsToLog.push({
        eventName: "new_level",
        eventInfo: {
          level: previousState.colors.length,
        },
      });
    }

    // If colors reset to 1, infer new game
    if (gameState.colors.length === 1 && previousState.colors.length !== 1) {
      analyticsToLog.push({eventName: "new_game"});
    }

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousStateRef.current = gameState;
  }, [gameState, sessionId, userId]);

  // ******
  // End analytics setup
  // ******

  switch (display) {
    case "heart":
      return (
        <MoreGames
          setDisplay={setDisplay}
          games={["crossjig", "lexlet", "blobble", "gribbles", "logicGrid"]}
          repoName={"wordfall"}
          includeExtraInfo={true}
          includeWordAttribution={true}
        ></MoreGames>
      );

    case "info":
      return <Rules setDisplay={setDisplay} />;

    case "iOS":
      return (
        <IosWarning
          setDisplay={setDisplay}
          setDisplayIOSWarning={setDisplayIOSWarning}
        />
      );

    case "installOverview":
      return (
        <InstallOverview
          setDisplay={setDisplay}
          setInstallPromptEvent={setInstallPromptEvent}
          showInstallButton={showInstallButton}
          installPromptEvent={installPromptEvent}
        ></InstallOverview>
      );

    case "pwaInstall":
      return (
        <PWAInstall
          setDisplay={setDisplay}
          pwaLink={"https://skedwards88.github.io/wordfall"}
        ></PWAInstall>
      );

    default:
      return (
        <Game
          gameState={gameState}
          dispatchGameState={dispatchGameState}
          setDisplay={setDisplay}
        ></Game>
      );
  }
}

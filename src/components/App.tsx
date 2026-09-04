import React from "react";
import {gameInit} from "../logic/gameInit";
import {gameReducer} from "../logic/gameReducer";
import Game from "./Game";
import Rules from "./Rules";
import MoreGames from "@skedwards88/shared-components/src/components/MoreGames";
import IosWarning from "./IosWarning";
import {useInstallPrompt} from "@skedwards88/shared-components/src/logic/handleInstall";
import InstallOverview from "@skedwards88/shared-components/src/components/InstallOverview";
import PWAInstall from "@skedwards88/shared-components/src/components/PWAInstall";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import {inferEventsToLog} from "../logic/inferEventsToLog";
import {getFromStorage} from "@skedwards88/shared-components/src/logic/safeStorage";

export type DisplayState =
  "game" | "iOS" | "heart" | "info" | "installOverview" | "pwaInstall";

// iOS doesn't consistently support the falling animation
// so detect if iOS so that we can display a warning
function iosQ(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  let isIOSDevice = /iphone|ipad/.test(userAgent);
  // newer ipads no longer state that they are ipads, so need do more hacky checks
  if (!isIOSDevice) {
    isIOSDevice = navigator.maxTouchPoints > 0 && /mac/.test(userAgent);
  }

  return isIOSDevice;
}

function displayIOSWarningQ(): boolean {
  const isIOS = iosQ();
  if (!isIOS) {
    return false;
  }

  const lastSawIOSWarning = getFromStorage<string>("wordfallLastSawIOSWarning");

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

export default function App(): React.JSX.Element {
  const {userId, sessionId} = useMetadataContext();

  // This must live at the top level component, not in InstallOverview where it is used, since the InstallOverview is not rendered initially and therefore misses its chance to attach the listeners
  const {installPromptEvent, showInstallButton, handleInstall} =
    useInstallPrompt({userId, sessionId});

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

  const [display, setDisplay] = React.useState<DisplayState>(
    displayIOSWarning ? "iOS" : "game",
  );

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {},
    gameInit,
  );

  React.useEffect(() => {
    window.localStorage.setItem("wordfallGameState", JSON.stringify(gameState));
  }, [gameState]);

  // Store the previous state so that we can infer which analytics events to send
  const previousStateRef = React.useRef(gameState);

  // Send analytics following reducer updates, if needed
  React.useEffect(() => {
    const previousState = previousStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, gameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousStateRef.current = gameState;
  }, [gameState, sessionId, userId]);

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
          installPromptEvent={installPromptEvent}
          showInstallButton={showInstallButton}
          handleInstall={handleInstall}
          userId={userId}
          sessionId={sessionId}
        ></InstallOverview>
      );

    case "pwaInstall":
      return (
        <PWAInstall
          setDisplay={setDisplay}
          pwaLink={"https://wordfall.twistedtrailgames.com/"}
          userId={userId}
          sessionId={sessionId}
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

import React from "react";
import Share from "@skedwards88/shared-components/src/components/Share";
import {isRunningStandalone} from "@skedwards88/shared-components/src/logic/isRunningStandalone";

export default function ControlBar({dispatchGameState, setDisplay}) {
  return (
    <div id="controls">
      <button
        id="newGameButton"
        onClick={() => {
          dispatchGameState({
            action: "newGame",
          });

          setDisplay("game");
        }}
      ></button>

      <button
        id="infoButton"
        onClick={() => {
          setDisplay("info");
        }}
      ></button>

      <button id="heartButton" onClick={() => setDisplay("heart")}></button>

      <Share
        appName="Wordfall"
        text="Check out this word game!"
        url="https://skedwards88.github.io/wordfall/"
        origin="control bar"
        id="shareButton"
      ></Share>

      {!isRunningStandalone() ? (
        <button
          id="installButton"
          onClick={() => setDisplay("installOverview")}
        ></button>
      ) : (
        <></>
      )}
    </div>
  );
}

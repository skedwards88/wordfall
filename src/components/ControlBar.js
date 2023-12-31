import React from "react";
import {handleInstall} from "../logic/handleInstall";
import {handleShare} from "./Share";

export default function ControlBar({
  dispatchGameState,
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
}) {
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

      {navigator.canShare ? (
        <button
          id="shareButton"
          onClick={() => {
            setDisplay("game");
            handleShare({
              text: "Try out this Wordfall puzzle:",
            });
          }}
        ></button>
      ) : (
        <></>
      )}

      {showInstallButton && installPromptEvent ? (
        <button
          id="installButton"
          onClick={() =>
            handleInstall(installPromptEvent, setInstallPromptEvent)
          }
        ></button>
      ) : (
        <></>
      )}
    </div>
  );
}

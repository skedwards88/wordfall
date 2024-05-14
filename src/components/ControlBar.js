import React from "react";
import {handleInstall} from "../logic/handleInstall";
import {handleShare} from "../logic/handleShare";

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
            handleShare({
              appName: "Wordfall",
              text: "Try out this Wordfall puzzle:",
              url: "https://skedwards88.github.io/wordfall/",
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

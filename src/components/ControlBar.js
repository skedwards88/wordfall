import React from "react";
import {handleInstall} from "../logic/handleInstall";
import {handleShare} from "./Share";

export default function ControlBar({
  dispatchGameState,
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
  gameState,
}) {
  return (
    <div id="controls">
      <button
        id={
          gameState.bonuses.shuffle.active
            ? "shuffleBonusButtonActive"
            : "shuffleBonusButton"
        }
        disabled={gameState.bonuses.shuffle.number === 0}
        onClick={() => {
          dispatchGameState({
            action: "clickBonus",
            bonusType: "shuffle",
          });
        }}
      >
        <div className="bonusCounter">{gameState.bonuses.shuffle.number}</div>
      </button>

      <button
        id={
          gameState.bonuses.remove.active
            ? "removeBonusButtonActive"
            : "removeBonusButton"
        }
        disabled={gameState.bonuses.remove.number === 0}
        onClick={() => {
          dispatchGameState({
            action: "clickBonus",
            bonusType: "remove",
          });
        }}
      >
        <div className="bonusCounter">{gameState.bonuses.remove.number}</div>
      </button>

      <button
        id={
          gameState.bonuses.swap.active
            ? "swapBonusButtonActive"
            : "swapBonusButton"
        }
        disabled={gameState.bonuses.swap.number === 0}
        onClick={() => {
          dispatchGameState({
            action: "clickBonus",
            bonusType: "swap",
          });
        }}
      >
        <div className="bonusCounter">{gameState.bonuses.swap.number}</div>
      </button>

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
              text: "Try out this Word Rush puzzle:",
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

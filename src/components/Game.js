import React from "react";
import ControlBar from "./ControlBar";
import Board from "./Board";
import {WordResult} from "./WordResult";
import {Progress} from "./Progress";

export default function Game({
  gameState,
  dispatchGameState,
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
}) {
  return (
    <div
      className="App"
      id="word-rush"
      onPointerUp={(e) => {
        e.preventDefault();

        dispatchGameState({
          action: "endWord",
        });
      }}
    >
      <ControlBar
        dispatchGameState={dispatchGameState}
        setDisplay={setDisplay}
        setInstallPromptEvent={setInstallPromptEvent}
        showInstallButton={showInstallButton}
        installPromptEvent={installPromptEvent}
      ></ControlBar>

      <div id="bonuses">
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
      </div>

      <Progress
        progress={gameState.progress}
        colors={gameState.colors}
      ></Progress>

      <div id="currentWord">
        {gameState.playedIndexes.length > 0
          ? gameState.playedIndexes
              .map((index) => gameState.letterData[index].letter)
              .join("")
              .toUpperCase()
          : " "}
      </div>

      <div id="bonusText">{gameState.bonusText}</div>

      <WordResult result={gameState.result} />

      <Board
        letterData={gameState.letterData}
        playedIndexes={gameState.playedIndexes}
        dispatchGameState={dispatchGameState}
        colors={gameState.colors}
        numRows={gameState.numRows}
      ></Board>
    </div>
  );
}

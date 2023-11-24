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

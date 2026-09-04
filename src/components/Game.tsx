import ControlBar from "./ControlBar";
import BonusBar from "./BonusBar";
import Board from "./Board";
import {WordResult} from "./WordResult";
import {Progress} from "./Progress";
import {type DisplayState} from "./App";
import {type GameState} from "../logic/gameInit";
import React from "react";
import {type ReducerPayload} from "../logic/gameReducer";

export default function Game({
  gameState,
  dispatchGameState,
  setDisplay,
}: {
  gameState: GameState;
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div
      className="App"
      id="wordfall"
      onPointerUp={(e) => {
        e.preventDefault();

        dispatchGameState({
          action: "endWord",
        });
      }}
      onClick={(e) => {
        e.preventDefault();

        if (Object.values(gameState.bonuses).some((bonus) => bonus.active)) {
          dispatchGameState({
            action: "deactivateBonus",
          });
        }
      }}
    >
      <ControlBar
        dispatchGameState={dispatchGameState}
        setDisplay={setDisplay}
      ></ControlBar>

      <BonusBar
        gameState={gameState}
        dispatchGameState={dispatchGameState}
      ></BonusBar>

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
        swapBonusIndex={gameState.bonuses.swap.firstIndex}
        dispatchGameState={dispatchGameState}
        colors={gameState.colors}
        numRows={gameState.numRows}
        wordInProgress={gameState.wordInProgress}
      ></Board>
    </div>
  );
}

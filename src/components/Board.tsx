import {type LetterQu} from "@skedwards88/word_logic/dist/Types";
import React from "react";
import {type ReducerPayload} from "../logic/gameReducer";
import {type LetterData} from "../logic/gameInit";

function Letter({
  letter,
  color,
  letterIsSelected,
  index,
  dispatchGameState,
  wordInProgress,
}: {
  letter: LetterQu;
  color: string;
  letterIsSelected: boolean;
  index: number;
  dispatchGameState: React.Dispatch<ReducerPayload>;
  wordInProgress: boolean;
}): React.JSX.Element {
  const letterRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const letterDiv = letterRef.current;

    if (!letterDiv) {
      return;
    }

    const currentClasses = letterDiv.className
      .split(" ")
      .filter((entry) => entry !== "selected");

    const newClass = letterIsSelected
      ? [...currentClasses, "selected"].join(" ")
      : currentClasses.join(" ");

    letterDiv.className = newClass;
  }, [letterIsSelected]);

  function handlePointerDown(event: React.PointerEvent, index: number): void {
    event.preventDefault();

    event.currentTarget.releasePointerCapture(event.pointerId);

    dispatchGameState({
      action: "startWord",
      letterIndex: index,
    });
  }

  function handlePointerEnter(event: React.PointerEvent, index: number): void {
    event.preventDefault();

    if (wordInProgress) {
      dispatchGameState({
        action: "updateWord",
        letterIndex: index,
      });
    }
  }

  function handlePointerUp(event: React.PointerEvent): void {
    event.preventDefault();

    event.stopPropagation();

    dispatchGameState({
      action: "endWord",
    });
  }

  function handleClick(event: React.MouseEvent): void {
    // Stop clicking a letter from bubbling up to the wider click event and cancelling a bonus
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      className={`letter`}
      style={{
        backgroundColor: `${color}`,
      }}
      ref={letterRef}
      onPointerDown={(e) => handlePointerDown(e, index)}
      onPointerEnter={(e) => handlePointerEnter(e, index)}
      onPointerUp={(e) => handlePointerUp(e)}
      onClick={(e) => handleClick(e)}
      draggable={false}
    >
      {letter}
    </div>
  );
}

export default function Board({
  letterData,
  playedIndexes,
  swapBonusIndex,
  dispatchGameState,
  colors,
  numRows,
  wordInProgress,
}: {
  letterData: LetterData[];
  playedIndexes: number[];
  swapBonusIndex: number | undefined;
  dispatchGameState: React.Dispatch<ReducerPayload>;
  colors: string[];
  numRows: number;
  wordInProgress: boolean;
}): React.JSX.Element {
  const boardRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const boardDiv = boardRef.current;

    if (!boardDiv) {
      return;
    }

    const letterDivs = boardDiv.children;

    const rawRepresentativeOffset = window
      .getComputedStyle(boardDiv)
      .getPropertyValue("grid-template-rows")
      .split(" ")[0];

    const representativeOffset = parseInt(
      rawRepresentativeOffset.substring(0, rawRepresentativeOffset.length - 2),
    ); // to drop the px units

    const diffs = letterData.map((datum, index) =>
      datum.previousIndex === undefined
        ? NaN
        : Math.floor(index / numRows) -
          Math.floor(datum.previousIndex / numRows),
    );

    const translateYs = diffs.map((diff, index) =>
      diff >= 0
        ? diff * representativeOffset
        : representativeOffset * (Math.floor(index / numRows) + 1),
    );
    const startOpacities = diffs.map((diff) => (diff >= 0 ? 1 : 0));

    // Set CSS properties
    // ios doesn't animate properly, but tying the animation to a class name helps it be a bit better
    Array.from(letterDivs).forEach((div, index) => {
      (div as HTMLElement).style.setProperty(
        "--startY",
        `-${translateYs[index]}px`,
      );

      (div as HTMLElement).style.setProperty(
        "--startOpacity",
        `${startOpacities[index]}`,
      );

      if (diffs[index] != 0) {
        div.classList.add("animateFall");
      } else {
        div.classList.remove("animateFall");
      }
    });
  }, [letterData, numRows]);

  const board = letterData.map((letterDatum, index) => (
    <Letter
      letter={letterDatum.letter}
      color={colors[letterDatum.colorIndex]}
      letterIsSelected={
        playedIndexes.includes(index) || swapBonusIndex === index
      }
      index={index}
      dispatchGameState={dispatchGameState}
      key={letterDatum.id}
      wordInProgress={wordInProgress}
    ></Letter>
  ));

  return (
    <div id="board" ref={boardRef}>
      {board}{" "}
    </div>
  );
}

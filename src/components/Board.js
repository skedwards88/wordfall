import React from "react";

function Letter({
  letter,
  color,
  letterIsSelected,
  index,
  dispatchGameState,
  wordInProgress,
}) {
  const letterRef = React.useRef();

  React.useLayoutEffect(() => {
    const letterDiv = letterRef.current;
    const currentClasses = letterDiv.className
      .split(" ")
      .filter((entry) => entry !== "selected");

    const newClass = letterIsSelected
      ? [...currentClasses, "selected"].join(" ")
      : currentClasses.join(" ");

    letterDiv.className = newClass;
  }, [letterIsSelected]);

  function handlePointerDown(e, index) {
    e.preventDefault();
    e.target.releasePointerCapture(e.pointerId);
    dispatchGameState({
      action: "startWord",
      letterIndex: index,
    });
  }

  function handlePointerEnter(e, index) {
    e.preventDefault();
    if (wordInProgress) {
      dispatchGameState({
        action: "updateWord",
        letterIndex: index,
      });
    }
  }

  function handlePointerUp(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatchGameState({
      action: "endWord",
    });
  }

  function handleClick(e) {
    // Stop clicking a letter from bubbling up to the wider click event and cancelling a bonus
    e.preventDefault();
    e.stopPropagation();
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
}) {
  const boardRef = React.useRef();

  React.useLayoutEffect(() => {
    const boardDiv = boardRef.current;
    const letterDivs = boardDiv.children;

    let representativeOffset = window
      .getComputedStyle(boardDiv)
      .getPropertyValue("grid-template-rows")
      .split(" ")[0];
    representativeOffset = parseInt(
      representativeOffset.substring(0, representativeOffset.length - 2),
    ); // to drop the px units

    const diffs = letterData.map(
      (datum, index) =>
        Math.floor(index / numRows) - Math.floor(datum.previousIndex / numRows),
    );
    const translateYs = diffs.map((diff, index) =>
      diff >= 0
        ? diff * representativeOffset
        : representativeOffset * (Math.floor(index / numRows) + 1),
    );
    const startOpacities = diffs.map((diff) => (diff >= 0 ? 1 : 0));

    // Set CSS properties
    Array.from(letterDivs).forEach((div, index) => {
      div.style.setProperty("--startY", `-${translateYs[index]}px`);
      div.style.setProperty("--startOpacity", `${startOpacities[index]}`);
    });
  }, [letterData]);

  const board = letterData.map((letterDatum, index) => (
    <Letter
      letter={letterDatum.letter}
      color={colors[letterDatum.colorIndex]}
      letterIsSelected={
        playedIndexes.includes(index) || swapBonusIndex === index
      }
      index={index}
      draggable={false}
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

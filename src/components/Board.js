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
  numColumns,
  wordInProgress,
}) {
  const boardRef = React.useRef();

  React.useLayoutEffect(() => {
    console.log("EFFECT");
    console.log(JSON.stringify(letterData));
    const boardDiv = boardRef.current;
    const letterDivs = boardDiv.children;

    let representativeOffset = window
      .getComputedStyle(boardDiv)
      .getPropertyValue("grid-template-rows")
      .split(" ")[0];
    representativeOffset = parseInt(
      representativeOffset.substring(0, representativeOffset.length - 2),
    ); // to drop the px units

    const yDiffs = letterData.map(
      (datum, index) =>
        Math.floor(index / numRows) - Math.floor(datum.previousIndex / numRows),
    );
    const xDiffs = letterData.map(
      (datum, index) => (index - datum.previousIndex) % numColumns,
    );
    console.log(JSON.stringify(yDiffs));
    console.log(JSON.stringify(xDiffs));
    const translateYs = yDiffs.map((diff, index) =>
      diff >= 0
        ? diff * representativeOffset
        : representativeOffset * (Math.floor(index / numRows) + 1),
    );
    const translateXs = xDiffs.map((diff, index) =>
      diff >= 0
        ? diff * representativeOffset //todo need x offset?
        : representativeOffset * (Math.floor(index / numRows) + 1),
    );
    console.log(JSON.stringify(translateYs));
    console.log(JSON.stringify(translateXs));
    const startOpacities = yDiffs.map((diff) => (diff >= 0 ? 1 : 0)); //todo x too

    // Set CSS properties
    // ios doesn't animate properly, but tying the animation to a class name helps it be a bit better
    Array.from(letterDivs).forEach((div, index) => {
      div.style.setProperty("--startY", `-${translateYs[index]}px`);
      div.style.setProperty("--startX", `-${translateXs[index]}px`);
      div.style.setProperty("--startOpacity", `${startOpacities[index]}`);
      yDiffs[index] != 0
        ? div.classList.add("animateFall")
        : div.classList.remove("animateFall");
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

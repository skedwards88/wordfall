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

    // get the height + top margin of the letter
    // this is a bit hacky
    const representativeDiv = Array.from(letterDivs)[0];
    // const representativeHeight = representativeDiv.offsetHeight;
    let representativeHeight = window
      .getComputedStyle(representativeDiv, null)
      .getPropertyValue("height");
    representativeHeight = parseInt(
      representativeHeight.substring(0, representativeHeight.length - 2),
    ); // to drop the px units

    let representativeMargin = window
      .getComputedStyle(representativeDiv, null)
      .getPropertyValue("margin-top");
    representativeMargin = parseInt(
      representativeMargin.substring(0, representativeMargin.length - 2),
    ); // to drop the px units
    const representativeOffset =
      representativeHeight + representativeMargin + representativeMargin - 1; // the -1 is because there seems to be a 1px offset coming from somewhere

    const diffs = letterData.map(
      (datum, index) =>
        Math.floor(index / numRows) - Math.floor(datum.previousIndex / numRows),
    );
    const translateYs = diffs.map((diff) =>
      diff >= 0 ? diff * representativeOffset : representativeOffset * 1,
    );
    const startOpacities = diffs.map((diff) => (diff >= 0 ? 1 : 0));
    Array.from(letterDivs).forEach((div, index) =>
      div.style.setProperty("--startY", `-${translateYs[index]}px`),
    );
    Array.from(letterDivs).forEach((div, index) =>
      div.style.setProperty("--startOpacity", `${startOpacities[index]}`),
    );
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

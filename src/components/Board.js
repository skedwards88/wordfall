import React from "react";

function Letter({letter, color, letterAvailability, index, dispatchGameState}) {
  const letterRef = React.useRef();

  React.useLayoutEffect(() => {
    const letterDiv = letterRef.current;
    const currentClasses = letterDiv.className
      .split(" ")
      .filter((entry) => entry !== "unavailable");

    const newClass = letterAvailability
      ? currentClasses.join(" ")
      : [...currentClasses, "unavailable"].join(" ");

    letterDiv.className = newClass;
  }, [letterAvailability]);

  function handlePointerDown(e, index) {
    e.preventDefault();
    e.target.releasePointerCapture(e.pointerId);
    dispatchGameState({
      action: "startWord",
      letterIndex: index,
    });
  }

  function handlePointerEnter(e, index, letterAvailability) {
    e.preventDefault();
    if (!letterAvailability) {
      dispatchGameState({
        action: "removeLetter",
        letterIndex: index,
      });
    } else {
      // Add the letter to the list of letters
      dispatchGameState({
        action: "addLetter",
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

  function handleClick(e, index) {
    e.preventDefault();

    dispatchGameState({
      action: "potentiallyUseBonus",
      clickedIndex: index,
    });
  }

  return (
    <div
      className={`letter`}
      style={{
        backgroundColor: `${color}`,
      }}
      ref={letterRef}
      onPointerDown={(e) => handlePointerDown(e, index)}
      onPointerEnter={(e) => handlePointerEnter(e, index, letterAvailability)}
      onPointerUp={(e) => handlePointerUp(e)}
      onClick={(e) => handleClick(e, index)}
      draggable={false}
    >
      {letter}
    </div>
  );
}

export default function Board({
  letterData,
  playedIndexes,
  dispatchGameState,
  colors,
  numRows,
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
      color={colors[letterDatum.color]}
      letterAvailability={!playedIndexes.includes(index)}
      index={index}
      draggable={false}
      dispatchGameState={dispatchGameState}
      key={letterDatum.id}
    ></Letter>
  ));

  return (
    <div id="board" ref={boardRef}>
      {board}{" "}
    </div>
  );
}

import React from "react";

function Letter({
  letter,
  color,
  letterIsSelected,
  index,
  dispatchGameState,
  wordInProgress,
  boardRef,
  numRows,
  previousIndex,
  animateClass,
  startOpacity,
  translateY
}) {
  console.log('letter')
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

  // React.useLayoutEffect(() => {
  //   const boardDiv = boardRef.current;
  //   const letterDiv = letterRef.current;

  //   let representativeOffset = window
  //     .getComputedStyle(boardDiv)
  //     .getPropertyValue("grid-template-rows")
  //     .split(" ")[0];
  //   representativeOffset = parseFloat(
  //     representativeOffset.substring(0, representativeOffset.length - 2),
  //   );

  //   const diff = Math.floor(index / numRows) - Math.floor(previousIndex / numRows);
  //   const translateY = diff >= 0
  //     ? diff * representativeOffset
  //     : representativeOffset * (Math.floor(index / numRows) + 1);
  //   const startOpacity = diff >= 0 ? 1 : 0;

  //   letterDiv.style.setProperty("--startY", `-${translateY}px`);
  //   letterDiv.style.setProperty("--startOpacity", `${startOpacity}`);
  //   if (diff != 0) {
  //     letterDiv.classList.add("animateFall");
  //     console.log(`effect ${letter} ${index-previousIndex} ${startOpacity}`)
  //   } else {
  //     letterDiv.classList.remove("animateFall")
  //   }
  // },[index]);

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
      className={`letter ${animateClass}`}
      style={{
        backgroundColor: color,
        "--startY": `-${translateY}px`,
        "--startOpacity": startOpacity,
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
  const [letterStyles, setLetterStyles] = React.useState([]);

  const boardRef = React.useRef();

  React.useLayoutEffect(() => {
    const boardDiv = boardRef.current;
    let representativeOffset = window
      .getComputedStyle(boardDiv)
      .getPropertyValue('grid-template-rows')
      .split(' ')[0];
    representativeOffset = parseFloat(representativeOffset.slice(0, -2)); // to drop the px units

    const newLetterStyles = letterData.map((datum, index) => {
      const diff = Math.floor(index / numRows) - Math.floor(datum.previousIndex / numRows);
      const translateY = diff >= 0
        ? diff * representativeOffset
        : representativeOffset * (Math.floor(index / numRows) + 1);
      const startOpacity = diff >= 0 ? 1 : 0;
      const animateClass = diff !== 0 ? 'animateFall' : '';

      return {
        translateY: translateY,
        opacity: startOpacity,
        animateClass,
      };
    });
    console.log('layout')
    setLetterStyles(newLetterStyles);
  }, [letterData]);

  console.log('render')
  // React.useLayoutEffect(() => {
  //   const boardDiv = boardRef.current;
  //   const letterDivs = boardDiv.children;

  //   let representativeOffset = window
  //     .getComputedStyle(boardDiv)
  //     .getPropertyValue("grid-template-rows")
  //     .split(" ")[0];
  //   representativeOffset = parseFloat(
  //     representativeOffset.substring(0, representativeOffset.length - 2),
  //   ); // to drop the px units

  //   const diffs = letterData.map(
  //     (datum, index) =>
  //       Math.floor(index / numRows) - Math.floor(datum.previousIndex / numRows),
  //   );
  //   const translateYs = diffs.map((diff, index) =>
  //     diff >= 0
  //       ? diff * representativeOffset
  //       : representativeOffset * (Math.floor(index / numRows) + 1),
  //   );
  //   const startOpacities = diffs.map((diff) => (diff >= 0 ? 1 : 0));

  //   // Set CSS properties
  //   // Array.from(letterDivs).forEach((div, index) => {
  //   //   div.style.setProperty("--startY", `-${translateYs[index]}px`);
  //   //   div.style.setProperty("--startOpacity", `${startOpacities[index]}`);
  //   // });

  //   // // ios doesn't animate properly, but tying the animation to a class name helps it be a bit better
  //   // Array.from(letterDivs).forEach(
  //   //   (div, index) => (diffs[index] != 0 ? div.classList.add("animateFall") : div.classList.remove("animateFall")),
  //   // );

  //   // window.requestAnimationFrame(() => {
  //   //   Array.from(letterDivs).forEach((div, index) => {
  //   //     div.style.setProperty("--startY", `-${translateYs[index]}px`);
  //   //     div.style.setProperty("--startOpacity", `${startOpacities[index]}`);
  //   //     if (diffs[index] != 0) {
  //   //       div.classList.add("animateFall");
  //   //     } else {
  //   //       div.classList.remove("animateFall");
  //   //     }
  //   //   });
  //   // });

  //   Array.from(letterDivs).forEach((div, index) => {
  //     div.style.setProperty("--startY", `-${translateYs[index]}px`);
  //     div.style.setProperty("--startOpacity", `${startOpacities[index]}`);

  //     // Use setTimeout to delay the addition of the animation class
  //     setTimeout(() => {
  //       if (diffs[index] != 0) {
  //         div.classList.add("animateFall");
  //       } else {
  //         div.classList.remove("animateFall");
  //       }
  //     }, 10); // Delay in milliseconds, adjust as needed
  //   });

  // }, [letterData]);
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
      boardRef={boardRef}
      numRows={numRows}
      previousIndex={letterDatum.previousIndex}
      animateClass={letterStyles[index]?.animateClass}
      startOpacity={letterStyles[index]?.opacity}
      translateY={letterStyles[index]?.translateY}
    ></Letter>
  ));

  return (
    <div id="board" ref={boardRef}>
      {boardRef.current && board}{" "}
    </div>
  );
}

import React from "react";

export function Progress({progress, numColors}) {
  const totalNumSquares = progress.reduce(
    (currentTotal, currentEntry) => currentTotal + currentEntry,
    0,
  );

  let style
  if (progress.length > 1) {
    let gradientStrings = [];
    let previousPoint = 0;
    for (let index = 0; index < progress.length - 1; index++) {
      console.log(progress)
      const delta = progress[index] / totalNumSquares * 100;
      const point = previousPoint + delta;
      previousPoint = point;
      gradientStrings.push(`var(--color${index % numColors}), ${point}%`)
    }
    gradientStrings.push(`var(--color${(progress.length - 1) % numColors})`)
    style = `linear-gradient(0.25turn, ${gradientStrings.join(",")})`;
  } else {
    style = `linear-gradient(0.25turn, var(--color0), var(--color0))`;
  }

  return (
    <div
      id="progress"
      style={
        {
          background: style,
        }
      }
    >
    </div>
  );
}

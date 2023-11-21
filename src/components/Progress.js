import React from "react";

export function Progress({progress, colors}) {
  const totalNumSquares = progress.reduce(
    (currentTotal, currentEntry) => currentTotal + currentEntry,
    0,
  );

  let style;
  if (progress.length > 1) {
    let gradientStrings = [];
    let previousPoint = 0;
    for (let index = 0; index < progress.length - 1; index++) {
      const delta = (progress[index] / totalNumSquares) * 100;
      const point = previousPoint + delta;
      previousPoint = point;
      gradientStrings.push(`${colors[index]}, ${point}%`);
    }
    gradientStrings.push(`${colors[progress.length - 1]}`);
    style = `linear-gradient(0.25turn, ${gradientStrings.join(",")})`;
  } else {
    style = `linear-gradient(0.25turn, ${colors[0]}, ${colors[0]})`;
  }

  return (
    <div
      id="progress"
      style={{
        background: style,
      }}
    ></div>
  );
}

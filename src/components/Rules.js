import React from "react";
import packageJson from "../../package.json";

export default function Rules({setDisplay}) {
  return (
    <div className="App info">
      <h1>Wordfall: How to play</h1>
      <p className="infoText">{`Wordfall is a meditative jumbled word search game.\n\nSwipe to connect letters into words. Each letter must be a horizontal, vertical, or diagonal neighbor of the previous letter.\n\nClear all letters of a color to reach the next level.\n\nEarn bonuses by clearing levels and forming long words.`}</p>
      <button
        onClick={() => {
          setDisplay("game");
        }}
      >
        {"Play"}
      </button>
      <small>version {packageJson.version}</small>
    </div>
  );
}

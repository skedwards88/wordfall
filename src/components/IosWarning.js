import React from "react";

export default function IosWarning({setDisplay, setDisplayIOSWarning}) {
  return (
    <div className="App info">
      <h1>iOS Warning</h1>
      <div className="infoText">
        {"It looks like you are using an iOS device (iPhone or iPad).\n\n"}
        {"iOS does not fully support web animations, which this game uses.\n\n"}
        {
          "You can still play this game on your iOS device, but you will have a better experience on an Android device.\n\n"
        }
      </div>
      <button
        onClick={() => {
          setDisplayIOSWarning(false);
          setDisplay("game");
        }}
      >
        OK
      </button>
    </div>
  );
}

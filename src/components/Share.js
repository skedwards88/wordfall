import React from "react";
import { handleShare } from "../logic/handleShare";

export function Share({appName, text, url, seed}) {
  if (navigator.canShare) {
    return (
      <button onClick={() => handleShare({appName, text, url, seed})}>
        Share
      </button>
    );
  } else {
    return <></>;
  }
}

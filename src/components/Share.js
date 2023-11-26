import React from "react";
import sendAnalytics from "../logic/sendAnalytics";

export function handleShare({text}) {
  const url = "https://skedwards88.github.io/wordfall/";

  if (navigator.canShare) {
    navigator
      .share({
        title: "Wordfall",
        text: `${text}\n\n`,
        url,
      })
      .then(() => console.log("Successful share"))
      .catch((error) => {
        // copy to clipboard as backup
        handleCopy({text, url});
        console.log("Error sharing", error);
      });
  } else {
    handleCopy({text, url});
  }

  sendAnalytics("share");
}

function handleCopy({text, fullUrl}) {
  try {
    navigator.clipboard.writeText(`${text}\n\n${fullUrl}`);
  } catch (error) {
    console.log(error);
  }
}

export function Share({text}) {
  return (
    <button onClick={() => handleShare({text})}>
      {navigator.canShare ? "Share" : "Copy link to share"}
    </button>
  );
}

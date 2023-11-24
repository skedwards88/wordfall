import {isKnown} from "@skedwards88/word_logic";
import {gameInit} from "./gameInit";
import {getDistinctHSL} from "./getColor";
import {checkIfNeighbors} from "@skedwards88/word_logic";
import {pickRandomItemFromArray} from "@skedwards88/word_logic";
import {trie} from "./trie";
import {replaceIndexes} from "./arrayToColumns";
import {getPseudoRandomID} from "./gameInit";
import {letterPool} from "./letterPool";

function subtractLettersFromLetterPool(lettersToSubtract, letterPool) {
  let subtractedPool = [...letterPool];
  for (const letter of lettersToSubtract) {
    const index = subtractedPool.indexOf(letter);
    if (index >= 0) {
      subtractedPool.splice(index, 1);
    }
  }
  return subtractedPool;
}

function generateLetterData({lowestColor, letterPool}) {
  const letter = pickRandomItemFromArray(letterPool);
  const id = getPseudoRandomID();
  const color = lowestColor + 1;
  return {letter, id, color};
}

export function gameReducer(currentGameState, payload) {
  if (payload.action === "newGame") {
    return gameInit({
      ...payload,
      useSaved: false,
    });
  } else if (payload.action === "startWord") {
    return {
      ...currentGameState,
      wordInProgress: true,
      playedIndexes: [payload.letterIndex],
    };
  } else if (payload.action === "addLetter") {
    if (!currentGameState.wordInProgress) {
      return currentGameState;
    }
    // Don't add the letter if it isn't neighboring the current sequence
    const isNeighboring = checkIfNeighbors({
      indexA:
        currentGameState.playedIndexes[
          currentGameState.playedIndexes.length - 1
        ],
      indexB: payload.letterIndex,
      numColumns: currentGameState.numColumns,
      numRows: currentGameState.numRows,
    });
    if (!isNeighboring) {
      return currentGameState;
    }

    const newPlayedIndexes = [
      ...currentGameState.playedIndexes,
      payload.letterIndex,
    ];

    return {
      ...currentGameState,
      playedIndexes: newPlayedIndexes,
      result: "",
    };
  } else if (payload.action === "removeLetter") {
    if (!currentGameState.wordInProgress) {
      return currentGameState;
    }
    // Don't remove a letter if the player didn't go back to the letter before the last letter
    let newPlayedIndexes = [...currentGameState.playedIndexes];
    const lastIndexPlayed = newPlayedIndexes[newPlayedIndexes.length - 2];
    if (lastIndexPlayed !== payload.letterIndex) {
      return currentGameState;
    }

    newPlayedIndexes = currentGameState.playedIndexes.slice(
      0,
      newPlayedIndexes.length - 1,
    );

    return {
      ...currentGameState,
      playedIndexes: newPlayedIndexes,
    };
  } else if (payload.action === "endWord") {
    // Since we end the word on board up or on app up (in case the user swipes off the board), we can end up calling this case twice.
    // Return early if we no longer have a word in progress.
    if (!currentGameState.wordInProgress) {
      return currentGameState;
    }

    const newWord = currentGameState.playedIndexes
      .map((index) => currentGameState.letterData[index].letter)
      .join("")
      .toUpperCase();

    // if the word is less than 2, don't add the word
    if (newWord.length < 2) {
      return {
        ...currentGameState,
        wordInProgress: false,
        playedIndexes: [],
        result: currentGameState.playedIndexes.length <= 1 ? "" : "Too short",
      };
    }

    // check if word is a real word
    const {isWord} = isKnown(newWord, trie);
    if (!isWord) {
      return {
        ...currentGameState,
        wordInProgress: false,
        playedIndexes: [],
        result: "Unknown word",
      };
    }

    const replacedColors = currentGameState.playedIndexes.map(
      (index) => currentGameState.letterData[index].color,
    );
    const lowestColor = Math.min(
      ...currentGameState.letterData.map((datum) => datum.color),
    );
    const addedColors = replacedColors.map((color) =>
      Math.min(color + 1, lowestColor + 1),
    );
    let newProgress = [...currentGameState.progress];
    addedColors.forEach((color) => {
      newProgress[color] ? newProgress[color]++ : newProgress.push(1);
    });

    let newColors = [...currentGameState.colors];
    newProgress.forEach(
      (_, index) =>
        (newColors[index] =
          newColors[index] || getDistinctHSL(newColors[index - 1])),
    );

    const newPool = subtractLettersFromLetterPool(
      currentGameState.letterData.map((datum) => datum.letter),
      letterPool,
    );

    const letterDataWithUpdatedIndexes = [...currentGameState.letterData].map(
      (datum, index) => ({...datum, previousIndex: index}),
    );
    const newLetterData = replaceIndexes({
      arrayToReplaceOn: letterDataWithUpdatedIndexes,
      indexesToReplace: currentGameState.playedIndexes,
      numColumns: currentGameState.numColumns,
      numRows: currentGameState.numRows,
      replacementFunction: generateLetterData,
      replacementParams: {lowestColor, letterPool: newPool},
    });

    return {
      ...currentGameState,
      wordInProgress: false,
      playedIndexes: [],
      letterData: newLetterData,
      progress: newProgress,
      colors: newColors,
    };
  } else {
    console.log(`unknown action: ${payload.action}`);
    return {...currentGameState};
  }
}

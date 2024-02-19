import {isKnown, shuffleArray} from "@skedwards88/word_logic";
import {gameInit} from "./gameInit";
import {getDistinctHSL} from "./getColor";
import {checkIfNeighbors} from "@skedwards88/word_logic";
import {pickRandomItemFromArray} from "@skedwards88/word_logic";
import {trie} from "./trie";
import {replaceIndexes} from "./arrayToColumns";
import {getPseudoRandomID} from "./gameInit";
import {letterPool} from "./letterPool";
import cloneDeep from "lodash.clonedeep";

function updateProgress({playedIndexes, letterData, progress}) {
  // Get the color indexes of the letters that are being replaced
  const replacedColorIndexes = playedIndexes.map(
    (index) => letterData[index].colorIndex,
  );
  // Figure out the lowest color index on the board
  const lowestColorIndex = Math.min(
    ...letterData.map((datum) => datum.colorIndex),
  );
  // Figure out the color that will replace the old color
  const replacingColorIndexes = replacedColorIndexes.map((colorIndex) =>
    Math.min(colorIndex + 1, lowestColorIndex + 1),
  );

  // Update the progress count to include the new colors
  let newProgress = cloneDeep(progress);
  replacingColorIndexes.forEach((colorIndex) => {
    newProgress[colorIndex] ? newProgress[colorIndex]++ : newProgress.push(1);
  });

  return newProgress;
}

function updateColors({colors, newProgress}) {
  // Generate a new color, if needed
  let newColors = cloneDeep(colors);
  newProgress.forEach(
    (_, index) =>
      (newColors[index] =
        newColors[index] || getDistinctHSL(newColors[index - 1])),
  );

  return newColors;
}

function replaceLetters({playedIndexes, letterData, numColumns, numRows}) {
  // Get a letter pool based on normal frequency minus the letters already on the board
  const newPool = subtractLettersFromLetterPool(
    letterData.map((datum) => datum.letter),
    letterPool,
  );

  // Figure out the lowest color index on the board
  const lowestColorIndex = Math.min(
    ...letterData.map((datum) => datum.colorIndex),
  );

  // Record the current index of each letter
  // This is used to do the falling animation
  const letterDataWithUpdatedIndexes = letterData.map((datum, index) => ({
    ...datum,
    previousIndex: index,
  }));

  // Update the letter data
  const newLetterData = replaceIndexes({
    arrayToReplaceOn: letterDataWithUpdatedIndexes,
    indexesToReplace: playedIndexes,
    numColumns: numColumns,
    numRows: numRows,
    replacementFunction: generateLetterData,
    replacementParams: {lowestColor: lowestColorIndex, letterPool: newPool},
  });

  return newLetterData;
}

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
  const colorIndex = lowestColor + 1;
  return {letter, id, colorIndex};
}

function updateUsedBonus(oldBonuses, bonusType) {
  let newBonuses = deactivateBonuses(oldBonuses);
  newBonuses[bonusType].number = newBonuses[bonusType].number - 1;

  return newBonuses;
}

export function deactivateBonuses(bonuses) {
  let newBonuses = cloneDeep(bonuses);

  Object.keys(newBonuses).forEach(
    (bonus) => (newBonuses[bonus].active = false),
  );
  newBonuses.swap.firstIndex = undefined;

  return newBonuses;
}

function useShuffleBonus(currentGameState) {
  let newLetterData = cloneDeep(currentGameState.letterData);
  newLetterData = shuffleArray(newLetterData);
  newLetterData.forEach((datum) => (datum.id = getPseudoRandomID()));

  let newBonuses = updateUsedBonus(currentGameState.bonuses, "shuffle");

  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    letterData: newLetterData,
    bonuses: newBonuses,
    bonusText: "",
  };
}

function storeIndexForSwapBonus(currentGameState, clickedIndex) {
  let newBonuses = cloneDeep(currentGameState.bonuses);

  newBonuses.swap.firstIndex = clickedIndex;
  let newBonusText = "Tap a second letter to complete the swap";
  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    bonuses: newBonuses,
    bonusText: newBonusText,
  };
}

function unstoreIndexForSwapBonus(currentGameState) {
  let newBonuses = cloneDeep(currentGameState.bonuses);

  newBonuses.swap.firstIndex = undefined;
  let newBonusText = "Tap on two letters to swap the letters";
  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    bonuses: newBonuses,
    bonusText: newBonusText,
  };
}

function useSwapBonus(currentGameState, firstIndex, secondIndex) {
  let newLetterData = cloneDeep(currentGameState.letterData);

  const newFirstLetter = {
    ...newLetterData[secondIndex],
    previousIndex: secondIndex,
    id: newLetterData[firstIndex].id,
  };
  const newSecondLetter = {
    ...newLetterData[firstIndex],
    previousIndex: firstIndex,
    id: newLetterData[secondIndex].id,
  };

  newLetterData[firstIndex] = newFirstLetter;
  newLetterData[secondIndex] = newSecondLetter;

  let newBonuses = updateUsedBonus(currentGameState.bonuses, "swap");
  newBonuses.swap.firstIndex = undefined;

  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    letterData: newLetterData,
    bonuses: newBonuses,
    bonusText: "",
  };
}

function useRemoveBonus(currentGameState, indexToRemove) {
  const newProgress = updateProgress({
    playedIndexes: [indexToRemove],
    letterData: currentGameState.letterData,
    progress: currentGameState.progress,
  });
  const newColors = updateColors({
    colors: currentGameState.colors,
    newProgress,
  });
  const newLetterData = replaceLetters({
    playedIndexes: [indexToRemove],
    letterData: currentGameState.letterData,
    numColumns: currentGameState.numColumns,
    numRows: currentGameState.numRows,
  });

  let newBonuses = updateUsedBonus(currentGameState.bonuses, "remove");

  // If completed a level (cleared the last color in the level) give a bonus
  let resultText = "";
  const uniqueColors = new Set(newLetterData.map((datum) => datum.colorIndex));
  if (uniqueColors.size === 1) {
    const bonusType = pickRandomItemFromArray(Object.keys(newBonuses));
    newBonuses[bonusType].number++;
    if (resultText.length) {
      resultText += `\n\n`;
    }
    resultText += `Level cleared! Bonus earned.`;
  }

  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    letterData: newLetterData,
    progress: newProgress,
    colors: newColors,
    bonuses: newBonuses,
    bonusText: "",
    result: resultText,
  };
}

export function gameReducer(currentGameState, payload) {
  console.log(`reducer: ${payload.action}`);
  if (payload.action === "newGame") {
    return gameInit({
      ...payload,
      useSaved: false,
    });
  } else if (payload.action === "startWord") {
    // if there is an active bonus, use the bonus
    const potentialBonusUpdates = potentiallyUseBonus(
      currentGameState,
      payload.letterIndex,
    );

    if (potentialBonusUpdates != currentGameState) {
      return potentialBonusUpdates;
    }

    // if there is not a word in progress, start a word
    return {
      ...currentGameState,
      wordInProgress: true,
      playedIndexes: [payload.letterIndex],
    };
  } else if (payload.action === "updateWord") {
    // if the letter is not already in use, add it
    // Don't add the letter if it isn't neighboring the current sequence
    if (!currentGameState.playedIndexes.includes(payload.letterIndex)) {
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
    } else {
      // Otherwise remove the letter
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
    }
  } else if (payload.action === "endWord") {
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
      };
    }

    // check if word is a real word
    const {isWord} = isKnown(newWord, trie);
    if (!isWord) {
      // return {
      //   ...currentGameState,
      //   wordInProgress: false,
      //   playedIndexes: [],
      //   result: "Unknown word",
      // };
    }

    const newProgress = updateProgress({
      playedIndexes: currentGameState.playedIndexes,
      letterData: currentGameState.letterData,
      progress: currentGameState.progress,
    });
    const newColors = updateColors({
      colors: currentGameState.colors,
      newProgress,
    });
    const newLetterData = replaceLetters({
      playedIndexes: currentGameState.playedIndexes,
      letterData: currentGameState.letterData,
      numColumns: currentGameState.numColumns,
      numRows: currentGameState.numRows,
    });

    let resultText = "";

    let newBonuses = cloneDeep(currentGameState.bonuses);

    // If the word is 6 letters or longer, give a bonus
    const earnedBonus = newWord.length >= 6;
    if (earnedBonus) {
      const bonusType = pickRandomItemFromArray(Object.keys(newBonuses));
      newBonuses[bonusType].number++;
      if (resultText.length) {
        resultText += `\n\n`;
      }
      resultText += `${newWord.length} letters! Bonus earned.`;
    }

    // If completed a level (cleared the last color in the level) give a bonus
    const uniqueColors = new Set(
      newLetterData.map((datum) => datum.colorIndex),
    );
    if (uniqueColors.size === 1) {
      const bonusType = pickRandomItemFromArray(Object.keys(newBonuses));
      newBonuses[bonusType].number++;
      if (resultText.length) {
        resultText += `\n\n`;
      }
      resultText += `Level cleared! Bonus earned.`;
    }

    return {
      ...currentGameState,
      wordInProgress: false,
      playedIndexes: [],
      letterData: newLetterData,
      progress: newProgress,
      colors: newColors,
      bonuses: newBonuses,
      result: resultText,
    };
  } else if (payload.action === "clickBonus") {
    const bonusType = payload.bonusType;
    const wasActive = currentGameState.bonuses[bonusType].active;
    let newBonuses = cloneDeep(currentGameState.bonuses);
    let newBonusText = "";

    // if the bonus was active, deactivate it
    // otherwise activate this bonus and deactivate all others, and show text
    // when deactivating swap, also clear the letter index
    if (wasActive) {
      newBonuses = deactivateBonuses(newBonuses);
    } else {
      newBonuses = deactivateBonuses(newBonuses);
      newBonuses[bonusType].active = true;
      switch (bonusType) {
        case "shuffle":
          newBonusText = "Tap on any letter to shuffle all letters";
          break;
        case "remove":
          newBonusText = "Tap on any letter to remove the letter";
          break;
        case "swap":
          newBonusText = "Tap on two letters to swap the letters";
          break;
        default:
          break;
      }
    }
    return {
      ...currentGameState,
      bonuses: newBonuses,
      bonusText: newBonusText,
      wordInProgress: false,
      playedIndexes: [],
    };
  } else if (payload.action === "deactivateBonus") {
    let newBonuses = deactivateBonuses(currentGameState.bonuses);
    return {
      ...currentGameState,
      bonuses: newBonuses,
      bonusText: "",
      wordInProgress: false,
      playedIndexes: [],
    };
  } else if (payload.action === "potentiallyUseBonus") {
    return potentiallyUseBonus(currentGameState, payload.clickedIndex);
  } else {
    console.log(`unknown action: ${payload.action}`);
    return {...currentGameState};
  }
}

function potentiallyUseBonus(currentGameState, clickedIndex) {
  if (currentGameState.bonuses.shuffle.active) {
    return useShuffleBonus(currentGameState);
  } else if (currentGameState.bonuses.remove.active) {
    return useRemoveBonus(currentGameState, clickedIndex);
  } else if (currentGameState.bonuses.swap.active) {
    // If we haven't stored the first letter to swap,
    // store the letter and update the text
    if (currentGameState.bonuses.swap.firstIndex === undefined) {
      return storeIndexForSwapBonus(currentGameState, clickedIndex);
    } else if (currentGameState.bonuses.swap.firstIndex === clickedIndex) {
      // if we have stored the first letter,
      // but the second letter is the same as the first, deselect the letter
      return unstoreIndexForSwapBonus(currentGameState);
    } else {
      // otherwise, do the swap
      return useSwapBonus(
        currentGameState,
        currentGameState.bonuses.swap.firstIndex,
        clickedIndex,
      );
    }
  } else {
    return currentGameState;
  }
}

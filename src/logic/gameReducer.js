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
    (index) => letterData[index].color,
  );
  // Figure out the lowest color index on the board
  const lowestColorIndex = Math.min(...letterData.map((datum) => datum.color));
  // Figure out the color that will replace the old color
  const replacingColorIndexes = replacedColorIndexes.map((color) =>
    Math.min(color + 1, lowestColorIndex + 1),
  );

  // Update the progress count to include the new colors
  let newProgress = cloneDeep(progress);
  replacingColorIndexes.forEach((color) => {
    newProgress[color] ? newProgress[color]++ : newProgress.push(1);
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
  const lowestColorIndex = Math.min(...letterData.map((datum) => datum.color));

  // Record the current index of each letter
  // This is used to do the falling animation
  const letterDataWithUpdatedIndexes = [...letterData].map((datum, index) => ({
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

    // If the word is 6 letters or longer, give a bonus
    const earnedBonus = newWord.length >= 6;
    let newBonuses = cloneDeep(currentGameState.bonuses);
    if (earnedBonus) {
      const bonusType = pickRandomItemFromArray(Object.keys(newBonuses));
      newBonuses[bonusType].number++;
      if (resultText.length) {
        resultText += `\n\n`;
      }
      resultText += `${newWord.length} letters! Bonus earned.`;
    }

    // If completed a level (cleared the last color in the level) give a bonus
    const uniqueColors = new Set(newLetterData.map((datum) => datum.color));
    if (uniqueColors.size === 1) {
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
      newBonuses[bonusType].active = false;
      newBonuses.swap.firstIndex = undefined;
    } else {
      Object.keys(newBonuses).forEach(
        (bonus) => (newBonuses[bonus].active = false),
      );
      newBonuses.swap.firstIndex = undefined;
      newBonuses[bonusType].active = true;
      switch (bonusType) {
        case "shuffle":
          newBonusText = "Click on any letter to shuffle all letters";
          break;
        case "remove":
          newBonusText = "Click on any letter to remove the letter";
          break;
        case "swap":
          newBonusText = "Click on two letters to swap the letters";
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
  } else if (payload.action === "potentiallyUseBonus") {
    if (currentGameState.bonuses.shuffle.active) {
      // "shuffle" bonus is active
      const bonusType = "shuffle";
      let newLetterData = cloneDeep(currentGameState.letterData);
      newLetterData = shuffleArray(newLetterData);
      // todo the animation feels off here; some don't appear to re-render despite new id
      newLetterData.forEach((datum) => (datum.id = getPseudoRandomID()));

      let newBonuses = cloneDeep(currentGameState.bonuses);
      Object.keys(newBonuses).forEach(
        (bonus) => (newBonuses[bonus].active = false),
      );
      newBonuses[bonusType].number = newBonuses[bonusType].number - 1;

      return {
        ...currentGameState,
        wordInProgress: false,
        playedIndexes: [],
        letterData: newLetterData,
        bonuses: newBonuses,
        bonusText: "",
      };
    } else if (currentGameState.bonuses.remove.active) {
      // "remove" bonus is active
      const bonusType = "remove";
      const clickedIndex = payload.clickedIndex;

      const newProgress = updateProgress({
        playedIndexes: [clickedIndex],
        letterData: currentGameState.letterData,
        progress: currentGameState.progress,
      });
      const newColors = updateColors({
        colors: currentGameState.colors,
        newProgress,
      });
      const newLetterData = replaceLetters({
        playedIndexes: [clickedIndex],
        letterData: currentGameState.letterData,
        numColumns: currentGameState.numColumns,
        numRows: currentGameState.numRows,
      });

      let newBonuses = cloneDeep(currentGameState.bonuses);
      Object.keys(newBonuses).forEach(
        (bonus) => (newBonuses[bonus].active = false),
      );
      newBonuses[bonusType].number = newBonuses[bonusType].number - 1;

      // If completed a level (cleared the last color in the level) give a bonus
      let resultText = "";
      const uniqueColors = new Set(newLetterData.map((datum) => datum.color));
      if (uniqueColors.size === 1) {
        resultText = `Level cleared! Bonus earned.`;
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
    } else if (currentGameState.bonuses.swap.active) {
      // "swap" bonus is active
      const bonusType = "swap";
      let newBonuses = cloneDeep(currentGameState.bonuses);
      let newBonusText = currentGameState.bonusText;

      // If we haven't stored the first letter to swap,
      // store the letter and update the text
      if (currentGameState.bonuses.swap.firstIndex === undefined) {
        newBonuses.swap.firstIndex = payload.clickedIndex;
        newBonusText = "Click a second letter to complete the swap";
        // todo style the first index to indicate picked
        return {
          ...currentGameState,
          wordInProgress: false,
          playedIndexes: [],
          bonuses: newBonuses,
          bonusText: newBonusText,
        };
      } else {
        // otherwise, do the swap
        let newLetterData = cloneDeep(currentGameState.letterData);
        const firstIndex = currentGameState.bonuses.swap.firstIndex;
        const secondIndex = payload.clickedIndex;
        // Just swap the color and letter but not the other info so that we don't rerender/affect the animation
        [newLetterData[firstIndex].letter, newLetterData[secondIndex].letter] =
          [newLetterData[secondIndex].letter, newLetterData[firstIndex].letter];
        [newLetterData[firstIndex].color, newLetterData[secondIndex].color] = [
          newLetterData[secondIndex].color,
          newLetterData[firstIndex].color,
        ];

        Object.keys(newBonuses).forEach(
          (bonus) => (newBonuses[bonus].active = false),
        );
        newBonuses[bonusType].number = newBonuses[bonusType].number - 1;
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
    } else {
      console.log("nothing to use");
      return currentGameState;
    }
  } else {
    console.log(`unknown action: ${payload.action}`);
    return {...currentGameState};
  }
}

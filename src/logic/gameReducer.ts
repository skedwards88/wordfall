import {isKnown, shuffleArray} from "@skedwards88/word_logic";
import type {Bonuses, BonusType, GameState, LetterData} from "./gameInit";
import {gameInit} from "./gameInit";
import {getDistinctHSL} from "./getColor";
import {checkIfNeighbors} from "@skedwards88/word_logic";
import {pickRandomItemFromArray} from "@skedwards88/word_logic";
import {trie} from "./trie";
import {replaceIndexes} from "./arrayToColumns";
import {letterPool} from "./letterPool";
import type {LetterQu} from "@skedwards88/word_logic/dist/Types";

function updateProgress({
  playedIndexes,
  letterData,
  progress,
}: {
  playedIndexes: number[];
  letterData: LetterData[];
  progress: number[];
}): number[] {
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
  const newProgress = structuredClone(progress);
  replacingColorIndexes.forEach((colorIndex) => {
    if (newProgress[colorIndex]) {
      newProgress[colorIndex]++;
    } else {
      newProgress.push(1);
    }
  });

  return newProgress;
}

function updateColors({
  colors,
  newProgress,
}: {
  colors: string[];
  newProgress: number[];
}): string[] {
  // Generate a new color, if needed
  const newColors = structuredClone(colors);
  newProgress.forEach(
    (_, index) =>
      (newColors[index] =
        newColors[index] || getDistinctHSL(newColors[index - 1])),
  );

  return newColors;
}

function replaceLetters({
  playedIndexes,
  letterData,
  numColumns,
  numRows,
}: {
  playedIndexes: number[];
  letterData: LetterData[];
  numColumns: number;
  numRows: number;
}): LetterData[] {
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

function subtractLettersFromLetterPool(
  lettersToSubtract: LetterQu[],
  letterPool: LetterQu[],
): LetterQu[] {
  const subtractedPool = [...letterPool];
  for (const letter of lettersToSubtract) {
    const index = subtractedPool.indexOf(letter);
    if (index >= 0) {
      subtractedPool.splice(index, 1);
    }
  }
  return subtractedPool;
}

function generateLetterData({
  lowestColor,
  letterPool,
}: {
  lowestColor: number;
  letterPool: LetterQu[];
}): LetterData {
  const letter = pickRandomItemFromArray(letterPool);
  const id = crypto.randomUUID();
  const colorIndex = lowestColor + 1;
  return {letter, id, colorIndex};
}

function updateUsedBonus(oldBonuses: Bonuses, bonusType: BonusType): Bonuses {
  const newBonuses = deactivateBonuses(oldBonuses);
  newBonuses[bonusType].number = newBonuses[bonusType].number - 1;

  return newBonuses;
}

export function deactivateBonuses(bonuses: Bonuses): Bonuses {
  const newBonuses = structuredClone(bonuses);

  (Object.keys(newBonuses) as BonusType[]).forEach((bonus) => {
    newBonuses[bonus].active = false;
  });

  newBonuses.swap.firstIndex = undefined;

  return newBonuses;
}

function applyShuffleBonus(currentGameState: GameState): GameState {
  let newLetterData = structuredClone(currentGameState.letterData);
  newLetterData = shuffleArray(newLetterData);
  newLetterData.forEach((datum) => (datum.id = crypto.randomUUID()));

  const newBonuses = updateUsedBonus(currentGameState.bonuses, "shuffle");

  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    letterData: newLetterData,
    bonuses: newBonuses,
    bonusText: "",
  };
}

function storeIndexForSwapBonus(
  currentGameState: GameState,
  clickedIndex: number,
): GameState {
  const newBonuses = structuredClone(currentGameState.bonuses);

  newBonuses.swap.firstIndex = clickedIndex;
  const newBonusText = "Tap a second letter to complete the swap";
  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    bonuses: newBonuses,
    bonusText: newBonusText,
  };
}

function unstoreIndexForSwapBonus(currentGameState: GameState): GameState {
  const newBonuses = structuredClone(currentGameState.bonuses);

  newBonuses.swap.firstIndex = undefined;
  const newBonusText = "Tap on two letters to swap the letters";
  return {
    ...currentGameState,
    wordInProgress: false,
    playedIndexes: [],
    bonuses: newBonuses,
    bonusText: newBonusText,
  };
}

function applySwapBonus(
  currentGameState: GameState,
  firstIndex: number,
  secondIndex: number,
): GameState {
  const newLetterData = structuredClone(currentGameState.letterData);
  // Just swap the color and letter but not the other info so that we don't rerender/affect the animation
  [newLetterData[firstIndex].letter, newLetterData[secondIndex].letter] = [
    newLetterData[secondIndex].letter,
    newLetterData[firstIndex].letter,
  ];
  [
    newLetterData[firstIndex].colorIndex,
    newLetterData[secondIndex].colorIndex,
  ] = [
    newLetterData[secondIndex].colorIndex,
    newLetterData[firstIndex].colorIndex,
  ];

  const newBonuses = updateUsedBonus(currentGameState.bonuses, "swap");
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

function applyRemoveBonus(
  currentGameState: GameState,
  indexToRemove: number,
): GameState {
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

  const newBonuses = updateUsedBonus(currentGameState.bonuses, "remove");

  // If completed a level (cleared the last color in the level) give a bonus
  let resultText = "";
  const uniqueColors = new Set(newLetterData.map((datum) => datum.colorIndex));
  if (uniqueColors.size === 1) {
    const bonusType = pickRandomItemFromArray(
      Object.keys(newBonuses) as BonusType[],
    );

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

export type ReducerPayload =
  | {action: "newGame"}
  | {
      action: "startWord";
      letterIndex: number;
    }
  | {
      action: "updateWord";
      letterIndex: number;
    }
  | {
      action: "endWord";
    }
  | {
      action: "clickBonus";
      bonusType: BonusType;
    }
  | {
      action: "deactivateBonus";
    }
  | {
      action: "potentiallyUseBonus";
      clickedIndex: number;
    };

export function gameReducer(
  currentGameState: GameState,
  payload: ReducerPayload,
): GameState {
  if (payload.action === "newGame") {
    return gameInit({
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
      return {
        ...currentGameState,
        wordInProgress: false,
        playedIndexes: [],
        result: "Unknown word",
        // store the word in the state so we can log it in the analytics to see if the dictionary should be updated
        lastInvalidWord: newWord.length >= 3 ? newWord : null,
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

    const newBonuses = structuredClone(currentGameState.bonuses);

    // If the word is 6 letters or longer, give a bonus
    const earnedBonus = newWord.length >= 6;
    if (earnedBonus) {
      const bonusType = pickRandomItemFromArray(
        Object.keys(newBonuses) as BonusType[],
      );
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
      const bonusType = pickRandomItemFromArray(
        Object.keys(newBonuses) as BonusType[],
      );
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
    let newBonuses = structuredClone(currentGameState.bonuses);
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
    const newBonuses = deactivateBonuses(currentGameState.bonuses);
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
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}

function potentiallyUseBonus(
  currentGameState: GameState,
  clickedIndex: number,
): GameState {
  if (currentGameState.bonuses.shuffle.active) {
    return applyShuffleBonus(currentGameState);
  } else if (currentGameState.bonuses.remove.active) {
    return applyRemoveBonus(currentGameState, clickedIndex);
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
      return applySwapBonus(
        currentGameState,
        currentGameState.bonuses.swap.firstIndex,
        clickedIndex,
      );
    }
  } else {
    return currentGameState;
  }
}

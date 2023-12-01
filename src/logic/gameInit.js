import {letterPool} from "./letterPool";
import {getDistinctHSL} from "./getColor";
import {getNLetters} from "@skedwards88/word_logic";
import {findAllWords} from "@skedwards88/word_logic";
import {trie} from "./trie";
import seedrandom from "seedrandom";
import {deactivateBonuses} from "./gameReducer";

export function getPseudoRandomID() {
  const pseudoRandomGenerator = seedrandom();
  const id = `${pseudoRandomGenerator()}${pseudoRandomGenerator()}${pseudoRandomGenerator()}`
  return id;
}

function getPlayableLetters({numColumns, numRows}) {
  // Select letters and make sure that there are at least 10 words to start
  const minWords = 10;
  let foundPlayableLetters = false;
  let letters;
  let allWords;
  const numLetters = numColumns * numRows;
  while (!foundPlayableLetters) {
    letters = getNLetters(numLetters, letterPool);
    allWords = findAllWords({
      letters: letters,
      numColumns: numColumns,
      numRows: numRows,
      minWordLength: 2,
      easyMode: true,
      trie,
    });
    if (allWords.length > minWords) {
      foundPlayableLetters = true;
    }
  }
  return letters;
}

function validateGameState(savedState) {
  if (typeof savedState !== "object" || savedState === null) {
    return false;
  }

  const fieldsAreExpectedTypes =
    Array.isArray(savedState.letterData) &&
    Array.isArray(savedState.playedIndexes) &&
    typeof savedState.numColumns === "number" &&
    typeof savedState.numRows === "number" &&
    typeof savedState.result === "string" &&
    Array.isArray(savedState.progress) &&
    savedState.progress.every((p) => typeof p === "number") &&
    Array.isArray(savedState.colors) &&
    savedState.colors.every((c) => typeof c === "string") &&
    typeof savedState.bonusText === "string" &&
    typeof savedState.bonuses === "object" &&
    savedState.bonuses !== null &&
    ["shuffle", "remove", "swap"].every(
      (bonus) =>
        typeof savedState.bonuses[bonus] === "object" &&
        savedState.bonuses[bonus] !== null &&
        typeof savedState.bonuses[bonus].number === "number" &&
        typeof savedState.bonuses[bonus].active === "boolean" &&
        (savedState.bonuses[bonus].firstIndex === undefined ||
          typeof savedState.bonuses[bonus].firstIndex === "number"),
    );

  if (!fieldsAreExpectedTypes) {
    return false;
  }

  const letterDataIsExpectedTypes = savedState.letterData.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.letter === "string" &&
      item.id != undefined &&
      typeof item.colorIndex === "number" &&
      (item.previousIndex === undefined ||
        typeof item.previousIndex === "number"),
  );

  if (!letterDataIsExpectedTypes) {
    return false;
  }
  return true;
}

function resumeSavedState(savedState) {
  const letterData = savedState.letterData.map((datum, index) => ({
    ...datum,
    previousIndex: index,
  }));
  const deactivatedBonuses = deactivateBonuses(savedState.bonuses);
  return {
    ...savedState,
    playedIndexes: [],
    result: "",
    bonusText: "",
    bonuses: deactivatedBonuses,
    letterData,
  };
}

export function gameInit({useSaved = true}) {
  const savedGameState = JSON.parse(localStorage.getItem("wordfallGameState"));

  // Use this to force saved state to be ignored
  const latestBreakingChange = 1;

  const saveStateIsValid =
    useSaved &&
    savedGameState?.latestBreakingChange &&
    savedGameState?.latestBreakingChange === latestBreakingChange &&
    validateGameState(savedGameState);
  if (useSaved && saveStateIsValid) {
    return resumeSavedState(savedGameState);
  }

  const numRows = 5;
  const numColumns = 5;

  const letters = getPlayableLetters({
    numColumns: numColumns,
    numRows: numRows,
  });

  const letterData = letters.map((letter) => ({
    letter,
    id: getPseudoRandomID(),
    colorIndex: 0,
    previousIndex: undefined,
  }));

  const progress = [numRows * numColumns];

  const colors = [getDistinctHSL()];

  return {
    letterData: letterData,
    playedIndexes: [],
    numColumns: numColumns,
    numRows: numRows,
    result: "",
    progress,
    colors,
    bonusText: "",
    bonuses: {
      shuffle: {
        number: 3,
        active: false,
      },
      remove: {
        number: 3,
        active: false,
      },
      swap: {
        number: 3,
        active: false,
        firstIndex: undefined,
      },
    },
    latestBreakingChange,
  };
}

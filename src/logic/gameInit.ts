import {letterPool} from "./letterPool";
import {getDistinctHSL} from "./getColor";
import {getNLetters} from "@skedwards88/word_logic";
import {findAllWords} from "@skedwards88/word_logic";
import {trie} from "./trie";
import {deactivateBonuses} from "./gameReducer";
import type {LetterQu} from "@skedwards88/word_logic/dist/Types";
import {getFromStorage} from "@skedwards88/shared-components/src/logic/safeStorage";

export type LetterData = {
  letter: LetterQu;
  id: string;
  colorIndex: number;
  previousIndex?: undefined | number;
};

export type Bonuses = {
  shuffle: {
    number: number;
    active: boolean;
  };
  remove: {
    number: number;
    active: boolean;
  };
  swap: {
    number: number;
    active: boolean;
    firstIndex: undefined | number;
  };
};

export type BonusType = keyof Bonuses;

export type GameState = {
  letterData: LetterData[];
  playedIndexes: number[];
  numColumns: number;
  numRows: number;
  result: string;
  lastInvalidWord: string | null;
  progress: number[];
  colors: string[];
  bonusText: string;
  bonuses: Bonuses;
  latestBreakingChange: number;
  wordInProgress: boolean;
};

function getPlayableLetters({
  numColumns,
  numRows,
}: {
  numColumns: number;
  numRows: number;
}): LetterQu[] {
  // Select letters and make sure that there are at least 10 words to start
  const minWords = 10;
  let letters: LetterQu[];
  let allWords;
  const numLetters = numColumns * numRows;

  while (true) {
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
      return letters;
    }
  }
}

function validateGameState(savedState: GameState): boolean {
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
    (Object.keys(savedState.bonuses) as BonusType[]).every(
      (bonus) =>
        typeof savedState.bonuses[bonus] === "object" &&
        savedState.bonuses[bonus] !== null &&
        typeof savedState.bonuses[bonus].number === "number" &&
        typeof savedState.bonuses[bonus].active === "boolean" &&
        ((bonus === "swap" &&
          savedState.bonuses[bonus].firstIndex === undefined) ||
          (bonus === "swap" &&
            typeof savedState.bonuses[bonus].firstIndex === "number") ||
          bonus != "swap"),
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

function resumeSavedState(savedState: GameState): GameState {
  const letterData = savedState.letterData.map((datum, index) => ({
    ...datum,
    previousIndex: index,
  }));
  const deactivatedBonuses = deactivateBonuses(savedState.bonuses);
  return {
    ...savedState,
    playedIndexes: [],
    result: "",
    lastInvalidWord: null,
    bonusText: "",
    bonuses: deactivatedBonuses,
    letterData,
  };
}

export function gameInit({useSaved = true}: {useSaved?: boolean}): GameState {
  const savedGameState = getFromStorage<GameState>("wordfallGameState");

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
    id: crypto.randomUUID(),
    colorIndex: 0,
    previousIndex: undefined,
  }));

  const progress = [numRows * numColumns];

  const colors = [getDistinctHSL()];

  return {
    letterData,
    playedIndexes: [],
    numColumns: numColumns,
    numRows: numRows,
    result: "",
    lastInvalidWord: null,
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
    wordInProgress: false,
  };
}

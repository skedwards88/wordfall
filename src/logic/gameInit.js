import {letterPool} from "./letterPool";
import {getDistinctHSL} from "./getColor";
import {getNLetters} from "@skedwards88/word_logic";
import {findAllWords} from "@skedwards88/word_logic";
import {trie} from "./trie";
import seedrandom from "seedrandom";

export function getPseudoRandomID() {
  // todo could compare to existing IDs to ensure unique? Could string two together for increased randomness?
  const pseudoRandomGenerator = seedrandom();
  return pseudoRandomGenerator();
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

export function gameInit({useSaved = true}) {
  const savedGameState = JSON.parse(localStorage.getItem("wordfallGameState"));

  if (useSaved && savedGameState && savedGameState.letterData) {
    return {...savedGameState, playedIndexes: [], result: "", bonusText: ""};
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
  };
}

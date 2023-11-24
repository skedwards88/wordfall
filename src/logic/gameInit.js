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
  // Select letters and make sure that the computer can find at least
  // 50 words (standard mode) or 20 words (easy mode)
  // otherwise the player will not be able to find many words
  const minWords = 5; //todo omit min word requirement? if add opportunity to shuffle, should be ok
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
  const savedGameState = JSON.parse(localStorage.getItem("wordRushGameState"));

  if (
    useSaved &&
    savedGameState &&
    savedGameState.letterData // todo be more specific with elements of letterData
    // todo need more stuff in order to resume?
  ) {
    return {...savedGameState, playedIndexes: [], result: ""};
  }

  const numRows = 5; //todo play with dimensions on different screen sizes
  const numColumns = 5; // todo i have this hardcoded here and in css right now

  const letters = getPlayableLetters({
    numColumns: numColumns,
    numRows: numRows,
  });

  const letterData = letters.map((letter) => ({
    letter,
    id: getPseudoRandomID(),
    color: 0, //todo generate first color
  }));

  const progress = [numRows * numColumns];

  const colors = [getDistinctHSL()];

  return {
    letterData: letterData, // todo change color prop to colorindex
    playedIndexes: [],
    numColumns: numColumns,
    numRows: numRows,
    result: "",
    progress,
    colors,
  };
}

import {
  pickRandomItemFromArray,
  pickRandomIntBetween,
} from "@skedwards88/word_logic";

function getAllowedHues({inputHue, minDifference, excludedRanges = []}) {
  // return a list of hues that are at least
  // minDifference away from inputHue
  // and that don't include any hues in any specified excludedRanges

  const inputPlus = inputHue + minDifference;
  if (inputPlus < 360) {
    excludedRanges.push([inputHue, inputPlus]);
  } else {
    excludedRanges.push([inputHue, 360]);
    excludedRanges.push([0, inputPlus % 360]);
  }

  const inputMinus = inputHue - minDifference;
  if (inputMinus >= 0) {
    excludedRanges.push([inputMinus, inputHue]);
  } else {
    excludedRanges.push([0, inputHue]);
    excludedRanges.push([360 + inputMinus, 360]);
  }

  let allowedHues = [];
  for (let hue = 0; hue < 360; hue++) {
    // if hue is within excluded range, don't include
    let shouldExclude = false;
    for (const [min, max] of excludedRanges) {
      if (hue >= min && hue <= max) {
        shouldExclude = true;
        break;
      }
    }
    if (!shouldExclude) {
      allowedHues.push(hue);
    }
  }

  return allowedHues;
}

export function getDistinctHSL(hslString) {
  // Gets a HSL value that is visually distinct from the input
  // If the input is undefined, gets a random value

  let oldHue;
  if (hslString) {
    [oldHue] = hslStringToArray(hslString);
  } else {
    oldHue = pickRandomIntBetween(90, 360);
  }

  const allowedNewHues = getAllowedHues({
    inputHue: oldHue,
    minDifference: 90,
    // exclude yellows to ensure better contrast with the white text
    excludedRanges: [[40, 80]],
  });

  const newHue = pickRandomItemFromArray(allowedNewHues);

  const minSaturation = 30;
  const maxSaturation = 60;
  const newSaturation = pickRandomIntBetween(minSaturation, maxSaturation);

  const minLightness = 40;
  const maxLightness = 60;
  const newLightness = pickRandomIntBetween(minLightness, maxLightness);

  const newHslString = hslArrayToString([newHue, newSaturation, newLightness]);

  return newHslString;
}

function hslArrayToString(hslArray) {
  const [h, s, l] = hslArray;

  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hslStringToArray(hslString) {
  // Always assumes the string follows the CSS format
  // hsl(H, S%, L%)
  const regex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  const [, h, s, l] = hslString.match(regex);

  return [parseInt(h), parseInt(s), parseInt(l)];
}

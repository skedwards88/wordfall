function arrayToColumns(array, numColumns) {

  let columns = [];
  for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
    let column = [];
    let nextArrayIndex = columnIndex;
    while (nextArrayIndex < array.length) {
      column.push(nextArrayIndex);
      nextArrayIndex = nextArrayIndex + numColumns;
    }
    columns.push(column);
  }
  return columns;
}

function columnsToArray(columns) {
  let array = [];
  for (let rowIndex = 0; rowIndex < columns[0].length; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const item = columns[columnIndex][rowIndex];
      if (item != undefined) {
        array.push(item);
      }
    }
  }

  return array;
}

function padArray({
  array,
  desiredSize,
  replacementFunction,
  replacementParams,
}) {
  while (array.length < desiredSize) {
    array = [replacementFunction(replacementParams), ...array];
  }
  return array;
}

export function replaceIndexes({
  arrayToReplaceOn,
  indexesToReplace,
  numColumns,
  numRows,
  replacementFunction,
  replacementParams,
}) {
  const allIndexes = arrayToReplaceOn.map((_, index) => index);
  const indexColumns = arrayToColumns(allIndexes, numColumns);
  const newColumns = [];
  for (const column of indexColumns) {
    const remainingColumnIndexes = column.filter(
      (index) => !indexesToReplace.includes(index),
    );
    const remainingColumnLetterData = remainingColumnIndexes.map(
      (index) => arrayToReplaceOn[index],
    );

    const paddedColumn = padArray({
      array: remainingColumnLetterData,
      desiredSize: numRows,
      replacementFunction,
      replacementParams,
    });
    newColumns.push(paddedColumn);
  }

  const newLetterData = columnsToArray(newColumns);

  return newLetterData;
}

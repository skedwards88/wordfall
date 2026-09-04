function arrayToColumnIndexes<T>(array: T[], numColumns: number): number[][] {
  const columns = [];
  for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
    const column = [];
    let nextArrayIndex = columnIndex;
    while (nextArrayIndex < array.length) {
      column.push(nextArrayIndex);
      nextArrayIndex = nextArrayIndex + numColumns;
    }
    columns.push(column);
  }
  return columns;
}

function columnsToArray<T>(columns: T[][]): T[] {
  const array = [];
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

function padArray<T, P>({
  array,
  desiredSize,
  replacementFunction,
  replacementParams,
}: {
  array: T[];
  desiredSize: number;
  replacementFunction: (params: P) => T;
  replacementParams: P;
}): T[] {
  while (array.length < desiredSize) {
    array = [replacementFunction(replacementParams), ...array];
  }
  return array;
}

export function replaceIndexes<T, P>({
  arrayToReplaceOn,
  indexesToReplace,
  numColumns,
  numRows,
  replacementFunction,
  replacementParams,
}: {
  arrayToReplaceOn: T[];
  indexesToReplace: number[];
  numColumns: number;
  numRows: number;
  replacementFunction: (params: P) => T;
  replacementParams: P;
}): T[] {
  const allIndexes = arrayToReplaceOn.map((_, index) => index);
  const indexColumns = arrayToColumnIndexes(allIndexes, numColumns);
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

  const newArray = columnsToArray(newColumns);

  return newArray;
}

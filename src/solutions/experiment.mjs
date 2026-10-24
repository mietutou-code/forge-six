import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeJson } from "../harness.mjs";

function solveLinearSystem(matrix, vector) {
  const size = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) {
        pivot = row;
      }
    }
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];

    const divisor = augmented[column][column];
    for (let index = column; index <= size; index += 1) {
      augmented[column][index] /= divisor;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let index = column; index <= size; index += 1) {
        augmented[row][index] -= factor * augmented[column][index];
      }
    }
  }

  return augmented.map((row) => row[size]);
}

export async function solve(workspace) {
  const rows = (await readFile(path.join(workspace, "measurements.csv"), "utf8"))
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",").map(Number));

  const design = rows.map(([x]) => [x * x, x, 1]);
  const matrix = Array.from({ length: 3 }, () => Array(3).fill(0));
  const vector = Array(3).fill(0);

  for (let row = 0; row < rows.length; row += 1) {
    for (let i = 0; i < 3; i += 1) {
      vector[i] += design[row][i] * rows[row][1];
      for (let j = 0; j < 3; j += 1) {
        matrix[i][j] += design[row][i] * design[row][j];
      }
    }
  }

  const [a, b, c] = solveLinearSystem(matrix, vector);
  const predictions = rows.map(([x]) => a * x * x + b * x + c);
  const mean = rows.reduce((sum, [, y]) => sum + y, 0) / rows.length;
  const residual = rows.reduce(
    (sum, [, y], index) => sum + (y - predictions[index]) ** 2,
    0,
  );
  const total = rows.reduce((sum, [, y]) => sum + (y - mean) ** 2, 0);

  await writeJson(path.join(workspace, "answer.json"), {
    model: { a, b, c },
    r2: 1 - residual / total,
    prediction_at_4: a * 16 + b * 4 + c,
  });
}


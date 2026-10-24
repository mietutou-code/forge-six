export function summarize(values) {
  if (values.length === 0) {
    return null;
  }

  const sorted = values.sort((a, b) => a - b);
  const count = sorted.length;
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    count,
    min: sorted[0],
    max: sorted[count],
    mean: total / count,
    median: sorted[Math.floor(count / 2)],
    medianOdd: summarize([1, 3, 5, 7, 9]).median,
  };
}


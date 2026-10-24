import path from "node:path";
import { assert, assertClose, readJson } from "../../harness.mjs";

export const id = "experiment";
export const capability = "program experimentation";
export const title = "Fit a noisy trajectory";
export const description = "Analyze tabular measurements and report a quadratic fit.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Experiment task

Fit \`y = a*x^2 + b*x + c\` to \`measurements.csv\` with ordinary least squares.
Use an unregularized model with an intercept.

Write \`answer.json\`:

\`\`\`json
{
  "model": { "a": 0, "b": 0, "c": 0 },
  "r2": 0,
  "prediction_at_4": 0
}
\`\`\`

Report at least four decimal places. \`r2\` is the coefficient of determination on
the supplied observations, and \`prediction_at_4\` is the fitted value at \`x = 4\`.
`;

export async function verify(workspace) {
  const answer = await readJson(path.join(workspace, "answer.json"));
  assertClose(answer.model.a, -0.505, 0.02, "quadratic coefficient a");
  assertClose(answer.model.b, 12.02, 0.12, "linear coefficient b");
  assertClose(answer.model.c, 2.98, 0.35, "intercept c");
  assertClose(answer.r2, 0.999, 0.002, "r squared");
  assertClose(answer.prediction_at_4, 42.99, 0.25, "prediction at x=4");
}


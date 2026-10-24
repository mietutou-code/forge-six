import path from "node:path";
import { assert, assertClose, readJson } from "../../harness.mjs";

export const id = "modeling";
export const capability = "simulation modeling";
export const title = "Project an outbreak peak";
export const description = "Simulate an SIR compartment model and summarize its trajectory.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Modeling task

Simulate the SIR model in \`outbreak.json\` with the explicit Euler method:

\`\`\`text
dS/dt = -beta * S * I / N
dI/dt =  beta * S * I / N - gamma * I
dR/dt =  gamma * I
\`\`\`

Use the supplied \`dt\`, begin at day 0, and stop at \`days\`. Clamp negative values
at zero. Report:

\`\`\`json
{
  "peak_infectious": 0,
  "peak_day": 0,
  "final_susceptible": 0,
  "ever_infected": 0
}
\`\`\`

\`peak_infectious\` and populations are rounded to the nearest integer. \`peak_day\`
is a day boundary at which the maximum occurs. \`ever_infected\` includes all people
who have left the susceptible compartment by the final day.
`;

export async function verify(workspace) {
  const answer = await readJson(path.join(workspace, "answer.json"));
  assert(Number.isInteger(answer.peak_infectious), "peak_infectious must be an integer");
  assert(Number.isInteger(answer.peak_day), "peak_day must be an integer");
  assert(Number.isInteger(answer.final_susceptible), "final_susceptible must be an integer");
  assert(Number.isInteger(answer.ever_infected), "ever_infected must be an integer");
  assertClose(answer.peak_infectious, 22642, 40, "peak infectious");
  assertClose(answer.peak_day, 46, 1, "peak day");
  assertClose(answer.final_susceptible, 11368, 40, "final susceptible");
  assertClose(answer.ever_infected, 88632, 40, "ever infected");
}


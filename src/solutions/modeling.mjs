import { readJson, writeJson } from "../harness.mjs";
import path from "node:path";

export async function solve(workspace) {
  const config = await readJson(path.join(workspace, "outbreak.json"));
  const population = config.population;
  let susceptible = config.initial_susceptible;
  let infected = config.initial_infected;
  let recovered =
    population - config.initial_susceptible - config.initial_infected;
  let peakInfectious = infected;
  let peakDay = 0;
  const stepsPerDay = Math.round(1 / config.dt);
  const totalSteps = config.days * stepsPerDay;

  for (let step = 1; step <= totalSteps; step += 1) {
    const infection = (config.beta * susceptible * infected) / population;
    const recovery = config.gamma * infected;
    susceptible = Math.max(0, susceptible - infection * config.dt);
    infected = Math.max(0, infected + (infection - recovery) * config.dt);
    recovered = Math.min(population, recovered + recovery * config.dt);

    if (step % stepsPerDay === 0 && infected > peakInfectious) {
      peakInfectious = infected;
      peakDay = step / stepsPerDay;
    }
  }

  const finalSusceptible = Math.round(susceptible);
  await writeJson(path.join(workspace, "answer.json"), {
    peak_infectious: Math.round(peakInfectious),
    peak_day: peakDay,
    final_susceptible: finalSusceptible,
    ever_infected: population - finalSusceptible,
  });
}


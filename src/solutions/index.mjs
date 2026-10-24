import { solve as vision } from "./vision.mjs";
import { solve as textEdit } from "./text-edit.mjs";
import { solve as experiment } from "./experiment.mjs";
import { solve as modeling } from "./modeling.mjs";
import { solve as programming } from "./programming.mjs";
import { solve as automation } from "./automation.mjs";

export const solutions = new Map([
  ["vision", vision],
  ["text-edit", textEdit],
  ["experiment", experiment],
  ["modeling", modeling],
  ["programming", programming],
  ["automation", automation],
]);


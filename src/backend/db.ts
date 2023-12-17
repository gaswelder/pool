import * as fs from "fs";
import { parseArchive } from "../parser/parser";

export const loadWorkouts = () => read(); // table("data");

const read = () => {
  return parseArchive(fs.readFileSync(`data/workouts.txt`).toString());
};

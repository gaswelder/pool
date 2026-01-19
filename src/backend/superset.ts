import * as fs from "fs";
import { parseLine } from "../parser/shorthand";
import { parseSched } from "./sched";

export type Item = ReturnType<typeof parseSuperset>[0];

/**
 * Reads and parses the superset file.
 */
export const parseSuperset = (path: string) => {
  const text = fs.readFileSync(path).toString();
  const exes = parseSched(text);
  return exes.map((ex) => {
    const parsed = parseLine(ex.line);
    const kind = parsed.desc.split(" ")[0];
    return { ...ex, parsed, kind };
  });
};

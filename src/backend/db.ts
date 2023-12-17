import * as fs from "fs";
import { parseArchive } from "../parser/parser";
import { WorkoutFromJSON } from "../types";

export const loadWorkouts = () => read(); // table("data");
export const saveWorkouts = (ww: WorkoutFromJSON[]) => writeTable("data", ww);

const table = (name: string) => {
  const data = JSON.parse(fs.readFileSync(`data/${name}.json`).toString());
  return data.records as WorkoutFromJSON[];
};

const read = () => {
  return parseArchive(fs.readFileSync(`data/workouts.txt`).toString());
};

const writeTable = (name: string, records: WorkoutFromJSON[]) => {
  fs.copyFileSync(
    `data/${name}.json`,
    `data/backup-${Date.now()}-${name}.json`
  );
  fs.writeFileSync(`data/${name}.json`, JSON.stringify({ records }, null, 2));
  const s = records
    .flatMap((w) => {
      const lines = [`## ${w.title}\n`];
      lines.push(`id: ${w.id}`);
      lines.push(`created: ${w.created}`);
      lines.push(`swam: ${w.swam || ""}`);
      lines.push(`archived: ${w.archived || ""}`);
      lines.push("");
      for (const e of w.lines) {
        lines.push(e);
      }
      lines.push("");
      for (const c of w.comments) {
        lines.push("// " + c);
      }
      lines.push("\n");
      return lines;
    })
    .join("\n");
  fs.writeFileSync(`data/workouts.txt`, s);
};

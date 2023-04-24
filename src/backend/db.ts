import * as fs from "fs";
import { WorkoutFromJSON } from "../types";

export const loadWorkouts = () => read(); // table("data");
export const saveWorkouts = (ww: WorkoutFromJSON[]) => writeTable("data", ww);

const table = (name: string) => {
  const data = JSON.parse(fs.readFileSync(`data/${name}.json`).toString());
  return data.records as WorkoutFromJSON[];
};

const read = () => {
  const ww = [] as WorkoutFromJSON[];
  const lines = fs.readFileSync(`data/workouts.txt`).toString().split(/\n+/);
  const r = (prefix: string) => {
    const line = lines.shift();
    if (!line) {
      throw new Error(`expected ${prefix}, got end of lines`);
    }
    if (!line.startsWith(prefix)) {
      throw new Error(`expected ${prefix}, got ${line}`);
    }
    return line.substring(prefix.length, line.length);
  };
  const rval = (key: string) => r(`${key}: `);
  const rtitle = () => r("## ");
  while (lines.length > 0) {
    const title = rtitle();
    const id = rval("id");
    const created = rval("created");
    const swam = rval("swam");
    const archived = rval("archived");
    const w = {
      title,
      id,
      created,
      swam,
      archived,
      ex: [] as string[],
    };
    while (lines.length > 0 && !lines[0].startsWith("##")) {
      const line = lines.shift();
      if (!line) {
        continue;
      }
      w.ex.push(line);
    }
    ww.push(w);
  }
  return ww;
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
      for (const e of w.ex) {
        lines.push(e);
      }
      lines.push("\n");
      return lines;
    })
    .join("\n");
  fs.writeFileSync(`data/workouts.txt`, s);
};

export const loadFavs = () => {
  try {
    const data = JSON.parse(fs.readFileSync(`data/favorites.json`).toString());
    return data as string[];
  } catch (err) {
    return [] as string[];
  }
};

export const saveFavs = (favs: string[]) => {
  const name = "favorites";
  try {
    fs.copyFileSync(
      `data/${name}.json`,
      `data/backup-${Date.now()}-${name}.json`
    );
  } catch (err) {
    console.log(err);
  }
  fs.writeFileSync(`data/${name}.json`, JSON.stringify(favs, null, 2));
};

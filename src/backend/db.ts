import * as fs from "fs";
import { WorkoutFromJSON } from "../types";

export const loadWorkouts = () => table("data");
export const saveWorkouts = (ww: WorkoutFromJSON[]) => writeTable("data", ww);

const table = (name: string) => {
  const data = JSON.parse(fs.readFileSync(`data/${name}.json`).toString());
  return data.records as WorkoutFromJSON[];
};

const writeTable = (name: string, records: WorkoutFromJSON[]) => {
  fs.copyFileSync(
    `data/${name}.json`,
    `data/backup-${Date.now()}-${name}.json`
  );
  fs.writeFileSync(`data/${name}.json`, JSON.stringify({ records }, null, 2));
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

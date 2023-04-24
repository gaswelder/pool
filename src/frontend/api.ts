import { WorkoutFromJSON } from "../types";

const call = async (method: string, params?: unknown) => {
  const response = await fetch("http://localhost:2346/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params }),
  });
  const body = await response.json();
  if (body.error) {
    throw new Error(body.error.message);
  }
  return body.data;
};

export const api = {
  workouts: () =>
    call("getWorkouts") as Promise<{
      planned: WorkoutFromJSON[];
      workouts: WorkoutFromJSON[];
      favorites: string[];
    }>,
  addPlan: (w: { title: string; text: string }) => call("addPlan", w),
  archive: (id: string) => call("archive", { id }),
  setFavorite: (ex: string, fav: boolean) => call("setFavorite", { ex, fav }),
  import: (ww: WorkoutFromJSON[]) => call("import", ww),
};

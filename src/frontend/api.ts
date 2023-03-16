import { PlannedWorkout, WorkoutFromJSON } from "../types";

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
      planned: PlannedWorkout[];
      workouts: WorkoutFromJSON[];
    }>,
  addPlan: (draft: PlannedWorkout) => call("addPlan", draft),
  archive: (id: string) => call("archive", { id }),
};

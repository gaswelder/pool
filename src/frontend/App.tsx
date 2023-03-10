import * as React from "react";
import styled from "styled-components";
import { parseJSONWorkout } from "../parser/parser";
import { toErr } from "../ts";
import { PlannedWorkout, WorkoutFromJSON } from "../types";
import { call } from "./api";
import { Planned } from "./Planned";
import { Review } from "./Review";
import { useResource } from "./use-resource";

const AppDiv = styled.div`
  padding: 1em;
`;

export const App = () => {
  return (
    <AppDiv>
      <a href="planned">Planned</a> | <a href="review">Review</a>
      <Content />
    </AppDiv>
  );
};

const Content = () => {
  const { data: db, reload } = useResource(
    () =>
      call("getWorkouts") as Promise<{
        planned: PlannedWorkout[];
        workouts: WorkoutFromJSON[];
      }>,
    []
  );
  if (!db) {
    return <>loading db</>;
  }
  switch (location.pathname) {
    case "/":
    case "/planned":
      return (
        <Planned
          planned={db.planned}
          onDraftAdd={async (draft) => {
            try {
              await call("addPlan", draft);
              await reload();
            } catch (err) {
              alert(toErr(err).message);
            }
          }}
        />
      );
    case "/review":
      return (
        <Review
          workouts={db.workouts.map(parseJSONWorkout)}
          onArchive={async (id) => {
            await call("archive", { id });
            await reload();
          }}
        />
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

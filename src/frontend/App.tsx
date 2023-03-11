import * as React from "react";
import styled from "styled-components";
import { parseJSONWorkout } from "../parser/parser";
import { toErr } from "../ts";
import { PlannedWorkout, WorkoutFromJSON } from "../types";
import { call } from "./api";
import { Draft } from "./Draft";
import { Planned } from "./Planned";
import { Review } from "./Review";
import { Theme } from "./theme";
import { toast } from "./toast";
import { useResource } from "./use-resource";

const AppDiv = styled.div`
  background: #d1dfec;
  min-height: 100%;
  padding: 1em;
  & > a {
    color: #2b475c;
    text-decoration: none;
  }
  & h3 {
    color: #0d3639;
  }
  & input {
    font-size: ${Theme.fontSize};
    font-family: inherit;
    border-radius: ${Theme.borderRadius};
    border: 1px solid #5b7f91;
    padding: 8px ${Theme.w};
  }
  & textarea {
    font-size: ${Theme.fontSize};
    padding: 8px ${Theme.w};
  }
  & button {
    font-size: ${Theme.fontSize};
    font-family: inherit;
    border-radius: ${Theme.borderRadius};
    padding: 4px ${Theme.w};
    border: 1px solid #5b7f91;
    background-color: #f1f0f2;
    color: #2b475c;
  }
`;

export const App = () => {
  return (
    <AppDiv>
      <a href="draft">Draft</a> | <a href="planned">Planned</a> |{" "}
      <a href="review">Review</a>
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
      return <Planned planned={db.planned} />;
    case "/draft":
      return (
        <Draft
          onAdd={async (draft) => {
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
            toast("Archived");
            await reload();
          }}
        />
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

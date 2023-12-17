import styled from "styled-components";
import { parseDraft } from "../parser/shorthand";
import { ParsedWorkout, WorkoutFromJSON } from "../parser/types";
import { A, useLocation } from "./A";
import { Draft } from "./Draft";
import { api } from "./api";
import { Theme } from "./theme";
import { useResource } from "./use-resource";
import { Review } from "./Review";
import { useState } from "react";

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
  & button:active {
    border-color: #2618ce;
    background-color: #bbdeeb;
  }
`;

export const App = () => {
  return (
    <AppDiv>
      <Content />
    </AppDiv>
  );
};

const parseJSONWorkout = (w: WorkoutFromJSON): ParsedWorkout => {
  const { result, errors } = parseDraft(w.lines.join("\n"));
  errors.forEach((err) => {
    throw err;
  });
  return { ...w, sections: result };
};

const Content = () => {
  const { data: db } = useResource(api.workouts, []);
  const { location } = useLocation();
  const [workouts, setWorkouts] = useState([] as ParsedWorkout[]);
  if (!db) {
    return <>loading db</>;
  }

  const generate = async () => {
    setWorkouts(db.workouts.map((x) => parseJSONWorkout(x)));
  };
  switch (location.pathname) {
    case "/":
      return (
        <>
          <Draft />
          <button type="button" onClick={generate}>
            Generate
          </button>
          <Review workouts={workouts} />
        </>
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

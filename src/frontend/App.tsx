import styled from "styled-components";
import { parseDraft } from "../parser/parser";
import { toErr } from "../ts";
import { ParsedWorkout, WorkoutFromJSON } from "../types";
import { A, useLocation } from "./A";
import { api } from "./api";
import { Draft } from "./Draft";
import { Import } from "./Import";
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
  & button:active {
    border-color: #2618ce;
    background-color: #bbdeeb;
  }
`;

export const App = () => {
  return (
    <AppDiv>
      <A href="draft">Draft</A> | <A href="planned">Planned</A> |{" "}
      <A href="review">Review</A> | <A href="import">Import</A>
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
  const { data: db, reload } = useResource(api.workouts, []);
  const { location } = useLocation();
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
              await api.addPlan(draft);
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
            await api.archive(id);
            toast("Archived");
            await reload();
          }}
        />
      );
    case "/import":
      return (
        <Import
          onAdd={async (ww) => {
            await api.import(ww);
          }}
        />
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

import * as React from "react";
import styled from "styled-components";
import { parseDraft, workoutVolume } from "../parser/parser";
import { PlannedWorkout } from "../types";
import { Collapsible } from "./Collapsible";
import { Draft } from "./Draft";
import { Workout } from "./Workout";

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

type P = {
  planned: PlannedWorkout[];
  onDraftAdd: (d: unknown) => void;
};

export const Planned = ({ planned, onDraftAdd }: P) => {
  return (
    <>
      <h3>Planned</h3>
      {planned.map(({ title, draft }) => {
        const { result, errors } = parseDraft(draft);
        return (
          <Collapsible
            key={title}
            header={() => (
              <Title>
                {errors.length > 0 && "!"}
                {title} <span>{workoutVolume(result)} m</span>
              </Title>
            )}
            content={() => (
              <div>
                <Workout sections={result} />
                <textarea>comments</textarea>
                <button type="button">Update</button>
                <button type="button">Archive</button>
              </div>
            )}
          />
        );
      })}
      <Draft onAdd={onDraftAdd} />
    </>
  );
};

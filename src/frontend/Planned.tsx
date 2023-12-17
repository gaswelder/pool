import styled from "styled-components";
import { parseDraft, workoutVolume } from "../parser/shorthand";
import { WorkoutFromJSON } from "../parser/types";
import { Collapsible } from "./Collapsible";
import { Workout } from "./Workout";

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

type P = {
  planned: WorkoutFromJSON[];
};

export const Planned = ({ planned }: P) => {
  return (
    <>
      <h3>Planned</h3>
      <p>{planned.length} workouts</p>
      {planned.map((w) => {
        const { result, errors } = parseDraft(w.lines.join("\n"));
        return (
          <Collapsible
            key={w.title}
            header={() => (
              <Title>
                {errors.length > 0 && "!"}
                {w.title} <span>{workoutVolume(result)} m</span>
              </Title>
            )}
            content={() => (
              <div>
                <Workout sections={result} />
                <textarea value={w.comments.join("\n")} />
                <button type="button">Update</button>
                <button type="button">Archive</button>
              </div>
            )}
          />
        );
      })}
    </>
  );
};

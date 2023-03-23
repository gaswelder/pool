import styled from "styled-components";
import { parseDraft, workoutVolume } from "../parser/parser";
import { WorkoutFromJSON } from "../types";
import { Collapsible } from "./Collapsible";
import { Workout } from "./Workout";

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

type P = {
  planned: WorkoutFromJSON[];
  favorites: string[];
  onFavChange: (ex: string, fav: boolean) => void;
};

export const Planned = ({ planned, favorites, onFavChange }: P) => {
  return (
    <>
      <h3>Planned</h3>
      <p>{planned.length} workouts</p>
      {planned.map(({ title, ex }) => {
        const { result, errors } = parseDraft(ex.join("\n"));
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
                <Workout
                  sections={result}
                  favorites={favorites}
                  onFavChange={onFavChange}
                />
                <textarea>comments</textarea>
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

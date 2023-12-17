import styled from "styled-components";
import { workoutVolume } from "../parser/parser";
import { ParsedWorkout } from "../types";
import { Collapsible } from "./Collapsible";
import { Theme } from "./theme";
import { Workout } from "./Workout";

const ContainerDiv = styled.div`
  & button {
    margin-top: ${Theme.h};
    margin-left: auto;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

type P = {
  workouts: ParsedWorkout[];
};

export const Review = ({ workouts }: P) => {
  const now = new Date().toISOString();
  return (
    <>
      <h3>Review</h3>
      <p>{workouts.length} workouts</p>
      {workouts
        .sort((a, b) => (a.swam || now).localeCompare(b.swam || now))
        .map((workout) => {
          return (
            <Collapsible
              key={workout.id}
              header={() => (
                <Title>
                  {workout.title || workout.swam}{" "}
                  <span>{workoutVolume(workout.sections)} m</span>
                </Title>
              )}
              content={() => (
                <ContainerDiv>
                  <Workout sections={workout.sections} />
                </ContainerDiv>
              )}
            />
          );
        })}
    </>
  );
};

import styled from "styled-components";
import { workoutVolume } from "../parser/shorthand";
import { ParsedWorkout } from "../parser/types";
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
      {workouts.map((workout, i) => {
        return (
          <Collapsible
            key={i}
            header={() => (
              <Title>
                {workout.title} <span>{workoutVolume(workout.sections)} m</span>
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

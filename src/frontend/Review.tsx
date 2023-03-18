import { useState } from "react";
import styled from "styled-components";
import { workoutVolume } from "../parser/parser";
import { ParsedWorkout } from "../types";
import { Collapsible } from "./Collapsible";
import { Theme } from "./theme";
import { Workout } from "./Workout";

const ContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
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
  onArchive: (id: string) => void;
};

export const Review = ({ workouts, onArchive }: P) => {
  const [archiving, setArchiving] = useState(false);
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
              key={workout.title}
              header={() => (
                <Title>
                  {workout.title || workout.swam}{" "}
                  <span>{workoutVolume(workout.sections)} m</span>
                </Title>
              )}
              content={() => {
                return (
                  <ContainerDiv>
                    <Workout sections={workout.sections} />
                    <button
                      type="button"
                      disabled={archiving}
                      onClick={async () => {
                        setArchiving(true);
                        await onArchive(workout.title);
                        setArchiving(false);
                      }}
                    >
                      Archive
                    </button>
                  </ContainerDiv>
                );
              }}
            />
          );
        })}
    </>
  );
};

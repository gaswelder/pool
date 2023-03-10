import * as React from "react";
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
  return (
    <>
      <h3>Review</h3>
      {workouts
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((workout) => {
          return (
            <Collapsible
              key={workout.date}
              header={() => (
                <Title>
                  {workout.title || workout.date}{" "}
                  <span>{workoutVolume(workout.sections)} m</span>
                </Title>
              )}
              content={() => {
                return (
                  <ContainerDiv>
                    <Workout sections={workout.sections} />
                    <button
                      type="button"
                      onClick={() => {
                        onArchive(workout.title);
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

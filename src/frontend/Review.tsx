import * as React from "react";
import styled from "styled-components";
import { workoutVolume } from "../parser/parser";
import { ParsedWorkout } from "../types";
import { Collapsible } from "./Collapsible";
import { Workout } from "./Workout";

const formatDate = (date: Date) => {
  const wd = date.toLocaleDateString("ru", { weekday: "short" });
  return date.toLocaleDateString("ru", { dateStyle: "full" }) + ` (${wd})`;
};

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
      {workouts.map((workout) => {
        return (
          <Collapsible
            key={workout.date}
            header={() => (
              <Title>
                {workout.title || formatDate(new Date(workout.date))}{" "}
                <span>{workoutVolume(workout.sections)} m</span>
              </Title>
            )}
            content={() => {
              return (
                <>
                  <Workout sections={workout.sections} />
                  <button
                    type="button"
                    onClick={() => {
                      onArchive(workout.title);
                    }}
                  >
                    Archive
                  </button>
                </>
              );
            }}
          />
        );
      })}
    </>
  );
};

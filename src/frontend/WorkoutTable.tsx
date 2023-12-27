import styled from "styled-components";
import { Line } from "../parser/shorthand";
import { Theme } from "./theme";
import { Fragment } from "react";
import { SetProg } from "./draft";
// import bracket from "./Left_square_bracket.svg";

const sum = (a: number, b: number) => a + b;
const lineVolume = (line: Line) => line.repeats * line.amount;
const setVolume = (set: SetProg) => set.lines.map(lineVolume).reduce(sum, 0);
const workoutVolume = (w: SetProg[]) => w.map(setVolume).reduce(sum, 0);

const Table = styled.table`
  table {
    min-width: 20em;
  }
  td,
  th {
    padding: 6px;
    vertical-align: top;
    font-size: ${Theme.fontSize};
  }
  th {
    font-size: 80%;
    text-align: left;
    padding-top: 16px;
    border-bottom: thin solid #d1dfec;
  }
  td:nth-child(1) {
    white-space: nowrap;
  }
  td {
  }
  .repeats {
    position: relative;
    width: 36px;
  }
  .section-name th {
    font-weight: normal;
    font-style: italic;
  }
`;

export const WorkoutTable = ({ workout }: { workout: SetProg[] }) => {
  return (
    <>
      <Table>
        <tbody>
          {workout.map((set, setIndex) => {
            return (
              <Fragment key={setIndex}>
                <tr>
                  <th colSpan={2}>{set.name}</th>
                </tr>
                {set.lines.map((line, i) => (
                  <tr key={i}>
                    <td>
                      <Rep line={line} />
                    </td>
                    <td>{line.desc}</td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </Table>
      <b>{workoutVolume(workout)}</b>
    </>
  );
};

const Rep = ({ line }: { line: Line }) => {
  if (line.repeats > 1) {
    return (
      <>
        {line.repeats}&thinsp;&times;&thinsp;{line.amount}
      </>
    );
  }
  return <>{line.amount}</>;
};

const RepeatsContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 35px;
  > div {
    background-size: 100% 100%;
    width: 10px;
    height: 100%;
    opacity: 0.5;
  }
`;

const Tag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  font-size: 90%;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color};
  border-radius: ${Theme.borderRadius};
`;

const Equipment = ({ id }: { id: string }) => {
  const colors: Record<string, string> = {
    buoy: "green",
    "ankle-buoy": "green",
    shortpaddles: "orange",
    "small-paddles": "orange",
    paddles: "gray",
    bigpaddles: "red",
    kickboard: "blue",
    brakes: "greed",
    fins: "orange",
  };
  return <Tag color={colors[id]}>{id}</Tag>;
};

import styled from "styled-components";
import { Line } from "../parser/shorthand";
import { Theme } from "./theme";
import { Fragment } from "react";
import { SetProg } from "./draft";

const reps = (title: string) => {
  const m = title.match(/^(\d+)\s*x/);
  if (m) {
    return parseInt(m[1], 10);
  }
  return 1;
};
const sum = (a: number, b: number) => a + b;
const lineVolume = (line: Line) => line.repeats * line.amount;
const setVolume = (set: SetProg) =>
  reps(set.name) * set.lines.map(lineVolume).reduce(sum, 0);
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
    border-bottom: thin solid ${Theme.thLineColor};
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
  & + b {
    display: block;
    border-top: 1px solid #aac;
    margin-top: ${Theme.h};
    padding-top: ${Theme.h};
  }
`;

const Tag = styled.span`
  margin: 0;
  color: ${(props) => props.color};
  text-decoration: underline;
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
                    <td>
                      <Desc text={line.desc} />{" "}
                      {line.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </td>
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

const Desc = ({ text }: { text: string }) => {
  const [title, ...comments] = text.split("//");
  return (
    <>
      {title}
      {comments.length > 0 && (
        <div
          style={{
            color: "#333",
            fontSize: "90%",
            fontStyle: "italic",
            marginTop: "6px",
          }}
        >
          {comments.join(" ")}
        </div>
      )}
    </>
  );
};

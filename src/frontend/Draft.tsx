import { useMemo, useState } from "react";
import styled from "styled-components";
import { Collapsible } from "./lib/Collapsible";
import { WorkoutTable } from "./WorkoutTable";
import { SetProg, parseDraft } from "./draft";
import { Theme } from "./theme";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
  border-width: 0;
`;

const WorkoutContainer = styled.div`
  background-color: transparent;
  border-radius: ${Theme.borderRadius};
  display: flex;
  flex-wrap: wrap;
  & section {
    background: white;
    width: 320px;
    position: relative;
    border-radius: ${Theme.borderRadius};
    padding: ${Theme.h} ${Theme.w};
    margin-right: 6px;
    margin-top: 6px;
  }
  & section h3 + p {
    font-size: 90%;
  }
  @media print {
    & section {
      position: static;
      ::after {
        display: none;
      }
      flex-grow: 1;
      width: 40%;
      margin: 6px;
      padding: 6px;
      border: 1px solid black;
    }
  }
`;

export const Draft = ({ initialText }: { initialText: string }) => {
  const [text, setText] = useState(initialText);
  const prog = useMemo(() => parseDraft(text), [text]);
  return (
    <>
      <Collapsible
        header={() => <>Editor</>}
        content={() => (
          <DraftTextarea
            onChange={(e) => {
              setText(e.target.value);
            }}
          >
            {text}
          </DraftTextarea>
        )}
      />

      {prog.errors.map((err, i) => (
        <p key={i} style={{ color: "red" }}>
          {err.message}
        </p>
      ))}
      <WorkoutContainer>
        {prog &&
          prog.days.map((day) => (
            <section key={day.name}>
              <h3>{day.name}</h3>
              <p>{summary(day.sets)}</p>
              <WorkoutTable workout={day.sets} />
            </section>
          ))}
      </WorkoutContainer>
    </>
  );
};

const summary = (sets: SetProg[]) => {
  const firstWord = (s: string) => s.split(" ")[0];
  const flines = sets.flatMap((x) => x.lines);

  const bar = {} as Record<string, number>;
  let total = 0;
  flines.forEach((x) => {
    total += x.repeats * x.amount;
    const kind = firstWord(x.desc);
    bar[kind] = (bar[kind] || 0) + x.repeats * x.amount;
  });

  return Object.entries(bar)
    .sort((a, b) => b[1] - a[1])
    .filter((e) => e[1] > 0)
    .map(([kind, sum]) => {
      return `${Math.round((100 * sum) / total)}% ${kind}`;
    })
    .join(", ");
};

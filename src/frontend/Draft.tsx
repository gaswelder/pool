import { useMemo, useState } from "react";
import styled from "styled-components";
import { Collapsible } from "./Collapsible";
import { WorkoutTable } from "./WorkoutTable";
import { parseDraft } from "./draft";
import { Theme } from "./theme";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
  border-width: 0;
`;

const WorkoutContainer = styled.div`
  background-color: white;
  padding: ${Theme.h} ${Theme.w};
  border-radius: ${Theme.borderRadius};
  display: flex;
  flex-wrap: wrap;
  & section {
    max-width: 20em;
    position: relative;
    margin-right: 40px;
  }
  & section::after {
    display: block;
    content: "";
    border-right: 1px solid #ccc;
    position: absolute;
    right: -20px;
    top: 80px;
    bottom: 0;
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
              <WorkoutTable workout={day.sets} />
            </section>
          ))}
      </WorkoutContainer>
    </>
  );
};

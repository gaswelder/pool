import { useMemo, useState } from "react";
import styled from "styled-components";
import { Collapsible } from "./Collapsible";
import { WorkoutTable } from "./WorkoutTable";
import { parseDraft } from "./draft";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
  border-width: 0;
`;

const WorkoutContainer = styled.div`
  background-color: white;
  padding: 1em;
  margin-left: 0.5em;
  border-radius: 4px;
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

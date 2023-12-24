import { useMemo, useState } from "react";
import styled from "styled-components";
import { WorkoutTable } from "./WorkoutTable";
import { parseDraft } from "./draft";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
`;

const WorkoutContainer = styled.div`
  background-color: white;
`;

const TwoDiv = styled.div`
  display: flex;
  & > * {
    flex: 1;
  }
`;

export const Draft = ({ initialText }: { initialText: string }) => {
  const [text, setText] = useState(initialText);
  const { result, errors } = useMemo(() => parseDraft(text), [text]);
  return (
    <>
      <h3>Draft</h3>
      <form>
        <TwoDiv>
          <DraftTextarea
            onChange={(e) => {
              setText(e.target.value);
            }}
          >
            {text}
          </DraftTextarea>
          {result && (
            <WorkoutContainer>
              <WorkoutTable workout={result} />
            </WorkoutContainer>
          )}
        </TwoDiv>
        {errors.map((err, i) => (
          <p key={i} style={{ color: "red" }}>
            {err.message}
          </p>
        ))}
      </form>
    </>
  );
};

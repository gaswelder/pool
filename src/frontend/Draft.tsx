import { useMemo, useState } from "react";
import styled from "styled-components";
import { parseDraft } from "../parser/parser";
import { WorkoutFromJSON } from "../types";
import { Workout } from "./Workout";

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

type P = {
  onAdd: (w: WorkoutFromJSON) => Promise<void>;
};

export const Draft = ({ onAdd }: P) => {
  const [title, setTitle] = useState("");
  const [val, setVal] = useState(`-- warmup
4 x 100 easy flutter kick
4 x 100 easy freestyle
-- 4 x main
100 underwater pull
400 butterfly
`);
  const { result, errors } = useMemo(() => parseDraft(val), [val]);

  return (
    <>
      <h3>Workout draft</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onAdd({ title, ex: val.split(/\n/), date: null });
          location.href = "planned";
        }}
      >
        <input
          placeholder="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <TwoDiv>
          <DraftTextarea
            onChange={(e) => {
              setVal(e.target.value);
            }}
          >
            {val}
          </DraftTextarea>
          {result && (
            <WorkoutContainer>
              <Workout sections={result} />
            </WorkoutContainer>
          )}
        </TwoDiv>
        {errors.map((err, i) => (
          <p key={i} style={{ color: "red" }}>
            {err.message}
          </p>
        ))}
        <button disabled={errors.length > 0}>Save</button>
      </form>
    </>
  );
};

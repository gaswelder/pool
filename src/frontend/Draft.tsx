import { useMemo, useState } from "react";
import * as React from "react";
import styled from "styled-components";
import { parseDraft } from "../parser/parser";
import { PlannedWorkout } from "../types";
import { Workout } from "./Workout";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
`;

const TwoDiv = styled.div`
  display: flex;
`;

type P = {
  onAdd: (w: PlannedWorkout) => void;
};

export const Draft = ({ onAdd }: P) => {
  const [val, setVal] = useState("");
  const { result, errors } = useMemo(() => parseDraft(val), [val]);
  const [title, setTitle] = useState("");
  return (
    <div>
      <input
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
        {result && <Workout sections={result} />}
      </TwoDiv>
      {errors.map((err, i) => (
        <p key={i} style={{ color: "red" }}>
          {err.message}
        </p>
      ))}
      <button
        type="button"
        disabled={errors.length > 0}
        onClick={() => {
          onAdd({ title, draft: val });
        }}
      >
        Plan
      </button>
    </div>
  );
};

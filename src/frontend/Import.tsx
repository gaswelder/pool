import { useMemo, useState } from "react";
import styled from "styled-components";
import { parseArchive, parseDraft, workoutVolume } from "../parser/parser";
import { toErr } from "../ts";
import { WorkoutFromJSON } from "../types";
import { toast } from "./toast";

const DraftTextarea = styled.textarea`
  width: 60em;
  height: 30em;
`;

type P = {
  onAdd: (w: WorkoutFromJSON[]) => Promise<void>;
};

export const Import = ({ onAdd }: P) => {
  const [text, setText] = useState("");
  const { workouts, errors } = useMemo(() => {
    try {
      const workouts = parseArchive(text).map((x) => {
        const { result, errors } = parseDraft(x.lines.join("\n"));
        return {
          ...x,
          sections: result,
          errors,
        };
      });
      return { workouts, errors: workouts.flatMap((x) => x.errors) };
    } catch (err) {
      return { workouts: [], errors: [toErr(err)] };
    }
  }, [text]);
  return (
    <>
      <h3>Import</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onAdd(workouts);
          setText("");
          toast("Imported");
          // location.href = "planned";
        }}
      >
        <DraftTextarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
        <p>
          {workouts.length} workouts,{" "}
          {sum(workouts.map((w) => workoutVolume(w.sections)))} m
        </p>
        {errors.map((error, i) => (
          <p key={i} style={{ color: "red" }}>
            {error.message}
          </p>
        ))}
        <button disabled={errors.length > 0}>Save</button>
      </form>
    </>
  );
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

import { useMemo, useState } from "react";
import styled from "styled-components";
import { parseArchive } from "../parser/parser";
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
  const { workouts, error } = useMemo(() => {
    try {
      return { workouts: parseArchive(text), error: null };
    } catch (err) {
      return { workouts: [], error: toErr(err) };
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
        {error && <p style={{ color: "red" }}>{error.message}</p>}
        <button disabled={error != null}>Save</button>
      </form>
    </>
  );
};

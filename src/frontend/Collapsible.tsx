import * as React from "react";
import { useState } from "react";

type P = {
  header: () => JSX.Element;
  content: () => JSX.Element;
};

export const Collapsible = ({ header, content }: P) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((x) => !x);
  return (
    <>
      <div
        style={{
          background: "#fafafa",
          padding: 10,
          border: "thin solid #aaa",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        {header()}
      </div>
      {open && (
        <div
          style={{
            background: "#fafafa",
            padding: 10,
            border: "thin solid #aaa",
          }}
        >
          {content()}
        </div>
      )}
    </>
  );
};

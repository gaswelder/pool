import { useState } from "react";
import styled from "styled-components";
import { ESet } from "../parser/shorthand";
import { useLocation } from "./A";
import { Draft } from "./Draft";
import { Review } from "./Review";
import { Theme } from "./theme";
import { parseDraft } from "./draft";
import { sst } from "./sets";

const AppDiv = styled.div`
  background: #d1dfec;
  min-height: 100%;
  padding: 1em;
  & > a {
    color: #2b475c;
    text-decoration: none;
  }
  & h3 {
    color: #0d3639;
  }
  & input {
    font-size: ${Theme.fontSize};
    font-family: inherit;
    border-radius: ${Theme.borderRadius};
    border: 1px solid #5b7f91;
    padding: 8px ${Theme.w};
  }
  & textarea {
    font-size: ${Theme.fontSize};
    padding: 8px ${Theme.w};
  }
  & button {
    font-size: ${Theme.fontSize};
    font-family: inherit;
    border-radius: ${Theme.borderRadius};
    padding: 4px ${Theme.w};
    border: 1px solid #5b7f91;
    background-color: #f1f0f2;
    color: #2b475c;
  }
  & button:active {
    border-color: #2618ce;
    background-color: #bbdeeb;
  }
`;

export const App = () => {
  return (
    <AppDiv>
      <Content />
    </AppDiv>
  );
};

const Content = () => {
  const { location } = useLocation();
  const [sets, setSets] = useState(`-- warmup
  4 x 100 easy flutter kick
  4 x 100 easy freestyle
  -- 4 x main
  100 underwater pull
  400 butterfly
  `);
  const [ver, setVer] = useState(0);

  switch (location.pathname) {
    case "/":
      return (
        <>
          <Draft key={ver} initialText={sets} />
          <button
            type="button"
            onClick={() => {
              const r = sst();
              setSets(r[0].sets);
              setVer((x) => x + 1);
            }}
          >
            Generate
          </button>
          <Review sets={parseDraft(sets).result} />
        </>
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

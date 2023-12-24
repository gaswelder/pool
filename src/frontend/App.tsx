import { useState } from "react";
import styled from "styled-components";
import { ESet } from "../parser/shorthand";
import { useLocation } from "./A";
import { Draft } from "./Draft";
import { Review } from "./Review";
import { Theme } from "./theme";
import { parseDraft } from "./draft";

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
  const [sets, setSets] = useState([] as ESet[]);

  const generate = async () => {
    const t = parseDraft(`
-- 10 x Burning Unicorn (all with fins and time)
50 max effort
150 swim out, rest as needed
`);
  };
  switch (location.pathname) {
    case "/":
      return (
        <>
          <Draft />
          <button type="button" onClick={generate}>
            Generate
          </button>
          <Review sets={sets} />
        </>
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

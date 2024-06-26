import { useState } from "react";
import styled from "styled-components";
import { Calc } from "./Calc";
import { Draft } from "./Draft";
import { useLocation } from "./lib/A";
import { Collapsible } from "./lib/Collapsible";
import { Theme } from "./theme";
import { Item } from "../backend/superset";

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
  @media print {
    & details,
    & button {
      display: none;
    }
    & {
      padding: 0;
      margin: 0;
    }
  }
`;

export const App = () => {
  return (
    <AppDiv>
      <Content />
    </AppDiv>
  );
};

const call = async (method: string, params?: unknown) => {
  const response = await fetch("http://localhost:2346/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params }),
  });
  const body = await response.json();
  if (body.error) {
    throw new Error(body.error.message);
  }
  return body.data;
};

const formatItem = (item: Item) => {
  const p = item.parsed;
  let line = "";
  if (p.repeats > 1) {
    line += `${p.repeats}x`;
  }
  line += `${p.amount} ${p.desc}`;
  if (p.tags.length > 0) {
    line += " " + p.tags.map((t) => "#" + t).join(", ");
  }
  if (item.comments.length > 0) {
    line += " // " + item.comments.join(" ");
  }
  return line;
};

const formatSet = (set: { title: string; elements: Item[] }) => {
  return ["-- " + set.title, ...set.elements.flatMap(formatItem)];
};

const formatDay = (day: {
  title: string;
  sets: { title: string; elements: Item[] }[];
}) => {
  return [`# ${day.title}`, ...day.sets.flatMap(formatSet)];
};

const gen = async () => {
  const r = (await call("generate", {})) as {
    title: string;
    sets: { title: string; elements: Item[] }[];
  }[];

  return r.flatMap(formatDay).join("\n");
};

const Content = () => {
  const { location } = useLocation();
  const [text, setText] = useState("");
  const [ver, setVer] = useState(0);
  const load = async () => {
    setText(await gen());
    setVer((x) => x + 1);
  };

  switch (location.pathname) {
    case "/":
      return (
        <>
          <button type="button" onClick={load}>
            Generate
          </button>
          <Collapsible
            header={() => <>Calculator</>}
            content={() => <Calc />}
          />
          <Draft key={ver} initialText={text} />
        </>
      );
    default:
      return <>unknown location: {location.pathname}</>;
  }
};

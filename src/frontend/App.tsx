import { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation } from "./lib/A";
import { Draft } from "./Draft";
import { Theme } from "./theme";
import { Collapsible } from "./lib/Collapsible";

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

const gen = async () => {
  return call("generate", {});
};

const Content = () => {
  const { location } = useLocation();
  const [text, setText] = useState("");
  const [ver, setVer] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const init = async () => {
    try {
      setText(await gen());
      setVer((x) => x + 1);
    } finally {
      setInitialized(true);
    }
  };
  useEffect(() => {
    init().catch(console.error);
  }, []);

  switch (location.pathname) {
    case "/":
      return (
        <>
          <button type="button" disabled={!initialized} onClick={init}>
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

const Calc = () => {
  const [length, setLength] = useState(40);
  const [interval, setInterval] = useState("1:20");
  const pace = formatTime((parseTime(interval) / length) * 100);
  return (
    <>
      <label>
        Length (m):{" "}
        <input
          type="number"
          size={2}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
        />
      </label>
      <label>
        Interval (m:s):{" "}
        <input
          size={4}
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />
      </label>
      pace: {pace}
    </>
  );
};

const parseTime = (time: string) => {
  const [m, s] = time.split(":").map((x) => parseInt(x, 10));
  return m * 60 + s;
};
const formatTime = (s: number) => {
  const sec = s % 60;
  const m = Math.floor(s / 60);
  return m + ":" + sec.toString().padStart(2, "0");
};

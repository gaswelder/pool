import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { Theme } from "./theme";

const HeaderDiv = styled.div`
  padding: ${Theme.h} ${Theme.w};
  border: thin solid #d1dfec;
  cursor: pointer;
  border-radius: ${Theme.borderRadius};
  font-size: ${Theme.fontSize};
  transition: ${Theme.duration} background-color;
  background-color: white;
  &.open {
    background-color: #f1f0f2;
  }
`;

const ContentDiv = styled.div`
  background: #fafafa;
  padding: ${Theme.h} ${Theme.w};
  border: thin solid #d1dfec;
  margin-top: -1px;
  &.open {
    margin-bottom: ${Theme.h};
  }
`;

type P = {
  header: () => JSX.Element;
  content: () => JSX.Element;
};

export const Collapsible = ({ header, content }: P) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((x) => !x);
  return (
    <>
      <HeaderDiv className={open ? "open" : ""} onClick={toggle}>
        {header()}
      </HeaderDiv>
      {open && (
        <ContentDiv className={open ? "open" : ""}>{content()}</ContentDiv>
      )}
    </>
  );
};

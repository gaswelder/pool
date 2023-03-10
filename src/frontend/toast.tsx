import * as React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Theme } from "./theme";

const duration = 2000;

export const toast = (msg: string) => {
  const node = document.createElement("div");
  Object.assign(node.style, {
    position: "absolute",
    left: "50vw",
  });
  document.body.appendChild(node);
  ReactDOM.render(<Toaster msg={msg} />, node);
  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(node);
    node.remove();
  }, duration + 1000);
};

const Container = styled.div`
  position: fixed;
  bottom: 5vh;
  background-color: #eee;
  transition: ${Theme.duration} opacity;
  opacity: 0;
  &.open {
    opacity: 1;
  }
  padding: ${Theme.h} ${Theme.w};
  border-radius: ${Theme.borderRadius};
`;

const Toaster = ({ msg }: { msg: string }) => {
  const [className, setClassName] = React.useState("");
  React.useEffect(() => {
    setClassName("open");
    return clearTimeout(
      setTimeout(() => {
        setClassName("");
      }, duration)
    );
  }, []);
  return <Container className={className}>{msg}</Container>;
};

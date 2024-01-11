import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { Theme } from "../theme";

const duration = 2000;

export const toast = (msg: string) => {
  const node = document.createElement("div");
  Object.assign(node.style, {
    position: "absolute",
    left: "50vw",
  });
  document.body.appendChild(node);
  const root = createRoot(node);
  root.render(<Toaster msg={msg} />);
  setTimeout(() => {
    root.unmount();
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
  const [className, setClassName] = useState("");
  useEffect(() => {
    setClassName("open");
    return clearTimeout(
      setTimeout(() => {
        setClassName("");
      }, duration)
    );
  }, []);
  return <Container className={className}>{msg}</Container>;
};

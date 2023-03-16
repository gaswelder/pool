import { App } from "./App";
import { createRoot } from "react-dom/client";

const div = document.querySelector("#app");
if (!div) {
  throw new Error("div#app is missing");
}
createRoot(div).render(<App />);

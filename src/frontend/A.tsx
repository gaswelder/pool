import * as React from "react";

type P = {
  href: string;
  onClick?: () => void;
  [k: string]: unknown;
};

export const A = (props: P) => {
  return (
    <a
      {...props}
      onClick={(e) => {
        e.preventDefault();
        props.onClick?.();
        history.pushState(null, "", props.href);
        window.dispatchEvent(new Event("location-change"));
      }}
    />
  );
};

export const useLocation = () => {
  const [_, upd] = React.useState(0);
  const listener = React.useRef(() => {
    upd((x) => x + 1);
  }).current;
  React.useEffect(() => {
    window.addEventListener("location-change", listener);
    return () => removeEventListener("location-change", listener);
  }, []);
  return {
    location,
  };
};

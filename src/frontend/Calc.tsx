import { useState } from "react";

const parseTime = (time: string) => {
  const [m, s] = time.split(":").map((x) => parseInt(x, 10));
  return m * 60 + s;
};
const formatTime = (s: number) => {
  const sec = s % 60;
  const m = Math.floor(s / 60);
  return m + ":" + sec.toString().padStart(2, "0");
};

export const Calc = () => {
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

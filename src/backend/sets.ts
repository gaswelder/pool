import * as fs from "fs";
import { Line, parseLine } from "../parser/shorthand";

const superset = () => {
  const text = fs
    .readFileSync("/home/gas/code/priv/notes/plan-superset.md")
    .toString();
  const entries = [] as { tags: string[]; line: string }[];
  const lines = text.split("\n").map((s) => s.trim());

  for (;;) {
    let line = lines.shift();
    if (line === undefined) break;
    try {
      const p = parseLine(line);
    } catch (err) {
      continue;
    }
    let nl = 1;
    while (lines.length > 0 && lines[0] != "" && !lines[0].startsWith("[x]")) {
      if (nl++ == 1) {
        line += " // ";
      }
      line += " " + lines.shift();
    }
    const tags = [...line.matchAll(/\[(\w+)\]/g)].map((x) => x[1]);
    for (const tag of tags) {
      line = line.replace(`[${tag}]`, "");
    }
    entries.push({ line, tags });
  }
  return entries;
};

const formatSet = (lines: Line[]) =>
  lines.map(
    (line) =>
      `${line.repeats}x${line.amount} ${line.desc} ${line.tags
        .map((t) => "#" + t)
        .join(" ")}`
  );

const Wup = "warmup";
const Tech = "tech";
const Spr = "sprint";
const End = "endurance";
const Fast = "fastswim";
const Steady = "steadyswim";
const Rest = "rest";

const sets = () =>
  superset().map((entry) => {
    return {
      s: entry.line,
      k: entry.tags,
    };
  });

// smim-smooth template (4 days)
export const sst = () => {
  const sss = sets();
  const sel = (k: string) => sss.filter((x) => x.k.includes(k));
  return [
    `# Day 1\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      random("Extended Technique", 800, sel(Tech)),
      random("Sprint", 200, sel(Spr)),
      random("Rest", 200, sel(Rest)),
    ].join("\n"),

    `\n# Day 2\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      random("Technique", 400, sel(Tech)),
      random("Endurance", 1200, sel(End)),
    ].join("\n"),

    `\n# Day 3\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      random("Technique", 400, sel(Tech)),
      random("Fast Swim", 1000, sel(Fast)),
      random("Rest", 200, sel(Rest)),
    ].join("\n"),

    `\n# Day 4\n`,
    [random("Steady Swim", 1200, sel(Steady))].join("\n"),
  ].join("\n");
};

const random = (
  title: string,
  amount: number,
  sets: { s: string }[],
  scale?: number
) => {
  let total = 0;
  let r = "-- " + title;
  if (sets.length == 0) {
    return r;
  }
  let sanity = 10;
  while (total < amount && sanity-- > 0) {
    const x = sets[Math.round(Math.random() * (sets.length - 1))];
    const s = parseSet(x.s);
    if (scale) {
      s.forEach((line) => {
        if (line.repeats > 1) {
          line.repeats *= scale;
        } else {
          line.amount *= scale;
        }
      });
    }
    const len = s.map((line) => line.amount * line.repeats).reduce(sum);
    total += len;
    r += "\n" + formatSet(s);
  }
  return r;
};

const parseSet = (text: string) => {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line != "");
  return lines.map(parseLine);
};

const sum = (a: number, b: number) => a + b;

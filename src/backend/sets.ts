import * as fs from "fs";
import { Line, parseLine } from "../parser/shorthand";

type Item = ReturnType<typeof superset>[0];

const superset = () => {
  const text = fs
    .readFileSync("/home/gas/code/priv/notes/plan-superset.md")
    .toString();
  const lines = text.split("\n").map((s) => s.trim());

  // Scans to the next parsable line.
  const nextEx = () => {
    for (;;) {
      let line = lines.shift();
      if (line === undefined) {
        return null;
      }
      try {
        const p = parseLine(line);
        return { line, parsed: p };
      } catch (err) {
        continue;
      }
    }
  };

  const comments = () => {
    const cc = [] as string[];
    while (lines.length > 0 && lines[0] != "" && !lines[0].startsWith("[x]")) {
      cc.push(lines.shift()!);
    }
    return cc;
  };

  const nextOne = () => {
    const ex = nextEx();
    if (!ex) return null;

    let line = ex.line;

    // Extract tags from the line
    const tags = [...line.matchAll(/\[(\w+)\]/g)].map((x) => x[1]);
    for (const tag of tags) {
      line = line.replace(`[${tag}]`, "");
    }

    // Read comments if they follow
    const cc = comments();
    if (cc.length > 0) {
      line += " // " + cc.join(" ");
    }
    return { line, tags, parsed: ex.parsed };
  };

  type T = NonNullable<ReturnType<typeof nextOne>>;
  const entries = [] as T[];
  for (;;) {
    const ex = nextOne();
    if (!ex) break;
    entries.push(ex);
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

const kind = (line: string) => line.split(" ")[0];

export const sst = () => {
  const sss = superset();
  const sel = (tag: string) => sss.filter((item) => item.tags.includes(tag));
  const techset = (m: number) => {
    const items = sel(Tech);
    const types = [...new Set(items.map((x) => kind(x.parsed.desc)))];
    const type = types[Math.round(Math.random() * (types.length - 1))];
    return random(
      "Technique",
      m,
      items.filter((x) => kind(x.parsed.desc) == type)
    );
  };
  return [
    `# Day 1\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      techset(800),
      random("Sprint", 200, sel(Spr)),
      random("Rest", 200, sel(Rest)),
    ].join("\n"),

    `\n# Day 2\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      techset(400),
      random("Endurance", 1200, sel(End)),
    ].join("\n"),

    `\n# Day 3\n`,
    [
      random("Warmup", 200, sel(Wup), 0.5),
      techset(400),
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
  sets: Item[],
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
    const s = parseSet(x.line);
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

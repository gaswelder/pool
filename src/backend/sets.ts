import { Line, parseLine } from "../parser/shorthand";
import { Item, parseSuperset } from "./superset";

const Tags = {
  Wup: "warmup",
  Tech: "tech",
  Spr: "sprint",
  End: "endurance",
  Fast: "fastswim",
  Steady: "steadyswim",
  Rest: "rest",
};

const formatSet = (lines: Line[]) =>
  lines.map(
    (line) =>
      `${line.repeats}x${line.amount} ${line.desc} ${line.tags
        .map((t) => "#" + t)
        .join(" ")}`
  );

const kind = (line: string) => line.split(" ")[0];

export const sst = () => {
  const entries = parseSuperset();
  entries.forEach((e) => {
    const unknownTags = e.tags.filter((x) => !Object.values(Tags).includes(x));
    if (unknownTags.length > 0) {
      console.warn("unknown tags: " + unknownTags);
    }
    e.parsed.desc += " // " + e.comments.join(" ");
  });
  const sel = (tag: string) =>
    entries.filter((item) => item.tags.includes(tag));
  const techset = (m: number) => {
    const items = sel(Tags.Tech);
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
      random("Warmup", 200, sel(Tags.Wup), 0.5),
      techset(800),
      random("Sprint", 200, sel(Tags.Spr)),
      random("Rest", 200, sel(Tags.Rest)),
    ].join("\n"),

    `\n# Day 2\n`,
    [
      random("Warmup", 200, sel(Tags.Wup), 0.5),
      techset(400),
      random("Endurance", 1200, sel(Tags.End)),
    ].join("\n"),

    `\n# Day 3\n`,
    [
      random("Warmup", 200, sel(Tags.Wup), 0.5),
      techset(400),
      random("Fast Swim", 1000, sel(Tags.Fast)),
      random("Rest", 200, sel(Tags.Rest)),
    ].join("\n"),

    `\n# Day 4\n`,
    [random("Steady Swim", 1200, sel(Tags.Steady))].join("\n"),
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

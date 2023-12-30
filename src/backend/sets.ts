import * as fs from "fs";
import { Line, parseLine } from "../parser/shorthand";
import { truthy } from "../ts";

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

const sets = superset().map((entry) => {
  return {
    s: entry.line,
    k: entry.tags,
  };
});

const sets0 = [
  { s: `100 cr #time`, k: [Rest, Fast] },
  // 200 back
  { s: `200 back #time`, k: [Rest] },
  {
    s: `200 back kick on back, arms folded into square behind the head, rotate. This makes rotation more difficult to control, forces the hip to move first.`,
    k: [Tech, Rest],
  },
  {
    s: `200 back kick on a side, one arm extended, shoulder up. 6 kicks, then 3 full strokes with rotation, then repeat on the other side.`,
    k: [Tech, Rest, Wup],
  },

  // 200 br
  { s: `200 br #time`, k: [Wup, Fast, Steady, Rest] },
  { s: `200 br 3 normal strokes, 3 strokes under water.`, k: [Tech, End] },
  {
    s: `200 br kick with the hands behind the back, touch the heels.`,
    k: [Tech, Wup],
  },
  { s: `200 br kick on back with kickboard on the knees`, k: [Tech, Wup] },
  { s: `200 br kick with arms in streamline`, k: [Tech] },
  {
    s: `200 br pull with a dolphin kick. Pull at a high rate to adjust the pull range and rate balance.`,
    k: [Tech, Spr],
  },
  { s: `200 br pull with a flutter kick`, k: [Tech, Wup] },
  {
    s: `200 br pull with flutter kick with the head up. Remember to shrug.`,
    k: [Tech, Spr],
  },
  { s: `200 br streamline kick, two left, two right.`, k: [Tech] },
  { s: `200 br tennis ball under the chin.`, k: [Tech] },

  // 200 cr
  { s: `200 cr #time`, k: [Rest, Fast] },
  {
    s: `200 cr fingertip drag and wrist drag. Encourages high elbow, relaxes the hand.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr doggy-paddle. remember not to let the hand look to the side when bending the elbow.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr front sculling with high static elbows. Use as warmup, or train until the burning sensation in the forearms and the deltoid muscle. Try without the buoy. Try with small paddles.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr single-arm, one arm down, but switch arms every 1, 2 or 3 strokes.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr 1-2-3 / waltz: sync each arm stroke to every 3rd kick.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr hinge drill: position 11, hinge one forearm into catch position and back several times, then do a strong pull. see if hinging as (elbow +=90; shoulder += 45) is any good. should look like near-surface elbow catch.`,
    k: [Wup, Tech],
  },
  {
    s: `200 cr kick with a kickboard. Hands on top, near streamline, look forward, repeat until the hips fatigue. Kick with passion, give it some power. Point the toes, clever feet.`,
    k: [Wup, Tech, Spr],
  },
  {
    s: `200 dol kick with a kickboard, head up. Start easy and pick up. Give it some oomph, kick with the whole body except for the head and the arms. Point the toes`,
    k: [Tech],
  },
  { s: `200 IM #time`, k: [Fast] },
  // 400 back
  { s: `400 back #time`, k: [Fast, End, Rest] },
  // 400 br
  { s: `400 br #time`, k: [Steady, End] },
  {
    s: `400 br kick with a kickboard. Remember about heels to butt, narrow knees and power.`,
    k: [Tech, End],
  },
  // 400 cr
  { s: `400 cr #time`, k: [Steady, End, Rest] },
  {
    s: `400 cr breathe (3 to 9 to 3) or (3-9 3-9). Try 100 meters at a time. There is more air in lungs than it seems. Try holding breath until the last stroke or two so you don't lose your air too early.`,
    k: [End],
  },
  {
    s: `400 cr progression: breathe right away on the pushoff, breathe after one pull after the turn, breathe after two pulls after the next turn and so on as far as possible.`,
    k: [End],
  },
  // 400 im
  { s: `400 IM #time`, k: [Fast] },

  // 600 cr
  { s: `600 cr #time`, k: [Steady, End] },
  { s: `600 cr CSS test on the watch.`, k: [Fast] },

  //
  { s: `800 br #time`, k: [Steady, End] },
  { s: `800 cr #time`, k: [Steady, End] },
  //
  {
    s: `2x400 cr as 300 at aerobic pace, 5 seconds + 100 max`,
    k: [Fast, End],
  },
  {
    s: `4x80 br as 20 easy, 20 max, 40 steady. try to get the max speed`,
    k: [Spr],
  },
  {
    s: `4x100 cr breathe 5th. Try hold+strong exhale, that might help.`,
    k: [End],
  },
  {
    s: `5x15 Push off, 2 race strokes, flip, race to the wall; optionally no breath.`,
    k: [Spr],
  },
  {
    s: `10x30 15 m sprint, flip, underwater dolphin back. Fins, no breathing`,
    k: [Spr, Tech],
  },
  {
    s: `10x40 cr no breath easy/fast. Add more purpose and tightness, then it's more fun. Try to get past the wall. If can't, then compare counts before/after the wall.`,
    k: [End],
  },
  { s: `20x40 cr on 1:20`, k: [Fast] },

  //
  { s: `30 min cr no stop, note the distance, plot the lengths.`, k: [End] },
];

// smim-smooth template (4 days)
export const sst = () => {
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
const sel = (k: string) => sets.filter((x) => x.k.includes(k));

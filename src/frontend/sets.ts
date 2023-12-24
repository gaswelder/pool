import { parseSet } from "../parser/shorthand";

let iota = 1;
const Wup = iota++;
const Tech = iota++;
const Spr = iota++;
const End = iota++;
const Fast = iota++;
const Steady = iota++;
const Rest = iota++;

const sets = [
  {
    s: `200 cr fingertip drag and wrist drag. Encourages high elbow, relaxes the hand.`,
    k: [Wup, Tech],
  },
  {
    s: `200 dol kick with a kickboard, head up. Start easy and pick up. Give it some oomph, kick with the whole body except for the head and the arms. Point the toes`,
    k: [Tech],
  },
  {
    s: `400 IM`,
    k: [Fast],
  },
  { s: `20x40 cr on 1:20`, k: [Fast] },
  {
    s: `10x30 15 m sprint, flip, underwater dolphin back. Fins, no breathing`,
    k: [Spr, Tech],
  },
  {
    s: `400 cr breathe (3 to 9 to 3) or (3-5-7-9-3-5-7-9). Try 100 meters at a time. There is more air in lungs than it seems. Try holding your breath until the last stroke or two so you don't lose your air too early.`,
    k: [End],
  },
  {
    s: `400 cr progression: breathe right away on the pushoff, breathe after one pull after the turn, breathe after two pulls after the next turn and so on as far as possible.`,
    k: [End],
  },
  {
    s: `800 br #time`,
    k: [Steady],
  },
  { s: `200 back`, k: [Rest] },
  { s: `200 cr`, k: [Rest] },
];

// smim-smooth template (4 days)
export const sst = () => {
  return [
    {
      name: "day 1",
      sets: [warmup(), technique(2), sprint(), rest()].join("\n"),
    },
    { name: "day 2", sets: [warmup(), technique(1), endurance()].join("\n") },
    {
      name: "day 3",
      sets: [warmup(), technique(1), fastSwim(), rest()].join("\n"),
    },
    { name: "day 4", sets: [steadySwim()].join("\n") },
  ];
};

const random = (title: string, m: number, sets: { s: string }[]) => {
  let total = 0;
  let r = "-- " + title;
  if (sets.length == 0) {
    return r;
  }
  let sanity = 10;
  while (total < m && sanity-- > 0) {
    const x = sets[Math.round(Math.random() * (sets.length - 1))];
    const s = parseSet(x.s);
    const len = s.lines.map((line) => line.amount * line.repeats).reduce(sum);
    total += len;
    r += "\n" + x.s;
  }
  return r;
};
const sum = (a: number, b: number) => a + b;
const sel = (k: number) => sets.filter((x) => x.k.includes(k));
const range = (x: number) =>
  Array(x)
    .fill(0)
    .map((_, i) => i);

const warmup = () => random("warmup", 200, sel(Wup)); // random 200 from warmups
const technique = (multiplier: number) => {
  const techniques = sel(Tech);
  return range(multiplier)
    .flatMap((i) => random("technique", 400, techniques))
    .join("\n");
};
const sprint = () => random("sprint", 200, sel(Spr));
const rest = () => random("rest", 200, sel(Rest));
const endurance = () => random("endurance", 1200, sel(End));
const fastSwim = () => random("fast swim", 1000, sel(Fast));
const steadySwim = () => random("steady swim", 1200, sel(Steady));

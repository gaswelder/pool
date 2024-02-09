import { Item, parseSuperset } from "./superset";

const Categories = {
  Wup: "warmup",
  Tech: "tech",
  Spr: "sprint",
  End: "endurance",
  Fast: "fastswim",
  Steady: "steadyswim",
  Rest: "rest",
};

export const sst = () => {
  const entries = parseSuperset();

  const byCategory = new Map([["", [] as Item[]]]);
  const sel = (tag: string) => byCategory.get(tag) || [];

  entries.forEach((e) => {
    const unknownCats = e.categories.filter(
      (x) => !Object.values(Categories).includes(x)
    );
    if (unknownCats.length > 0) {
      console.warn("unknown tags: " + unknownCats);
    }

    byCategory.get("")!.push(e);
    e.categories.forEach((cat) => {
      const list = byCategory.get(cat);
      if (list) list.push(e);
      else byCategory.set(cat, [e]);
    });
  });

  const warmup = () => ["-- Warmup", ...random(200, sel(Categories.Wup), 0.5)];
  const sprint = () => ["-- Sprint", ...random(200, sel(Categories.Spr))];
  const rest = () => ["-- Rest", ...random(200, sel(Categories.Rest))];
  const endurance = () => [
    "-- Endurance",
    ...random(1200, sel(Categories.End)),
  ];
  const fast = () => ["-- Fast Swim", ...random(1000, sel(Categories.Fast))];
  const steady = () => [
    "-- Steady Swim",
    ...random(1200, sel(Categories.Steady)),
  ];
  const tech = (m: number) => {
    const items = sel(Categories.Tech);
    const types = [...new Set(items.map((x) => kind(x.parsed.desc)))];
    const type = types[Math.round(Math.random() * (types.length - 1))];
    return [
      "-- Technique",
      ...random(
        m,
        items.filter((x) => kind(x.parsed.desc) == type)
      ),
    ];
  };
  return [
    [`# Day 1`],
    warmup(),
    tech(800),
    sprint(),
    rest(),
    [""],
    [`# Day 2`],
    warmup(),
    tech(400),
    endurance(),
    [""],
    [`# Day 3`],
    warmup(),
    tech(400),
    fast(),
    rest(),
    [""],
    [`# Day 4`],
    steady(),
  ]
    .flat()
    .join("\n");
};

const kind = (line: string) => line.split(" ")[0];

const random = (amount: number, sets: Item[], scale?: number) => {
  if (sets.length == 0) return [];
  let total = 0;
  const r = [] as string[];
  let sanity = 10;
  while (total < amount && sanity-- > 0) {
    const item = scaleItem(
      sets[Math.round(Math.random() * (sets.length - 1))],
      scale || 1
    );
    const p = item.parsed;
    total += p.amount * p.repeats;
    r.push(formatItem(item));
  }
  return r;
};

const formatItem = (item: Item) => {
  const p = item.parsed;
  let line = "";
  if (p.repeats > 1) {
    line += `${p.repeats}x`;
  }
  line += `${p.amount} ${p.desc}`;
  if (p.tags.length > 0) {
    line += " " + p.tags.map((t) => "#" + t).join(", ");
  }
  if (item.comments.length > 0) {
    line += " // " + item.comments.join(" ");
  }
  return line;
};

const scaleItem = (item: Item, scale: number) => {
  if (scale == 1) return item;
  if (item.parsed.repeats > 1) {
    return {
      ...item,
      parsed: {
        ...item.parsed,
        repeats: item.parsed.repeats * scale,
      },
    };
  }
  return {
    ...item,
    parsed: {
      ...item.parsed,
      amount: item.parsed.amount * scale,
    },
  };
};

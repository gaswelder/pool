import { Item, parseSuperset } from "./superset";

const Categories = {
  Tech: "tech",
  Spr: "sprint",
  End: "endurance",
  Fast: "fastswim",
  Steady: "steadyswim",
};

export const sst = () => {
  const entries = parseSuperset();

  const byCategory = new Map([["", [] as Item[]]]);
  const sel = (tag: string) => byCategory.get(tag) || [];

  entries.forEach((e) => {
    byCategory.get("")!.push(e);
    e.categories.forEach((cat) => {
      const list = byCategory.get(cat);
      if (list) list.push(e);
      else byCategory.set(cat, [e]);
    });
  });

  const warmup = () => ["200 warmup"];
  const sprint = () => ["-- Sprint", ...random(200, sel(Categories.Spr))];
  const rest = () => ["200 rest"];
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

  const groupBy = <T>(xs: T[], key: (x: T) => string) => {
    return xs.reduce((s, item) => {
      const k = key(item);
      return { ...s, [k]: [...(s[k] || []), item] };
    }, {} as Record<string, T[]>);
  };

  const rand = (m: number) => {
    const items = random0(m, entries);
    const grouped = groupBy(items, (x) => pickOne(x.categories));
    return Object.entries(grouped)
      .map(([category, items]) => {
        const itemGroups = groupBy(items, (x) => kind(x.parsed.desc));
        const ordered = Object.values(itemGroups).flat();
        return ["-- " + category, ...ordered.map(formatItem)];
      })
      .flat();
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
    ["# Random"],
    warmup(),
    rand(1600),
    rest(),
  ]
    .flat()
    .join("\n");
};

const kind = (line: string) => line.split(" ")[0];

const pickOne = <T>(xs: T[]) => {
  return xs[Math.round(Math.random() * (xs.length - 1))];
};

const random0 = (amount: number, sets: Item[]) => {
  if (sets.length == 0) return [];
  let total = 0;
  const r = [] as Item[];
  let sanity = 10;
  while (total < amount && sanity-- > 0) {
    const item = pickOne(sets);
    const p = item.parsed;
    total += p.amount * p.repeats;
    r.push(item);
  }
  return r;
};

const random = (amount: number, sets: Item[]) => {
  return random0(amount, sets).map(formatItem);
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

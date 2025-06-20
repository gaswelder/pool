import { groupBy } from "./lib";
import { Item, parseSuperset } from "./superset";

export const sst = (path: string) => {
  const gen = makeGen(parseSuperset(path));
  return [
    {
      title: "Day 1",
      sets: [gen.warmup(), gen.tech(800), gen.sprint(), gen.rest()],
    },
    {
      title: "Day 2",
      sets: [gen.warmup(), gen.tech(400), gen.endurance()],
    },
    {
      title: "Day 3",
      sets: [gen.warmup(), gen.tech(400), gen.fast(), gen.rest()],
    },
    {
      title: "Day 4",
      sets: [gen.steady()],
    },
    {
      title: "Random",
      sets: [gen.warmup(), ...gen.rand(1600), gen.rest()],
    },
  ];
};

const makeGen = (entries: Item[]) => {
  const Categories = {
    Tech: "tech",
    Spr: "sprint",
    End: "endurance",
    Fast: "fastswim",
    Steady: "steadyswim",
  };
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

  const makeItem = (amount: number, desc: string) => {
    return {
      comments: [],
      history: [],
      categories: [],
      parsed: {
        repeats: 1,
        amount,
        desc,
        tags: [],
      },
      line: `${amount} ${desc}`,
      kind: desc.split(" ")[0],
    };
  };

  const warmup = () => ({
    title: "",
    elements: [makeItem(200, "warmup")],
  });
  const rest = () => ({
    title: "",
    elements: [makeItem(200, "rest")],
  });

  const sprint = () => ({
    title: "Sprint",
    elements: getRandomSets(200, sel(Categories.Spr)),
  });

  const endurance = () => ({
    title: "Endurance",
    elements: getRandomSets(1200, sel(Categories.End)),
  });

  const fast = () => ({
    title: "Fast Swim",
    elements: getRandomSets(1000, sel(Categories.Fast)),
  });

  const steady = () => ({
    title: "Steady Swim",
    elements: getRandomSets(1200, sel(Categories.Steady)),
  });

  const tech = (m: number) => {
    const items = sel(Categories.Tech);
    const types = [...new Set(items.map((x) => kind(x.parsed.desc)))];
    const type = types[Math.round(Math.random() * (types.length - 1))];
    return {
      title: "Technique",
      elements: getRandomSets(
        m,
        items.filter((x) => kind(x.parsed.desc) == type)
      ),
    };
  };

  const rand = (m: number) => {
    const items = getRandomSets(m, entries);
    const grouped = groupBy(items, (x) => pickOne(x.categories));
    return Object.entries(grouped)
      .map(([category, items]) => {
        const itemGroups = groupBy(items, (x) => kind(x.parsed.desc));
        const ordered = Object.values(itemGroups).flat();
        return { title: category, elements: ordered };
      })
      .flat();
  };
  return {
    warmup,
    tech,
    sprint,
    rest,
    endurance,
    fast,
    steady,
    rand,
  };
};

const kind = (line: string) => line.split(" ")[0];

const pickOne = <T>(xs: T[]) => {
  return xs[Math.round(Math.random() * (xs.length - 1))];
};

const getRandomSets = (amount: number, sets: Item[]) => {
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

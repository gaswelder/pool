import { Item } from "./src/backend/superset";

const hasTime = (x: Item) => x.parsed.tags.includes("time");
const isYellow = (x: Item) =>
  x.categories.includes("yellow") || x.kind == "im" || x.kind == "dol";
const isRed = (x: Item) => x.categories.includes("red");
const isSlow = (x: Item) =>
  x.kind == "uw" || x.parsed.desc.startsWith("dol kick");
const isRest = (x: Item) => x.categories.includes("rest");

export const compose1 = () => {
  const ok = [] as Item[];
  const total = () =>
    ok.reduce((s, x) => s + x.parsed.repeats * x.parsed.amount, 0);

  // Define a simplistic constraints system.
  const constraints = [
    {
      name: "Don't start with a red",
      f: (x: Item) => ok.length == 0 && isRed(x),
    },
    {
      name: "Don't start with rest",
      f: (x: Item) => ok.length == 0 && isRest(x),
    },
    {
      name: "Don't have more than one red in a set",
      f: (x: Item) => isRed(x) && ok.filter(isRed).length >= 1,
    },
    {
      name: "Don't follow yellow with a red",
      f: (x: Item) => ok.length > 0 && isYellow(ok[ok.length - 1]) && isRed(x),
    },
    {
      name: "Don't do more than 2 yellows",
      f: (x: Item) => isYellow(x) && ok.filter(isYellow).length >= 2,
    },
    {
      name: "Don't rest too early",
      f: (x: Item) => isRest(x) && total() < 1000,
    },
    {
      name: "Don't #time too early",
      f: (x: Item) => hasTime(x) && total() < 1000,
    },
  ];
  return {
    rejects(x: Item) {
      const f = constraints.find((c) => c.f(x));
      if (f) return f;
      ok.push(x);
      return null;
    },
  };
};

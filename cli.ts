import { groupBy } from "./src/backend/lib";
import { sst } from "./src/backend/sets";
import { Item, parseSuperset } from "./src/backend/superset";

const tab = "  ";

const format = (el: Item) => {
  console.log(el.line);
  el.comments.forEach((x) => {
    console.log(x);
  });
  el.history.forEach((x) => {
    console.log(x);
  });
  console.log("");
};

const gensst = () => {
  const days = sst();

  for (const day of days) {
    console.log(day.title);
    for (const set of day.sets) {
      console.log(tab, set.title);
      for (const el of set.elements) {
        format(el);
      }
    }
    console.log("\n");
  }
};

const cmds = [
  {
    name: "themes",
    f: () => {
      const g = groupBy(parseSuperset(), (x) => x.kind);
      Object.entries(g).map(([k, v]) => {
        console.log(k, v.length);
      });
    },
    desc: "prints themes and the number of exercises for each",
  },
  {
    name: "gen",
    f: gensst,
    desc: "generates a random set",
  },
  {
    name: "top",
    desc: "prints rusty exercises, accepts themes as arguments",
    f: (args: string[]) => {
      const ss = parseSuperset()
        .filter((x) => {
          if (args.length == 0) return true;
          return args.includes(x.kind);
        })
        .filter((x) => {
          if (x.categories.includes("50")) return false;
          return true;
        });
      const lastTime = (x: Item) => {
        if (x.history.length == 0) return "2000-00-00";
        const m = x.history[x.history.length - 1].match(
          /(\d\d\d\d\-\d\d\-\d\d)/
        );
        if (!m) return "2000-00-00";
        return m[1];
      };
      ss.sort((a, b) => {
        return lastTime(a).localeCompare(lastTime(b));
      });
      ss.slice(0, 10).forEach((x) => {
        format(x);
      });
    },
  },
];

const cmd = cmds.find((x) => x.name == process.argv[2]);
if (cmd) {
  cmd.f(process.argv.slice(3));
} else {
  console.log("available commands:");
  cmds.forEach((cmd) => {
    console.log(cmd.name, "-", cmd.desc);
  });
}

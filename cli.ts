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

/**
 * Returns item's last time as a timestamp.
 */
const lastTime = (x: Item) => {
  const ts = (s: string) => new Date(s).getTime();
  const n = x.history.length;
  if (n == 0) {
    return ts("2000-01-01");
  }
  const m = x.history[n - 1].match(/(\d\d\d\d\-\d\d\-\d\d)/);
  if (!m) {
    return ts("2000-01-01");
  }
  return ts(m[1]);
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
      const include = [] as string[];
      const exclude = [] as string[];
      for (const arg of args) {
        if (arg[0] == "-") {
          exclude.push(arg.substring(1, arg.length));
        } else {
          include.push(arg);
        }
      }

      const now = Date.now();

      parseSuperset()
        // Select exercises that match the filter.
        .filter((x) => {
          if (include.length > 0 && !include.includes(x.kind)) return false;
          if (exclude.length > 0 && exclude.includes(x.kind)) return false;
          return true;
        })
        .filter((x) => {
          if (x.categories.includes("50")) return false;
          return true;
        })
        // Add priority to each match based on how long ago it was
        // logged last time.
        .map((s) => {
          let gap = now - lastTime(s);
          // Exercises marked as r=2 will be scheduled twice as often.
          // This would work for an arbitrary factor, not just 2, but only 2
          // was needed so far.
          if (s.categories.includes("r=2")) {
            gap *= 2;
          }
          return { s, gap };
        })
        // Sort by the calculated priority.
        .sort((a, b) => {
          if (a.gap != b.gap) return b.gap - a.gap;
          return Math.random() - 0.5;
        })
        .slice(0, 10)
        .forEach((x) => {
          format(x.s);
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

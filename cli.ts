import { parseArgs } from "./clilib";
import { groupBy } from "./src/backend/lib";
import { sst } from "./src/backend/sets";
import { Item, parseSuperset } from "./src/backend/superset";

const tab = "  ";

const formatText = (s: string, indent: string) => {
  const words = s.split(/\s+/g);

  const lines = [] as string[];
  while (words.length > 0) {
    let line = "";
    if (lines.length > 0) {
      line += indent;
    }
    while (words.length > 0 && line.length + 1 + words[0].length <= 80) {
      line += words.shift() + " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
};

const format = (el: Item) => {
  console.log("* " + formatText(el.line, "  "));
  el.comments.forEach((x) => {
    console.log(formatText(x, ""));
  });
  el.history.forEach((x) => {
    console.log("  " + formatText(x, "      "));
  });
  console.log("\n");
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

// Toy randomizer, has to produce the same sequence for our purposes.
const lcg = () => {
  let val = 0;
  const m = 567567;
  const a = 123123;
  const mod = 2 ** 16;
  val = (((val * m) % mod) + a) % mod;
  return () => {
    val = (((val * m) % mod) + a) % mod;
    return val;
  };
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
    name: "ls",
    desc: "prints all exercises",
    f: () => {
      parseSuperset()
        .sort((a, b) => a.kind.localeCompare(b.kind))
        .forEach((s) => {
          console.log(s.line);
        });
    },
  },
  {
    name: "themes",
    f: () => {
      const g = groupBy(parseSuperset(), (x) => x.kind);
      Object.entries(g)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([k, v]) => {
          console.log(v.length + "\t" + k);
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
      // top [-e kind,kind,...] [-n count] [kind ...]
      const [params, include] = parseArgs({ e: true, n: true }, args);

      const exclude = params.e.split(",");
      let n = 10;
      if (params.n != "") {
        n = parseInt(params.n, 10);
      }

      const now = Date.now();
      const rnd = lcg();

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
          if (a.gap != b.gap) {
            return b.gap - a.gap;
          }
          // If most exercises have empty history the command would just return
          // them in the list order. To prevent that we shuffle them.
          return rnd() - rnd();
        })
        .slice(0, n)
        .sort((a, b) => a.s.kind.localeCompare(b.s.kind))
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

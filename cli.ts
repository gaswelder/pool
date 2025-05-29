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

const format = (el: Item, i: number) => {
  console.log(`${i + 1}. ` + formatText(el.line, "  "));
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
        format(el, 0);
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

const priority = (x: Item) => {
  let p = Date.now() - lastTime(x);
  // Exercises marked as r=2 will be scheduled twice as often.
  // This would work for an arbitrary factor, not just 2, but only 2
  // was needed so far.
  if (x.categories.includes("r=2")) {
    p *= 2;
  }
  return p;
};

const order = (xs: Item[], rnd: () => number) => {
  return xs
    .map((s) => {
      return { s, gap: priority(s) };
    })
    .sort((a, b) => {
      if (a.gap != b.gap) {
        return b.gap - a.gap;
      }
      // If most exercises have empty history, the command would just return
      // them in the list order. Shuffle to prevent that.
      return rnd() - rnd();
    })
    .map((x) => x.s);
};

const roundRobin = <T>(groups: T[][]) => {
  const r = [] as T[];
  const pos = groups.map((g) => 0);

  for (;;) {
    let ok = false;
    groups.forEach((g, i) => {
      if (pos[i] < g.length) {
        ok = true;
        r.push(g[pos[i]]);
        pos[i]++;
      }
    });
    if (!ok) break;
  }
  return r;
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
      const nkinds = 2;
      if (params.n != "") {
        n = parseInt(params.n, 10);
      }

      const rnd = lcg();

      // Select exercises that match the filter.
      const exers = parseSuperset().filter((x) => {
        if (include.length > 0 && !include.includes(x.kind)) return false;
        if (exclude.length > 0 && exclude.includes(x.kind)) return false;
        if (x.categories.includes("50")) return false;
        if (x.categories.includes("meh")) return false;
        return true;
      });

      // Group by kind, add staleness to each group
      // and get the `nkinds` top stale groups.
      const groups = Object.entries(groupBy(exers, (x) => x.kind))
        .map((e) => {
          const items = order(e[1], rnd);
          return {
            group: e[0],
            lastTime: Math.max(...items.map(lastTime)),
            items,
          };
        })
        .sort((a, b) => a.lastTime - b.lastTime)
        .slice(0, nkinds);

      // We want `n` exercises from `nkinds` groups, but the groups will
      // have uneven sizes. Getting n/nkinds from each is too rough, so we'll
      // do a round robin.
      const top = roundRobin(groups.map((x) => x.items)).slice(0, n);

      top.forEach(format);
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

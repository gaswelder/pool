import { parseArgs } from "./clilib";
import { compose1 } from "./compose";
import { groupBy } from "./src/backend/lib";
import { Item, parseSuperset } from "./src/backend/superset";

const sspath = process.env.SSPATH;
if (!sspath) {
  throw new Error("pass SSPATH env var");
}

const ss = () =>
  parseSuperset(sspath).filter((x) => {
    if (x.categories.includes("50")) return false;
    if (x.categories.includes("meh")) return false;
    return true;
  });

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

const priority = (x: Item) => {
  let p = Date.now() - x.lastTime();
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
      // When exercises have empty history, ordering by gap would be a noop,
      // so we also add a random score.
      return { s, gap: priority(s), score: rnd() };
    })
    .sort((a, b) => {
      if (a.gap != b.gap) {
        return b.gap - a.gap;
      }
      return a.score - b.score;
    })
    .map((x) => x.s);
};

const cmds = [
  {
    name: "ls",
    desc: "prints all exercises",
    f: () => {
      ss()
        .sort((a, b) => a.kind.localeCompare(b.kind))
        .forEach((s) => {
          console.log(s.line);
        });
    },
  },
  {
    name: "themes",
    desc: "prints themes and the number of exercises for each",
    f: () => {
      const g = groupBy(ss(), (x) => x.kind);
      const themes = Object.entries(g)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([k, v]) => {
          const executions = v.flatMap((x) => x.history);
          const last = v
            .flatMap((x) => x.lastTime())
            .sort((a, b) => a - b)
            .reverse()[0];
          return {
            name: k,
            size: v.length,
            executions: executions.length,
            lastTime: new Date(last).toISOString().substring(0, 10),
          };
        });
      themes.sort((b, a) => a.lastTime.localeCompare(b.lastTime));
      for (const t of themes) {
        console.log(
          `${t.name}\t${t.lastTime} last, ${t.size} in list, ${t.executions} executions`
        );
      }
    },
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

      const rnd = lcg();

      // Select exercises that match the filter.
      const exers = ss().filter((x) => {
        if (include.length > 0 && !include.includes(x.kind)) return false;
        if (exclude.length > 0 && exclude.includes(x.kind)) return false;
        return true;
      });

      // Group by kind, add staleness to each group.
      const allGroups = Object.entries(groupBy(exers, (x) => x.kind))
        .map((e) => {
          const items = order(e[1], rnd);
          return {
            group: e[0],
            lastTime: Math.max(...items.map((x) => x.lastTime())),
            items,
          };
        })
        .sort((a, b) => a.lastTime - b.lastTime);

      // Select main groups to choose from.
      // The other groups will be backup.
      const nkinds = 2;
      const mainGroups = allGroups.slice(0, nkinds);
      const otherGroups = allGroups.slice(nkinds, allGroups.length);

      const ok = [] as Item[];
      const aside = [] as Item[];
      const filtered = new Map<string, number>();
      const bob = compose1();
      const feed = (items: Item[]) => {
        for (const x of items) {
          if (ok.length >= n) {
            break;
          }
          const fail = bob.rejects(x);
          if (fail) {
            filtered.set(fail.name, (filtered.get(fail.name) || 0) + 1);
            // console.log("// " + x.line + " -- " + fail.name);
            aside.push(x);
            continue;
          }
          ok.push(x);
        }
      };

      feed(roundRobin(mainGroups.map((x) => x.items)));
      feed([...aside]);
      feed(roundRobin(otherGroups.map((x) => x.items)));
      let total = 0;

      ok.forEach((el) => {
        printItem(el);
        total += el.parsed.repeats * el.parsed.amount;
        console.log("\n// " + total);
        console.log("\n");
      });

      console.log(filtered);
    },
  },
];

const printItem = (el: Item) => {
  const line = "-".repeat(80);
  console.log(line + "\n" + el.line + "\n" + line);
  el.comments.forEach((x) => {
    console.log(formatText(x, ""));
  });
  console.log("");
  el.history.forEach((x) => {
    console.log(formatText(x, "\t    "));
  });
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

const cmd = cmds.find((x) => x.name == process.argv[2]);
if (cmd) {
  cmd.f(process.argv.slice(3));
} else {
  console.log("available commands:");
  cmds.forEach((cmd) => {
    console.log(cmd.name, "-", cmd.desc);
  });
}

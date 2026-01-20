import { parseArgs } from "./clilib";
import { groupBy } from "./src/backend/lib";
import { order } from "./src/backend/sched";
import { Item, parseSuperset } from "./src/backend/superset";

const sspath = process.env.SSPATH;
if (!sspath) {
  throw new Error("pass SSPATH env var");
}

const ss = () =>
  parseSuperset(sspath).filter((x) => {
    if (x.tags.includes("50")) return false;
    if (x.tags.includes("meh")) return false;
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

const kind = (x: Item) => x.desc.split(" ")[0];

const cmds = [
  {
    name: "ls",
    desc: "prints all exercises",
    f: () => {
      ss()
        .sort((a, b) => kind(a).localeCompare(kind(b)))
        .forEach(printItem);
    },
  },
  {
    name: "themes",
    desc: "prints themes and the number of exercises for each",
    f: () => {
      const g = groupBy(ss(), kind);
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

      // Select exercises that match the filter.
      const exers = ss().filter((x) => {
        if (include.length > 0 && !include.includes(kind(x))) return false;
        if (exclude.length > 0 && exclude.includes(kind(x))) return false;
        return true;
      });

      order(exers)
        .slice(0, n)
        .sort(
          by((x) => {
            if (x.tags.includes("drill")) {
              return "drill+" + kind(x);
            }
            return "swim+" + kind(x);
          })
        )
        .forEach(printItem);
    },
  },
];

const by = <T>(key: (x: T) => string) => (a: T, b: T) =>
  key(a).localeCompare(key(b));

const printItem = (el: Item) => {
  const line = "-".repeat(80);
  // console.log(line);
  console.log(el.quantity + "\t" + el.desc);
  // console.log(line);
  el.comments.forEach((x) => {
    console.log(formatText(x, ""));
  });
  if (el.comments.length > 0) {
    console.log("");
  }
  el.history.forEach((x) => {
    console.log("  " + formatText(x, "\t    "));
  });
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

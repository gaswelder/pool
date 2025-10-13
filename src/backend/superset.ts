import * as fs from "fs";
import { parseLine } from "../parser/shorthand";

export type Item = ReturnType<typeof parseSuperset>[0];

/**
 * Reads and parses the superset file.
 */
export const parseSuperset = (path: string) => {
  const text = fs.readFileSync(path).toString();
  const lines = text.split("\n").map((s) => s.trim());

  const nextEx = () => {
    for (;;) {
      let line = lines.shift();
      if (line === undefined) {
        return null;
      }
      try {
        const p = parseLine(line);
        // Extract tags from the line
        const categories = [...p.desc.matchAll(/\[([\w=]+)\]/g)].map(
          (x) => x[1]
        );
        for (const x of categories) {
          p.desc = p.desc.replace(`[${x}]`, "");
        }
        return { line, parsed: p, categories, kind: p.desc.split(" ")[0] };
      } catch (err) {
        continue;
      }
    }
  };

  const nextEntry = () => {
    const ex = nextEx();
    if (!ex) return null;
    // comments
    const comments = [] as string[];
    while (lines.length > 0 && lines[0] != "" && !lines[0].startsWith("[x]")) {
      comments.push(lines.shift()!);
    }
    // history
    const history = [] as string[];
    while (lines.length > 0 && lines[0].startsWith("[x")) {
      history.push(lines.shift()!);
    }
    return {
      comments,
      history,
      categories: ex.categories,
      parsed: ex.parsed,
      line: ex.line,
      kind: ex.kind,
      /**
       * Returns the item's last time as a timestamp.
       */
      lastTime() {
        const ts = (s: string) => new Date(s).getTime();
        const n = history.length;
        if (n == 0) {
          return ts("2000-01-01");
        }
        const m = history[n - 1].match(/(\d\d\d\d\-\d\d\-\d\d)/);
        if (!m) {
          return ts("2000-01-01");
        }
        return ts(m[1]);
      },
    };
  };

  const entries = [];
  for (;;) {
    const e = nextEntry();
    if (!e) {
      break;
    }
    entries.push(e);
  }
  return entries;
};

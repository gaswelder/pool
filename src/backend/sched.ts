const parseLine = (line: string) => {
  let m = line.match(/^(\d+)x(\d+)\s(.*?)$/);
  if (m) {
    return { times: m[1], size: m[2], desc: m[3] };
  }
  m = line.match(/^(\d+)\s(.*?)$/);
  if (m) {
    return { times: 1, size: m[1], desc: m[2] };
  }
  return null;
};

export type Ex = ReturnType<typeof ex>;

const ex = (
  line: string,
  categories: string[],
  comments: string[],
  history: string[]
) => {
  return {
    line,
    categories,
    comments,
    history,
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
    priority() {
      // Exercises marked as r=2 will be scheduled twice as often.
      // This would work for an arbitrary factor, not just 2, but only 2
      // was needed so far.
      let p = Date.now() - this.lastTime();
      if (categories.includes("r=2")) {
        p *= 2;
      }
      return p;
    },
  };
};

export const parseSched = (text: string) => {
  const lines = text.split("\n").map((s) => s.trim());

  const nextEx = () => {
    for (;;) {
      let line = lines.shift();
      if (line === undefined) {
        return null;
      }
      if (line == "") {
        continue;
      }
      const p = parseLine(line);
      if (!p) {
        continue;
      }

      // Extract tags from the line
      const categories = [...p.desc.matchAll(/\[([\w=]+)\]/g)].map((x) => x[1]);
      for (const x of categories) {
        p.desc = p.desc.replace(`[${x}]`, "");
      }

      // comments
      const comments = [] as string[];
      while (
        lines.length > 0 &&
        lines[0] != "" &&
        !lines[0].startsWith("[x]")
      ) {
        comments.push(lines.shift()!);
      }
      // history
      const history = [] as string[];
      while (lines.length > 0 && lines[0].startsWith("[x")) {
        history.push(lines.shift()!);
      }

      return ex(line, categories, comments, history);
    }
  };
  const exes: Ex[] = [];
  for (;;) {
    const ex = nextEx();
    if (!ex) break;
    exes.push(ex);
  }
  return exes;
};

export const order = <T extends Ex>(xs: T[]) => {
  const rnd = lcg();
  return xs
    .map((s) => {
      // When exercises have empty history, ordering by gap would be a noop,
      // so we also add a random score.
      return { s, gap: s.priority(), score: rnd() };
    })
    .sort((a, b) => {
      if (a.gap != b.gap) {
        return b.gap - a.gap;
      }
      return a.score - b.score;
    })
    .map((x) => x.s);
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

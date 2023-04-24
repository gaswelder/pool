import { toErr } from "../ts";
import { ParsedEx, Section, WorkoutFromJSON } from "../types";
import { PBuf, pbuf } from "./pbuf";

export const parseDraft = (draft: string) => {
  const result = [] as Section[];
  const startSection = (name: string) => {
    const m = name.match(/^(\d+)\s*x\s*(.*)$/);
    if (m) {
      result.push({ repeats: parseInt(m[1], 10), name: m[2], ex: [] });
    } else {
      result.push({ repeats: 1, name, ex: [] });
    }
  };
  const errors = [] as Error[];
  let implicitSection = false;
  draft.split(/\n/).forEach((line) => {
    const t = line.trim();
    if (t == "") {
      return;
    }
    if (t.startsWith("--")) {
      startSection(t.substring(2, t.length).trim());
      implicitSection = false;
      return;
    }
    try {
      const r = parseLine(t);
      if ("name" in r) {
        result.push(r);
        implicitSection = true;
      } else {
        if (result.length == 0 || implicitSection) {
          startSection("");
          implicitSection = false;
        }
        result[result.length - 1].ex.push(r);
      }
    } catch (e) {
      errors.push(toErr(e));
    }
  });
  return { result, errors };
};

// 10x100 freestyle
// 10 x (25 cr + 25 br)
// 2 x (4x25 cr + 4x25 br)
// 100 freestyle
const parseLine = (line: string): Section | ParsedEx => {
  const buf = pbuf(line);
  const a = buf.number();
  if (a == "") {
    throw new Error(`a number expected at "${buf.rest()}"`);
  }

  // 100 freestyle
  if (!buf.times()) {
    return {
      repeats: 1,
      amount: parseFloat(a),
      ...parseDescription(buf),
    };
  }

  // 10x100 freestyle
  const b = buf.number();
  if (b != "") {
    return {
      repeats: parseFloat(a),
      amount: parseFloat(b),
      ...parseDescription(buf),
    };
  }

  // 10 x (25 cr + 25 br)
  // 2 x (4x25 cr + 4x25 br)
  if (buf.peek() == "(") {
    const s = buf.rest();
    return {
      name: "",
      repeats: parseInt(a, 10),
      ex: parseStepsLine(s.substring(1, s.length - 1)),
    };
  }

  throw new Error(`unknown format: ${line}`);
};

const parseStepsLine = (s: string) => {
  // 10 laps blabla + 10 laps bla
  const buf = pbuf(s);
  const steps = [] as ParsedEx[];
  while (true) {
    const a = buf.number();
    if (a == "") {
      throw new Error(`expected a number at "${buf.rest()}"`);
    }
    // 4x50 blabla #paddles
    if (buf.times()) {
      const b = buf.number();
      if (b == "") {
        throw new Error(`expected a number at "${buf.rest()}"`);
      }
      steps.push({
        repeats: parseFloat(a),
        amount: parseFloat(b),
        ...parseDescription(buf),
      });
    } else {
      // 50 blabla
      steps.push({
        repeats: 1,
        amount: parseFloat(a),
        ...parseDescription(buf),
      });
    }
    if (buf.peek() == "+") {
      buf.get();
      buf.spaces();
    } else {
      break;
    }
  }
  if (buf.rest() != "") {
    throw new Error(`trailing string: "${buf.rest()}"`);
  }
  return steps;
};

const parseDescription = (buf: PBuf) => {
  const eqs = [] as string[];
  const noneqs = [] as string[];
  while (buf.peek() !== null) {
    if (buf.peek() == "+") {
      break;
    }
    const part = buf.word();
    buf.spaces();
    if (part[0] == "#") {
      eqs.push(part.substring(1, part.length));
    } else {
      noneqs.push(part);
    }
  }
  return {
    desc: noneqs.join(" ").trim(),
    equipment: eqs,
  };
};

export const workoutVolume = (sections: Section[]) => {
  let sum = 0;
  for (const s of sections) {
    let sectionSum = 0;
    for (const ex of s.ex) {
      sectionSum += ex.repeats * ex.amount;
    }
    sum += s.repeats * sectionSum;
  }
  return sum;
};

// const truthy = <T>(x: null | undefined | T): x is T => {
//   return x !== null && x !== undefined;
// };

export const parseArchive = (archive: string) => {
  const ww = [] as WorkoutFromJSON[];
  const lines = archive.split(/\n+/).filter((line) => line !== "");
  const r = (prefix: string) => {
    const line = lines.shift();
    if (!line) {
      throw new Error(`expected ${prefix}, got end of lines`);
    }
    if (!line.startsWith(prefix)) {
      throw new Error(`expected ${prefix}, got ${line}`);
    }
    return line.substring(prefix.length, line.length);
  };
  let counter = 1;
  while (lines.length > 0) {
    const props = {} as Record<string, string>;
    const title = r("## ");
    for (;;) {
      const line = lines[0];
      if (!line) {
        break;
      }
      const m = line.match(/^(\w+): (.*?)$/);
      if (!m) {
        break;
      }
      lines.shift();
      props[m[1]] = m[2];
    }
    const now = new Date();
    const defswam = () => {
      const m = title.match(/(\d\d\d\d-\d\d-\d\d)/);
      return m ? m[1] : "";
    };
    const w = {
      title,
      id: props.id || now.getTime() + "-" + counter++,
      created: props.created || now.toISOString(),
      swam: props.swam || defswam(),
      archived: props.archived || "",
      lines: [] as string[],
      comments: [] as string[],
    };
    while (
      lines.length > 0 &&
      !lines[0].startsWith("##") &&
      !lines[0].startsWith("//")
    ) {
      const line = lines.shift();
      if (!line) {
        continue;
      }
      w.lines.push(line);
    }
    while (lines.length > 0 && lines[0].startsWith("//")) {
      const line = lines.shift()!;
      w.comments.push(line.substring(2, line.length).trim());
    }
    ww.push(w);
  }
  return ww;
};

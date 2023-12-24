import { PBuf, pbuf } from "./pbuf";
import { ParsedEx, Section } from "./types";

export type ESet = ReturnType<typeof parseSet>;
export type Line = ReturnType<typeof parseLine>;

/**
 * Parses a set, which is a sequence of lines,
 * with an optional first title line in the form "-- title".
 */
export const parseSet = (text: string) => {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line != "");
  let name = "";
  if (lines.length == 0) {
    return { name, lines: [] };
  }
  if (lines[0].startsWith("-- ")) {
    name = lines.shift()!.replace("-- ", "");
  }
  return { name, lines: lines.map(parseLine) };
};

/**
 * Parses a single line, such as:
 *
 * 100 freestyle
 * 10x100 freestyle
 * 10 x (25 cr + 25 br)
 * 2 x (4x25 cr + 4x25 br)
 */
export const parseLine = (line: string) => {
  const buf = pbuf(line);
  const a = buf.number();
  if (a == "") {
    throw new Error(
      `a number expected at "${buf.rest()}", got "${glance(line)}"`
    );
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
  // if (buf.peek() == "(") {
  //   const s = buf.rest();
  //   return {
  //     name: "",
  //     repeats: parseInt(a, 10),
  //     ex: parseStepsLine(s.substring(1, s.length - 1)),
  //   };
  // }

  throw new Error(`unknown line format: ${glance(line)}`);
};

const splitIntoSets = (draft: string) => {
  const lines = draft
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line != "");
  const sets = [] as string[];
  lines.forEach((line) => {
    if (line.startsWith("-- ")) {
      sets[sets.length] = line;
    } else {
      if (sets.length == 0) {
        sets[0] = line;
      } else {
        sets[sets.length - 1] += "\n" + line;
      }
    }
  });
  return sets;
};

export const parseDraft = (draft: string) => {
  const sets = splitIntoSets(draft);
  return { result: sets.map(parseSet), errors: [] as Error[] };
};

const glance = (x: string) => {
  const n = 10;
  if (x.length <= n) {
    return x;
  }
  return x.substring(0, n) + "...";
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

// const truthy = <T>(x: null | undefined | T): x is T => {
//   return x !== null && x !== undefined;
// };

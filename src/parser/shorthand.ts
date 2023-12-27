export type Line = ReturnType<typeof parseLine>;

/**
 * Parses a single line, such as:
 *
 * 100 freestyle
 * 10x100 freestyle
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

const glance = (x: string) => {
  const n = 10;
  if (x.length <= n) {
    return x;
  }
  return x.substring(0, n) + "...";
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

type PBuf = ReturnType<typeof pbuf>;

const pbuf = (s: string) => {
  let pos = 0;
  const peek = () => {
    if (pos >= s.length) {
      return null;
    }
    return s[pos];
  };
  const get = () => {
    if (pos >= s.length) {
      throw new Error(`EOF`);
    }
    return s[pos++];
  };
  const isdigit = (x: null | string) => x && x.match(/\d/);
  const isspace = (x: null | string) => x && x.match(/\s/);
  const is = (x: null | string, re: RegExp) => x && x.match(re);
  const spaces = () => {
    while (isspace(peek())) {
      get();
    }
  };
  return {
    get,
    number() {
      spaces();
      let r = "";
      while (peek() !== null && isdigit(peek())) {
        r += get();
      }
      if (peek() == ".") {
        r += get();
        while (peek() !== null && isdigit(peek())) {
          r += get();
        }
      }
      return r;
    },
    times() {
      spaces();
      if (peek() == "x" || peek() == "×") {
        const r = get();
        spaces();
        return r;
      }
      return "";
    },
    word() {
      let r = "";
      while (peek() !== null && !isspace(peek())) {
        r += get();
      }
      return r;
    },
    peek,
    rest() {
      return s.substring(pos, s.length);
    },
    spaces,
  };
};

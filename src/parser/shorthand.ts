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
  const tags = [] as string[];
  const words = [] as string[];
  while (buf.peek() !== null) {
    const part = buf.word();
    buf.spaces();
    if (part[0] == "#") {
      tags.push(part.substring(1, part.length));
    } else {
      words.push(part);
    }
  }
  return {
    desc: words.join(" ").trim(),
    tags,
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

export type PBuf = ReturnType<typeof pbuf>;

export const pbuf = (s: string) => {
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

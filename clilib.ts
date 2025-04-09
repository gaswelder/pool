export const parseArgs = <T extends Record<string, unknown>>(
  spec: T,
  args: string[]
) => {
  const params = Object.fromEntries(Object.keys(spec).map((k) => [k, ""]));

  while (args.length > 0 && args[0][0] == "-") {
    const a = args.shift();
    if (a === undefined) {
      throw new Error("!");
    }
    const f = a.substring(1, a.length);
    const s = spec[f];
    if (!s) {
      process.stderr.write("Unknown parameter: " + a + "\n");
      process.exit(1);
    }

    const val = args.shift();
    if (val === undefined) {
      process.stderr.write(a + " parameter requires an argument\n");
      process.exit(1);
    }
    params[f] = val;
  }

  return [params, args] as [typeof params, typeof args];
};

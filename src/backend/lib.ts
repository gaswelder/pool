export const groupBy = <T>(xs: T[], key: (x: T) => string) => {
  return xs.reduce((s, item) => {
    const k = key(item);
    return { ...s, [k]: [...(s[k] || []), item] };
  }, {} as Record<string, T[]>);
};

import { parseLine } from "../parser/shorthand";

export type WeekProg = ReturnType<typeof parseDraft>;
export type DayProg = WeekProg["days"][0];
export type SetProg = DayProg["sets"][0];

export const parseDraft = (draft: string) => {
  const lines = draft
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line != "");
  const days = split(lines, "#");
  const errors = [] as Error[];
  return {
    errors,
    days: days.map((day) => {
      const sets = split(day.lines, "--");
      return {
        name: day.name,
        sets: sets.map((set) => {
          return {
            name: set.name,
            lines: set.lines
              .map((line) => {
                try {
                  return parseLine(line);
                } catch (err) {
                  errors.push(err as Error);
                  return null;
                }
              })
              .filter(truthy),
          };
        }),
      };
    }),
  };
};

/**
 * Parses a set, which is a sequence of lines,
 * with an optional first title line in the form "-- title".
 */
export const parseSet = (text: string) => {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line != "");
  return lines.map(parseLine);
};

const split = (lines: string[], prefix: string) => {
  const sets = [] as { name: string; lines: string[] }[];
  lines.forEach((line) => {
    if (line.startsWith(prefix)) {
      sets[sets.length] = {
        name: line.substring(prefix.length, line.length).trim(),
        lines: [],
      };
    } else {
      if (sets.length == 0) {
        sets[0] = { name: "", lines: [line] };
      } else {
        sets[sets.length - 1].lines.push(line);
      }
    }
  });
  return sets;
};

const truthy = <T>(x: T | null): x is T => {
  return x !== null;
};

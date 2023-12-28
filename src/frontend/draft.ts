import { parseLine } from "../parser/shorthand";
import { truthy } from "../ts";

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

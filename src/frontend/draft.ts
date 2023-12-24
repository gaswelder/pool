import { parseSet } from "../parser/shorthand";

export const parseDraft = (draft: string) => {
  const sets = splitIntoSets(draft);
  return { result: sets.map(parseSet), errors: [] as Error[] };
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

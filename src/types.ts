export type WorkoutFromJSON = {
  title: string;
  lines: string[];
  comments: string[];
};

export type ParsedWorkout = {
  title: string;
  sections: Section[];
};

export type Section = {
  name: string;
  repeats: number;
  ex: ParsedEx[];
};

export type ParsedEx = {
  repeats: number;
  amount: number;
  desc: string;
  equipment: string[];
};

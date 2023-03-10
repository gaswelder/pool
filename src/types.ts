export type PlannedWorkout = {
  title: string;
  draft: string;
};

export type WorkoutFromJSON = {
  title: string;
  date: string;
  ex: string[];
};

export type ParsedWorkout = {
  title: string;
  date: string;
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

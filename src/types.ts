export type WorkoutFromJSON = {
  title: string;
  date: string | null;
  ex: string[];
};

export type ParsedWorkout = {
  title: string;
  date: string | null;
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

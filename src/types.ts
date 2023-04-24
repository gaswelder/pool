export type WorkoutFromJSON = {
  id: string;
  title: string;
  created: string;
  swam?: string;
  archived?: string;
  lines: string[];
};

export type ParsedWorkout = {
  id: string;
  title: string;
  created: string;
  swam?: string;
  archived?: string;
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

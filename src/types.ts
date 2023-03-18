export type WorkoutFromJSON = {
  id: string;
  title: string;
  ex: string[];
  created: string;
  swam?: string;
  archived?: string;
};

export type ParsedWorkout = {
  id: string;
  title: string;
  sections: Section[];
  created: string;
  swam?: string;
  archived?: string;
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

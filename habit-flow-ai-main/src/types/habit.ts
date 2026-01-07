export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  completions: Record<string, boolean>; // date string -> completed
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  /** optional ISO date (YYYY-MM-DD) attached to this note */
  date?: string;
}

export interface HabitStats {
  completed: number;
  left: number;
  percentage: number;
}

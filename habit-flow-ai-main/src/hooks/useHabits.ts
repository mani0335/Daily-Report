import { useState, useEffect } from 'react';
import { Habit, Note } from '@/types/habit';

const HABITS_KEY = 'habit-tracker-habits';
const NOTES_KEY = 'habit-tracker-notes';

const defaultHabits: Habit[] = [
  { id: '1', name: 'Morning Workout', emoji: '💪', goal: 30, completions: {} },
  { id: '2', name: 'Read 20 Pages', emoji: '📖', goal: 30, completions: {} },
  { id: '3', name: 'Meditate', emoji: '🧘', goal: 30, completions: {} },
  { id: '4', name: 'Drink 8 Glasses', emoji: '💧', goal: 30, completions: {} },
  { id: '5', name: 'Learn Language', emoji: '🗣️', goal: 30, completions: {} },
];

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(HABITS_KEY);
    return saved ? JSON.parse(saved) : defaultHabits;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const addHabit = (name: string, emoji: string, goal: number = 30) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      goal,
      completions: {},
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        newCompletions[date] = !newCompletions[date];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const addNote = (text: string, date?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      date: date ? date.slice(0, 10) : undefined,
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const getHabitStats = (habit: Habit, month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let completed = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (habit.completions[dateStr]) {
        completed++;
      }
    }
    
    return {
      completed,
      left: habit.goal - completed,
      percentage: Math.round((completed / habit.goal) * 100),
    };
  };

  const getMonthlyStats = (month: number, year: number) => {
    let totalCompleted = 0;
    let totalGoal = 0;
    
    habits.forEach(habit => {
      const stats = getHabitStats(habit, month, year);
      totalCompleted += stats.completed;
      totalGoal += habit.goal;
    });
    
    return {
      completed: totalCompleted,
      total: totalGoal,
      percentage: totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0,
    };
  };

  return {
    habits,
    notes,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addNote,
    deleteNote,
    getHabitStats,
    getMonthlyStats,
  };
}

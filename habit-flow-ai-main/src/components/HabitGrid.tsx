import { useState } from 'react';
import { Habit } from '@/types/habit';
import { Trash2, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HabitGridProps {
  habits: Habit[];
  selectedMonth: number;
  selectedYear: number;
  onToggle: (habitId: string, date: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, emoji: string, goal: number) => void;
  getStats: (habit: Habit, month: number, year: number) => { completed: number; left: number; percentage: number };
}

const EMOJIS = ['💪', '📖', '🧘', '💧', '🗣️', '🏃', '📚', '🎯', '✨', '💰', '🏋️', '🌙', '🍎', '💊', '⏰', '✍️'];

export function HabitGrid({ habits, selectedMonth, selectedYear, onToggle, onDelete, onAdd, getStats }: HabitGridProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('🎯');
  const [newHabitGoal, setNewHabitGoal] = useState(30);
  const [dialogOpen, setDialogOpen] = useState(false);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  // Generate all days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
  };

  const formatDate = (day: number) => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim(), newHabitEmoji, newHabitGoal);
      setNewHabitName('');
      setNewHabitEmoji('🎯');
      setNewHabitGoal(30);
      setDialogOpen(false);
    }
  };

  // Calculate week boundaries for headers
  const getWeekNumber = (day: number) => {
    let weekNum = 1;
    for (let d = 1; d < day; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      if (date.getDay() === 6) weekNum++;
    }
    return weekNum;
  };

  // Group days by week
  const getWeekForDay = (day: number) => {
    let weekNum = 1;
    for (let d = 1; d < day; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      if (date.getDay() === 6) weekNum++;
    }
    return weekNum;
  };

  const totalWeeks = getWeekForDay(daysInMonth);

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-primary text-primary-foreground py-2 px-4 flex items-center gap-2">
        <span className="text-base">📋</span>
        <span className="font-bold text-sm">DAILY HABITS</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Week header row */}
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 sticky left-0 z-20 bg-muted/50 min-w-[150px] font-semibold">
                Habit
              </th>
              <th className="font-semibold px-2 py-2 min-w-[50px] text-center border-r border-border">
                GOALS
              </th>
              {Array.from({ length: totalWeeks }, (_, i) => {
                const weekDays = days.filter(d => getWeekForDay(d) === i + 1);
                return (
                  <th 
                    key={i} 
                    colSpan={weekDays.length} 
                    className="font-bold px-1 py-1.5 text-center bg-primary/10 text-primary border-l border-border"
                  >
                    WEEK {i + 1}
                  </th>
                );
              })}
            </tr>
            {/* Day numbers row */}
            <tr className="bg-muted/30">
              <td className="sticky left-0 z-20 bg-muted/30 px-3 py-1 border-b border-border"></td>
              <td className="text-center border-r border-border border-b text-muted-foreground"></td>
              {days.map((day) => (
                <td 
                  key={day}
                  className="text-center py-1.5 min-w-[28px] border-b border-border"
                >
                  <div className="font-medium text-muted-foreground">{getDayName(day)}</div>
                  <div className="font-semibold text-foreground">{day}</div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const stats = getStats(habit, selectedMonth, selectedYear);
              return (
                <tr key={habit.id} className="hover:bg-accent/30 transition-colors border-b border-border group">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium whitespace-nowrap border-r border-border">
                    <span className="mr-2 text-base">{habit.emoji}</span>
                    <span className="text-foreground">{habit.name}</span>
                  </td>
                  <td className="text-center font-bold text-primary border-r border-border">{habit.goal}</td>
                  {days.map((day) => {
                    const dateStr = formatDate(day);
                    const isCompleted = habit.completions[dateStr];
                    const isToday = formatDate(new Date().getDate()) === dateStr && 
                                   selectedMonth === new Date().getMonth() && 
                                   selectedYear === new Date().getFullYear();
                    return (
                      <td 
                        key={day} 
                        className={`text-center cursor-pointer transition-all p-0.5 ${
                          isCompleted 
                            ? '' 
                            : isToday 
                              ? 'bg-accent/50' 
                              : 'hover:bg-accent/30'
                        }`}
                        onClick={() => onToggle(habit.id, dateStr)}
                      >
                        <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : 'border border-muted-foreground/30 hover:border-primary'
                        }`}>
                          {isCompleted && <Check className="w-3 h-3" />}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onDelete(habit.id)}
                      className="text-destructive/70 hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Add new habit row */}
            <tr className="bg-success-light/30">
              <td colSpan={4 + daysInMonth} className="px-3 py-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                      <Plus className="w-4 h-4" />
                      Add New Habit
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Habit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Habit Name</label>
                        <Input
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          placeholder="e.g., Morning Exercise"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Choose Emoji</label>
                        <div className="flex flex-wrap gap-2">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => setNewHabitEmoji(emoji)}
                              className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                                newHabitEmoji === emoji 
                                  ? 'border-primary bg-primary/10 scale-110' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Monthly Goal (days)</label>
                        <Input
                          type="number"
                          value={newHabitGoal}
                          onChange={(e) => setNewHabitGoal(Number(e.target.value))}
                          min={1}
                          max={31}
                        />
                      </div>
                      <Button onClick={handleAddHabit} className="w-full">
                        Add Habit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

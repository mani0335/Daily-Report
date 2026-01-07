import { useHabits } from '@/hooks/useHabits';
import { HabitGrid } from '@/components/HabitGrid';
import { ProgressCharts } from '@/components/ProgressCharts';
import { NotesSection } from '@/components/NotesSection';
import { MonthTabs } from '@/components/MonthTabs';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Index = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear] = useState(currentDate.getFullYear());

  const {
    habits,
    notes,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addNote,
    deleteNote,
    getHabitStats,
    getMonthlyStats,
  } = useHabits();

  const monthlyStats = getMonthlyStats(selectedMonth, selectedYear);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formattedDate = `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold tracking-wide" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            🎯 Progress your Success with <span className="text-primary-foreground/90">Habit-Tracker</span>
          </h1>
          <div className="text-sm font-medium opacity-90">
            📅 {formattedDate}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 space-y-4">
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left Column - Habit Grid + Global Progress */}
          <div className="xl:col-span-2 space-y-4">
            {/* Habit Grid */}
            <HabitGrid
              habits={habits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onToggle={toggleCompletion}
              onDelete={deleteHabit}
              onAdd={addHabit}
              getStats={getHabitStats}
            />
            
            {/* Month Tabs - Below Habit Grid */}
            <MonthTabs selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />

            {/* Daily Productivity (separate card above Global Progress) */}
            <div className="bg-card rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-primary mb-3 bg-primary/10 py-2 px-3 rounded">📊 Daily Productivity</h4>
              {
                // compute per-day totals for this month
              }
              {(() => {
                const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                const dailyTotals = days.map((day) => {
                  const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  return habits.reduce((acc, h) => acc + (h.completions[dateStr] ? 1 : 0), 0);
                });

                const chartData = days.map((d, i) => ({ day: String(d), count: dailyTotals[i] }));

                return (
                  <div>
                    <div className="w-full bg-muted/40 rounded-md p-3">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value: number) => [value, 'Completed']} />
                            <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Global Progress Section (stylized) */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gradient-to-br from-green-100 to-white shadow-sm">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-green-700">GLOBAL PROGRESS</h3>
                    <p className="text-xs text-muted-foreground">Monthly overview & weekly trends</p>
                  </div>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Completed</p>
                    <p className="text-2xl font-extrabold text-green-600">{monthlyStats.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Goal</p>
                    <p className="text-2xl font-extrabold text-foreground">{monthlyStats.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Left</p>
                    <p className="text-2xl font-extrabold text-destructive">{monthlyStats.total - monthlyStats.completed}</p>
                  </div>
                </div>
              </div>

              {/* Weekly Progress Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Weekly Progress</p>
                  <p className="text-xs text-muted-foreground">{monthlyStats.percentage ?? 0}% this month</p>
                </div>
                {(() => {
                  const colorPairs = [
                    ['#35d910ff', '#10B981'], // green
                    ['#60A5FA', '#3B82F6'], // blue
                    ['#F472B6', '#EC4899'], // pink
                    ['#F59E0B', '#D97706'], // amber
                    ['#A78BFA', '#7C3AED'], // purple
                  ];
                  const emojiSet = ['⭐', '✨', '🌟', '🏆', '🎯'];

                  return [1, 2, 3, 4, 5].map((week) => {
                    const weekProgressRaw = monthlyStats && typeof monthlyStats.percentage === 'number'
                      ? monthlyStats.percentage - (week - 1) * 20
                      : 0;
                    const weekProgress = Math.min(100, Math.max(0, Math.round(weekProgressRaw)));
                    const emojiCount = weekProgress > 0 ? Math.min(4, Math.ceil(weekProgress / 25)) : 0;
                    const [c1, c2] = colorPairs[(week - 1) % colorPairs.length];

                    return (
                      <div key={week} className="flex items-center gap-4">
                        <div className="flex items-center gap-3 w-40">
                          <span
                            className="inline-block w-3 h-3 rounded-full shadow-sm"
                            style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                          />
                          <span className="text-sm text-muted-foreground">Week {week}</span>
                        </div>

                        <div className="flex-1 relative">
                          <div className="h-6 bg-[#f3f7f6] rounded-full overflow-hidden relative">
                            <div
                              className="absolute left-0 top-0 h-full transition-all duration-700 flex items-center gap-2 pl-3"
                              style={{ width: `${weekProgress}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                            >
                              {emojiCount > 0 && Array.from({ length: emojiCount }).map((_, i) => (
                                <span
                                  key={i}
                                  aria-hidden
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm shadow"
                                  style={{ background: c2, color: '#fff', transform: 'translateY(-1px)' }}
                                >
                                  {emojiSet[i % emojiSet.length]}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-0">
                            <div className="bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                              <span className="text-sm font-semibold text-slate-700">{weekProgress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Notes Section (moved below Global Progress) */}
            <NotesSection
              notes={notes}
              onAdd={addNote}
              onDelete={deleteNote}
            />
          </div>

          {/* Right Column - Charts */}
          <div className="space-y-4">
            {/* Progress Charts */}
            <ProgressCharts 
              habits={habits}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              getStats={getHabitStats}
              monthlyStats={monthlyStats}
              notes={notes}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
              badgeColor="#10B981"
            />
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

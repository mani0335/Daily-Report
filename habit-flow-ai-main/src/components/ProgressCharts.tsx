import { useState } from 'react';
import { Habit, Note } from '@/types/habit';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface ProgressChartsProps {
  habits: Habit[];
  selectedMonth: number;
  selectedYear: number;
  getStats: (habit: Habit, month: number, year: number) => { completed: number; left: number; percentage: number };
  monthlyStats: { completed: number; total: number; percentage: number };
  notes?: Note[];
  onAddNote?: (text: string, date?: string) => void;
  onDeleteNote?: (id: string) => void;
  badgeColor?: string;
}

export function ProgressCharts({ habits, selectedMonth, selectedYear, getStats, monthlyStats, notes = [], onAddNote, onDeleteNote, badgeColor = '#10B981' }: ProgressChartsProps) {
  // Donut chart data (show daily completion for today)
  const today = new Date();
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayCompleted = habits.reduce((acc, h) => acc + (h.completions[isoToday] ? 1 : 0), 0);
  const actualTotalHabits = habits.length;
  let todayPercentage = 0;
  let donutData = [] as { name: string; value: number }[];
  if (actualTotalHabits === 0) {
    // no habits — show empty state
    todayPercentage = 0;
    donutData = [
      { name: 'Completed', value: 0 },
      { name: 'Left', value: 1 },
    ];
  } else {
    const left = Math.max(0, actualTotalHabits - todayCompleted);
    todayPercentage = Math.round((todayCompleted / actualTotalHabits) * 100);
    donutData = [
      { name: 'Completed', value: todayCompleted },
      { name: 'Left', value: left },
    ];
  }

  // Top habits by completion
  const habitBarData = habits
    .map(habit => ({
      name: habit.name,
      emoji: habit.emoji,
      completed: getStats(habit, selectedMonth, selectedYear).completed,
      percentage: getStats(habit, selectedMonth, selectedYear).percentage,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Monthly trend data (for all months)
  const monthlyTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
    if (index <= selectedMonth) {
      let total = 0;
      let completed = 0;
      const daysInMonth = new Date(selectedYear, index + 1, 0).getDate();
      
      habits.forEach(habit => {
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${selectedYear}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (habit.completions[dateStr]) completed++;
          total++;
        }
      });
      
      return {
        month,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }
    return { month, percentage: 0 };
  });

  // helper to compute daily trend for any month/year
  const getDailyTrend = (month: number, year: number) => {
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const totalHabits = Math.max(1, habits.length);
      const completed = habits.reduce((acc, h) => acc + (h.completions[dateStr] ? 1 : 0), 0);
      return { day: String(day), percentage: Math.round((completed / totalHabits) * 100) };
    });
  };

  // current selected-month daily trend (used by the main area chart)
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyTrend = getDailyTrend(selectedMonth, selectedYear);

  // Compact calendar shown above Productivity Trend (smaller, click to add info)
  const MiniCalendar = ({ notes = [], onAddNote = () => {}, onDeleteNote = () => {}, badgeColor = '#10B981' }: { notes?: Note[]; onAddNote?: (t: string, d?: string) => void; onDeleteNote?: (id: string) => void; badgeColor?: string }) => {
    const weekdays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
    // allow browsing months/years inside mini calendar
    const [dispMonth, setDispMonth] = useState<number>(selectedMonth);
    const [dispYear, setDispYear] = useState<number>(selectedYear);

    const firstDow = new Date(dispYear, dispMonth, 1).getDay(); // 0 Sun - 6 Sat
    const leading = (firstDow + 6) % 7; // convert to Monday start
    const monthTrend = getDailyTrend(dispMonth, dispYear);
    const daysInDispMonth = monthTrend.length;
    const cells: Array<{ day?: number; hasDot?: boolean }> = [];
    for (let i = 0; i < leading; i++) cells.push({});
    const now = new Date();
    const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let d = 1; d <= daysInDispMonth; d++) {
      const entry = monthTrend[d - 1];
      const cellDate = new Date(dispYear, dispMonth, d);
      const hasDot = (entry.percentage || 0) > 0;
      const hasFill = cellDate <= todayNoTime;
      const isToday = cellDate.getTime() === todayNoTime.getTime();
      cells.push({ day: d, hasDot, hasFill, isToday });
    }
    while (cells.length % 7 !== 0) cells.push({});

    const [openDate, setOpenDate] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    const save = () => {
      if (!openDate) return;
      if (noteText.trim()) {
        onAddNote(noteText.trim(), openDate);
        setNoteText('');
        setOpenDate(null);
      }
    };

    const prevMonth = () => {
      if (dispMonth === 0) {
        setDispMonth(11);
        setDispYear(d => d - 1);
      } else setDispMonth(m => m - 1);
    };
    const nextMonth = () => {
      if (dispMonth === 11) {
        setDispMonth(0);
        setDispYear(d => d + 1);
      } else setDispMonth(m => m + 1);
    };

    const [badgeColorLocal, setBadgeColorLocal] = useState<string | null>(null);
    const [showSwatches, setShowSwatches] = useState(false);

    // load persisted color (overrides prop)
    useState(() => {
      try {
        const saved = localStorage.getItem('miniCalendarBadgeColor');
        if (saved) setBadgeColorLocal(saved);
      } catch (e) {
        /* ignore */
      }
    });

    const effectiveBadgeColor = badgeColorLocal || badgeColor;
    const swatches = ['#10B981', '#3B82F6', '#F472B6', '#F59E0B'];
    const chooseColor = (c: string) => {
      try { localStorage.setItem('miniCalendarBadgeColor', c); } catch (e) {}
      setBadgeColorLocal(c);
      setShowSwatches(false);
    };

    return (
      <div className="bg-emerald-200 rounded-lg border border-emerald-300 p-2 mb-2">
        <div className="flex items-center justify-between mb-1 relative">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-muted/30"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-xs font-semibold">{new Date(dispYear, dispMonth).toLocaleString(undefined, { month: 'short' })} {dispYear}</div>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-muted/30"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSwatches(s => !s)} className="p-1 rounded hover:bg-muted/30 flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: effectiveBadgeColor, boxShadow: `0 0 0 6px ${effectiveBadgeColor}22` }} />
            </button>
            {showSwatches ? (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow px-2 py-2 flex gap-2">
                {swatches.map(s => (
                  <button key={s} onClick={() => chooseColor(s)} className="w-6 h-6 rounded-full" style={{ backgroundColor: s }} />
                ))}
                <button onClick={() => chooseColor('#10B981')} className="ml-2 text-xs text-muted-foreground">Reset</button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[0.6rem] text-center text-muted-foreground mb-1">
          {weekdays.map((w) => (
            <div key={w} className="py-0.5 font-medium">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            const iso = c.day ? `${dispYear}-${String(dispMonth + 1).padStart(2,'0')}-${String(c.day).padStart(2,'0')}` : undefined;
            const notesForDay = iso ? notes.filter(n => n.date === iso) : [];
            const cellBg = c.hasFill ? 'bg-emerald-50' : 'bg-slate-50';
            return (
              <div key={i} className={`h-10 ${cellBg} rounded flex items-start justify-start p-1 relative`}> 
                {c.day ? (
                  <>
                    <button onClick={() => setOpenDate(iso || null)} className="w-full text-left z-10">
                      <div className={`text-[0.68rem] font-medium ${c.isToday ? 'text-emerald-700' : 'text-foreground'}`}>{c.day}</div>
                    </button>
                    {c.hasFill ? (
                      <div className="absolute inset-0 rounded pointer-events-none" style={{ background: c.hasFill ? `linear-gradient(180deg, ${badgeColor}20, ${badgeColor}10)` : undefined }} />
                    ) : null}
                    {c.hasFill ? (
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: badgeColor, boxShadow: '0 0 0 2px rgba(255,255,255,0.9) inset' }} />
                    ) : null}
                    {notesForDay && notesForDay.length > 0 ? (
                      <div className="absolute bottom-1 left-1 right-1 px-1 text-[0.6rem] text-foreground truncate">
                        {notesForDay[0].text.length > 18 ? notesForDay[0].text.slice(0,18) + '…' : notesForDay[0].text}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        <Dialog open={!!openDate} onOpenChange={(v) => { if (!v) { setOpenDate(null); setNoteText(''); } }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{openDate}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add info for this date" />
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={save}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setOpenDate(null)}>Close</Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">Saved notes</h4>
                <div className="space-y-2 mt-2">
                  {openDate ? (
                    notes.filter(n => n.date === openDate).length > 0 ? (
                      notes.filter(n => n.date === openDate).map(n => (
                        <div key={n.id} className="p-2 bg-muted/10 rounded flex items-start justify-between gap-3">
                          <div className="text-sm">{n.text}</div>
                          <button onClick={() => { onDeleteNote(n.id); }} className="text-destructive/80 hover:text-destructive flex items-center gap-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No notes for this date.</div>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Monthly Overview Donut */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-sm font-bold text-primary mb-4 bg-primary/10 py-2 px-3 rounded flex items-center gap-2">
          🎯 OVERVIEW DAILY PROGRESS
        </h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={70}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F3F4F6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-600">{todayPercentage}%</span>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
          </div>
        </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-medium">COMPL. {todayPercentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' }}></div>
                <span className="text-xs font-medium">LEFT {100 - todayPercentage}%</span>
              </div>
            </div>
      </div>

      {/* Top Daily Habits */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-sm font-bold text-primary mb-4 bg-primary/10 py-2 px-3 rounded flex items-center gap-2">
          🏆 TOP 10 DAILY HABITS
        </h3>
        <div className="space-y-3">
          {habitBarData.map((habit, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5">{index + 1}</span>
              <span className="text-lg">{habit.emoji}</span>
              <span className="text-sm font-medium flex-1 truncate">{habit.name}</span>
              <div className="w-16 h-2.5 bg-muted rounded-none overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${habit.percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold w-10 text-right">{habit.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Trend */}
      <MiniCalendar notes={notes} onAddNote={onAddNote} onDeleteNote={onDeleteNote} />
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-sm font-bold text-primary mb-4 bg-primary/10 py-2 px-3 rounded flex items-center justify-between">
          <span className="flex items-center gap-2">📈 Productivity Trend</span>
        </h3>
        {/* Daily productivity (per-day) */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Daily Productivity ({daysInSelectedMonth} days)</h4>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Completed']} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorDaily)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly/overall trend */}
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 70% 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142 70% 45%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
            <Area 
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(142 70% 45%)" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPercentage)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

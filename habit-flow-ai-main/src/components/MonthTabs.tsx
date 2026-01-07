interface MonthTabsProps {
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'March', 'Apr', 'May', 'June',
  'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
];

export function MonthTabs({ selectedMonth, onSelectMonth }: MonthTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 bg-card rounded-lg border p-2">
      {MONTHS.map((month, index) => (
        <button
          key={month}
          onClick={() => onSelectMonth(index)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
            selectedMonth === index
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          }`}
        >
          {month}
        </button>
      ))}
    </div>
  );
}

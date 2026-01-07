import { useState } from 'react';
import { Note } from '@/types/habit';
import { Plus, Trash2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
  notes: Note[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}

export function NotesSection({ notes, onAdd, onDelete }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newNote.trim()) {
      onAdd(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="rounded-lg border border-emerald-200 p-4 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          QUICK NOTES
        </h3>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white border-transparent"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Note
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a quick note... (tips, reminders, insights)"
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="text-xs">
              Save Note
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setIsAdding(false); setNewNote(''); }}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {(() => {
          const quickNotes = notes.filter(n => !n.date);
          if (quickNotes.length === 0) {
            return (
              <p className="text-muted-foreground text-sm text-center py-4">
                No quick notes yet. Add your first quick note! 📝
              </p>
            );
          }

          return quickNotes.map((note) => (
            <div 
              key={note.id} 
              className="note-card group relative"
            >
              <button
                onClick={() => onDelete(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <p className="text-sm pr-6">{note.text}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatDate(note.createdAt)}
              </span>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

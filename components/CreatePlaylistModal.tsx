import React, { useState } from 'react';
import { X, Check, Music } from 'lucide-react';
import { Song } from '../types';
import { Button } from './ui/Button';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSongs: Song[];
  onCreate: (name: string, selectedSongIds: string[]) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  allSongs,
  onCreate 
}) => {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleSong = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, Array.from(selectedIds));
      setName('');
      setSelectedIds(new Set());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Create New Playlist</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist Name"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Songs</p>
          <div className="space-y-1">
            {allSongs.map(song => {
              const isSelected = selectedIds.has(song.id);
              return (
                <div 
                  key={song.id}
                  onClick={() => toggleSong(song.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-white'}`}>{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#18181b]/50">
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim()}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Playlist {selectedIds.size > 0 && `(${selectedIds.size} songs)`}
          </Button>
        </div>
      </div>
    </div>
  );
};
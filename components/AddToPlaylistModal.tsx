import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { Playlist } from '../types';
import { Button } from './ui/Button';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  playlists, 
  onAddToPlaylist,
  onCreatePlaylist 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const userPlaylists = playlists.filter(p => !p.isSystem);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
            {userPlaylists.length === 0 && !isCreating && (
              <p className="text-gray-500 text-center py-4">No playlists yet.</p>
            )}
            
            {userPlaylists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => { onAddToPlaylist(playlist.id); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group text-left"
              >
                <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                  <Music size={16} className="text-gray-400 group-hover:text-primary" />
                </div>
                <div className="flex-1 truncate">
                  <p className="font-medium text-white truncate">{playlist.name}</p>
                  <p className="text-xs text-gray-500">{playlist.songs.length} songs</p>
                </div>
              </button>
            ))}
          </div>

          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-3 animate-fade-in">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist Name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="flex-1 py-1 text-sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-1 text-sm">Create</Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">New Playlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Heart, PlusCircle, MoreHorizontal, ImageOff, ListEnd, Trash2 } from 'lucide-react';
import { Song } from '../types';

interface SongRowProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  onPlay: () => void;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
  onRemove?: () => void; // Optional remove handler
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  isCurrent,
  isPlaying,
  isLiked,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
  onAddToQueue,
  onRemove
}) => {
  // Format duration safely
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 'q' to add to queue
    if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      onAddToQueue();
    }
    // Enter to play
    if (e.key === 'Enter') {
      e.preventDefault();
      onPlay();
    }
  };

  return (
    <div 
      onClick={onPlay}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`group flex items-center p-3 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer
        ${isCurrent 
          ? 'bg-card border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
          : 'border-transparent hover:bg-card hover:border-primary/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-[1.01]'
        }
      `}
    >
      <div className="w-8 text-center text-muted font-mono text-sm flex items-center justify-center flex-shrink-0">
        {isCurrent && isPlaying ? (
            <div className="flex items-end justify-center gap-[2px] h-4">
              <span className="w-[3px] bg-primary animate-[bounce_1s_infinite] h-2"></span>
              <span className="w-[3px] bg-primary animate-[bounce_1.2s_infinite] h-4"></span>
              <span className="w-[3px] bg-primary animate-[bounce_0.8s_infinite] h-3"></span>
            </div>
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        <button 
          className={`hidden group-hover:block ${isCurrent && isPlaying ? 'hidden' : ''} text-white hover:text-primary transition-colors`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      
      <div className="w-10 h-10 mx-4 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 shadow-sm relative group-hover:shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all">
        {song.coverUrl ? (
          <img 
            src={song.coverUrl} 
            alt={song.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
                // Fallback on error
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60';
            }} 
           />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={16} className="text-gray-500" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 pr-4">
        <h4 className={`font-medium truncate transition-colors ${isCurrent ? 'text-primary' : 'text-[var(--text-main)]'}`}>
          {song.title}
        </h4>
        <div className="flex items-center text-sm text-muted truncate">
            <span className="hover:underline cursor-pointer truncate hover:text-primary">{song.artist}</span>
            {song.album && song.album !== 'Unknown Album' && (
                <>
                   <span className="mx-2 text-muted hidden sm:inline">•</span>
                   <span className="hover:text-primary transition-colors cursor-pointer truncate hidden sm:inline" title={song.album}>
                      {song.album}
                   </span>
                </>
            )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity mr-4 flex-shrink-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
          className={`transition-colors hover:scale-110 transform ${isLiked ? 'text-primary' : 'text-muted hover:text-[var(--text-main)]'}`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToPlaylist(); }}
          className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110 transform"
          title="Add to Playlist"
        >
          <PlusCircle size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToQueue(); }}
          className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110 transform"
          title="Add to Queue (Q)"
        >
          <ListEnd size={18} />
        </button>
        
        {onRemove && (
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="text-muted hover:text-red-500 transition-colors hover:scale-110 transform"
                title="Remove from Playlist"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>

      <span className="text-sm text-muted w-12 text-right font-mono flex-shrink-0">
          {formatDuration(song.duration)}
      </span>
    </div>
  );
};
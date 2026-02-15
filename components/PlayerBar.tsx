import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Volume1, VolumeX, Maximize2, Minimize2, Heart, ListPlus, ListEnd, ChevronUp, ChevronDown } from 'lucide-react';
import { Song } from '../types';
import { Slider } from './ui/Slider';

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isLiked: boolean;
  isFullScreen: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullScreen: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ 
  currentSong, 
  isPlaying, 
  isShuffle,
  isLiked,
  isFullScreen,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleLike,
  onAddToPlaylist,
  onAddToQueue,
  onSeek,
  onVolumeChange,
  onToggleFullScreen
}) => {
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80); // Store previous volume for unmute

  // Calculate progress percentage
  // If duration is 0 (loading) avoid NaN
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (percentage: number) => {
    const newTime = (percentage / 100) * duration;
    onSeek(newTime);
  };
  
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    onVolumeChange(newVol / 100);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolume || 80);
    }
  };

  // Determine Volume Icon
  const VolumeIcon = volume === 0 ? VolumeX : (volume < 50 ? Volume1 : Volume2);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass border-t border-white/5 px-6 flex items-center justify-between z-50 animate-slide-up">
      {/* Track Info */}
      <div 
        className="flex items-center gap-4 w-[30%] group"
      >
        <div 
           className="relative w-14 h-14 rounded-lg overflow-hidden shadow-lg border border-white/5 cursor-pointer"
           onClick={onToggleFullScreen}
        >
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
              {isFullScreen ? <ChevronDown size={24} className="text-white" /> : <ChevronUp size={24} className="text-white" />}
           </div>
           <img 
            src={currentSong.coverUrl} 
            alt={currentSong.title} 
            className={`w-full h-full object-cover transition-transform duration-[3000ms] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
          />
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <h4 
            onClick={onToggleFullScreen}
            className="font-semibold text-[var(--text-main)] hover:text-primary transition-colors cursor-pointer truncate max-w-[200px] animate-fade-in"
          >
            {currentSong.title}
          </h4>
          <p 
            onClick={onToggleFullScreen}
            className="text-xs text-muted hover:underline cursor-pointer truncate"
          >
            {currentSong.artist}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
              className={`p-1.5 rounded-full transition-all hover:bg-white/5 hover:scale-110 ${isLiked ? 'text-primary' : 'text-muted hover:text-[var(--text-main)]'}`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToPlaylist(); }}
              className="p-1.5 rounded-full text-muted hover:text-[var(--text-main)] hover:bg-white/5 transition-all hover:scale-110"
              title="Add to Playlist"
            >
              <ListPlus size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToQueue(); }}
              className="p-1.5 rounded-full text-muted hover:text-[var(--text-main)] hover:bg-white/5 transition-all hover:scale-110"
              title="Add to Queue"
            >
              <ListEnd size={18} />
            </button>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center w-[40%] gap-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleShuffle}
            className={`transition-colors hover:scale-110 ${isShuffle ? 'text-primary' : 'text-muted hover:text-[var(--text-main)]'}`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button onClick={onPrev} className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110 active:scale-95">
            <SkipBack size={24} fill="currentColor" className="text-inherit" />
          </button>
          <button 
            onClick={onPlayPause}
            className="w-10 h-10 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button onClick={onNext} className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110 active:scale-95">
            <SkipForward size={24} fill="currentColor" className="text-inherit" />
          </button>
          <button className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110">
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-muted w-10 text-right font-mono">{formatTime(currentTime)}</span>
          <Slider value={progress} onChange={handleSeek} className="flex-1" />
          <span className="text-xs text-muted w-10 font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="flex items-center justify-end w-[30%] gap-4">
        <div className="flex items-center gap-2 group w-32">
          <button onClick={toggleMute} className="focus:outline-none">
            <VolumeIcon size={18} className={`transition-colors ${volume === 0 ? 'text-gray-500' : 'text-muted group-hover:text-[var(--text-main)]'}`} />
          </button>
          <Slider value={volume} onChange={handleVolumeChange} barColor="bg-muted group-hover:bg-primary" />
        </div>
        <button 
          onClick={onToggleFullScreen}
          className="text-muted hover:text-[var(--text-main)] transition-colors hover:scale-110"
          title={isFullScreen ? "Minimize" : "Full Screen"}
        >
          {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  );
};
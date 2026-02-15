import React, { useState, useEffect } from 'react';
import { Play, Music, Heart, Shuffle, RefreshCw, ArrowLeft, Edit2, Save, User as UserIcon, Camera, Disc, ListPlus, Minimize2, Mic2, Upload, Trash2 } from 'lucide-react';
import { Song, Playlist, ViewState } from '../types';
import { SongRow } from './SongRow';
import { Button } from './ui/Button';
import { storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface DashboardProps {
  view: ViewState;
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  songs: Song[];
  searchResults: Song[];
  likedSongIds: Set<string>;
  currentSong: Song | null;
  isPlaying: boolean;
  recentlyPlayed: Song[];
  recommendations: Song[];
  lastSearchQuery: string;
  userProfile?: { username: string, avatarUrl: string };
  onPlaySong: (song: Song, context?: Song[]) => void;
  onPlayPlaylist: (playlist: Playlist, shuffle?: boolean) => void;
  onViewPlaylist: (playlist: Playlist) => void;
  onToggleLike: (songId: string) => void;
  onAddToPlaylist: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
  onRefreshSuggestions: () => void;
  onBack: () => void;
  onUpdatePlaylistName?: (playlistId: string, newName: string) => void;
  onUpdateProfile?: (username: string, avatarUrl: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onRemoveSongFromPlaylist?: (playlistId: string, songId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  view,
  playlists, 
  selectedPlaylist,
  songs, 
  searchResults,
  likedSongIds,
  currentSong, 
  isPlaying, 
  recentlyPlayed,
  recommendations,
  lastSearchQuery,
  userProfile,
  onPlaySong,
  onPlayPlaylist,
  onViewPlaylist,
  onToggleLike,
  onAddToPlaylist,
  onAddToQueue,
  onRefreshSuggestions,
  onBack,
  onUpdatePlaylistName,
  onUpdateProfile,
  onDeletePlaylist,
  onRemoveSongFromPlaylist
}) => {
  
  // Profile State
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Playlist Edit State
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [tempPlaylistName, setTempPlaylistName] = useState('');

  // Now Playing State
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (view === ViewState.PROFILE && userProfile) {
      setProfileName(userProfile.username || '');
      setProfileAvatar(userProfile.avatarUrl || '');
    }
  }, [view, userProfile]);

  useEffect(() => {
    if (selectedPlaylist) {
      setTempPlaylistName(selectedPlaylist.name);
      setIsEditingPlaylist(false);
    }
  }, [selectedPlaylist]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      setIsSavingProfile(true);
      await onUpdateProfile(profileName, profileAvatar);
      setIsSavingProfile(false);
    }
  };

  const handleSavePlaylistName = () => {
    if (selectedPlaylist && onUpdatePlaylistName && tempPlaylistName.trim()) {
      onUpdatePlaylistName(selectedPlaylist.id, tempPlaylistName);
      setIsEditingPlaylist(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && auth.currentUser) {
       const file = e.target.files[0];
       setIsUploading(true);
       try {
          const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          setProfileAvatar(url);
       } catch (err) {
          console.error("Upload failed", err);
          alert("Failed to upload image.");
       } finally {
          setIsUploading(false);
       }
    }
  };

  const renderPlaylistCard = (playlist: Playlist, delay: number) => (
    <div 
      key={playlist.id}
      className="group relative glass-panel p-4 rounded-xl transition-all duration-300 cursor-pointer border border-transparent 
      hover:bg-white/10 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:border-primary/50 hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onViewPlaylist(playlist)}
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg bg-black/50">
        {playlist.coverUrl ? (
          <img 
            src={playlist.coverUrl} 
            alt={playlist.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
            <Music size={48} />
          </div>
        )}
        {/* Playback Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-3">
            <button 
                onClick={(e) => { e.stopPropagation(); onPlayPlaylist(playlist, false); }}
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:scale-110 hover:bg-primary-dark"
                title="Play"
            >
              <Play size={24} fill="white" className="ml-1 text-white" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onPlayPlaylist(playlist, true); }}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 hover:scale-110 hover:bg-gray-200"
                title="Shuffle Play"
            >
              <Shuffle size={20} className="text-black" />
            </button>
        </div>
        
        {/* Delete Button for User Playlists */}
        {!playlist.isSystem && onDeletePlaylist && (
            <button 
                onClick={(e) => { 
                   e.stopPropagation(); 
                   onDeletePlaylist(playlist.id); 
                }}
                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg transform scale-90 hover:scale-100 z-20"
                title="Delete Playlist"
            >
              <Trash2 size={16} />
            </button>
        )}
      </div>
      <h3 className="font-bold text-[var(--text-main)] mb-1 truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
      <p className="text-sm text-muted line-clamp-2">{playlist.description || `${playlist.songs.length} tracks`}</p>
    </div>
  );

  const renderSongList = (list: Song[], title: string, subtitle?: string, emptyMessage: string = "No songs found here yet.", isUserPlaylist: boolean = false) => (
    <section className="animate-fade-in">
       <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{title}</h2>
          {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-1">
        {list.length === 0 ? (
          <div className="text-center py-20 text-muted glass-panel rounded-xl">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          list.map((song, index) => (
            <SongRow
              key={`${song.id}-${index}`}
              song={song}
              index={index}
              isCurrent={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isLiked={likedSongIds.has(song.id)}
              onPlay={() => onPlaySong(song, list)}
              onToggleLike={() => onToggleLike(song.id)}
              onAddToPlaylist={() => onAddToPlaylist(song.id)}
              onAddToQueue={() => onAddToQueue(song)}
              onRemove={isUserPlaylist && onRemoveSongFromPlaylist && selectedPlaylist ? () => onRemoveSongFromPlaylist(selectedPlaylist.id, song.id) : undefined}
            />
          ))
        )}
      </div>
    </section>
  );

  if (view === ViewState.NOW_PLAYING && currentSong) {
    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden rounded-3xl animate-fade-in">
            {/* Back Button Top Left */}
            <button 
              onClick={onBack} 
              className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/20 hover:bg-black/40 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/5"
            >
               <ArrowLeft size={20} />
               <span>Back</span>
            </button>

            {/* Minimize Button Bottom Right */}
            <button 
              onClick={onBack}
              className="absolute bottom-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all hover:scale-110 border border-white/5 z-20 group shadow-lg"
              title="Minimize"
            >
               <Minimize2 size={24} className="text-white group-hover:text-primary" />
            </button>
            
            {/* Background Blur */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center blur-[100px] opacity-40 scale-125 transition-all duration-1000" 
              style={{backgroundImage: `url(${currentSong.coverUrl})`}}
            ></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center p-8 w-full max-w-2xl h-[calc(100%-80px)] justify-center">
                 <div className="relative group mb-10 w-full max-w-md aspect-square flex items-center justify-center">
                    {showLyrics ? (
                        <div className="w-full h-full rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-8 overflow-y-auto custom-scrollbar text-center shadow-2xl animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-6 sticky top-0 bg-transparent pb-4 border-b border-white/10">Lyrics</h3>
                            <p className="text-xl text-gray-200 leading-loose whitespace-pre-line font-medium">
                                {currentSong.lyrics ? currentSong.lyrics : 
                                "Lyrics not available for this track.\n\nBut feel the rhythm...\nThe beat...\nThe soul..."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={`absolute inset-0 rounded-full bg-black/50 blur-2xl transform scale-90 translate-y-4 -z-10 ${isPlaying ? 'animate-pulse-slow' : ''}`}></div>
                            <img 
                              src={currentSong.coverUrl} 
                              className={`w-full h-full rounded-2xl shadow-2xl object-cover border border-white/10 transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`} 
                              alt={currentSong.title}
                            />
                        </>
                    )}
                 </div>

                 <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight drop-shadow-md">
                      {currentSong.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-primary font-medium">{currentSong.artist}</p>
                    <p className="text-lg text-muted">{currentSong.album}</p>
                 </div>
                 
                 {/* Large Action Buttons */}
                 <div className="flex items-center gap-6 mt-10">
                    <button 
                      onClick={() => onToggleLike(currentSong.id)}
                      className={`p-4 rounded-full border border-white/10 backdrop-blur-md transition-all hover:scale-110 ${likedSongIds.has(currentSong.id) ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted hover:text-white'}`}
                      title="Like"
                    >
                       <Heart size={32} fill={likedSongIds.has(currentSong.id) ? "currentColor" : "none"} />
                    </button>
                    
                    <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className={`p-4 rounded-full border border-white/10 backdrop-blur-md transition-all hover:scale-110 ${showLyrics ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:text-white'}`}
                        title="Lyrics"
                    >
                        <Mic2 size={32} />
                    </button>

                    <button 
                      onClick={() => onAddToPlaylist(currentSong.id)}
                      className="p-4 rounded-full border border-white/10 bg-white/5 text-muted hover:text-white backdrop-blur-md transition-all hover:scale-110"
                      title="Add to Playlist"
                    >
                       <ListPlus size={32} />
                    </button>
                 </div>
            </div>
        </div>
    );
  }

  if (view === ViewState.PROFILE) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-6 animate-fade-in">User Profile</h2>
        
        <div className="glass-panel p-8 rounded-2xl animate-slide-up flex flex-col md:flex-row gap-8 items-start">
           {/* Avatar Section */}
           <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative group bg-black">
                 {profileAvatar ? (
                   <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                     <UserIcon size={64} className="text-white" />
                   </div>
                 )}
                 {/* Upload Overlay */}
                 <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                        <Upload size={24} className="text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-bold uppercase tracking-wider">Upload</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                 </label>
                 {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                       <RefreshCw size={24} className="text-white animate-spin" />
                    </div>
                 )}
              </div>
           </div>

           {/* Form Section */}
           <form onSubmit={handleSaveProfile} className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Username</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-black/10 border border-white/10 rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Avatar Image URL (Optional)</label>
                <div className="relative">
                   <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                   <input 
                    type="url" 
                    value={profileAvatar} 
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    className="w-full bg-black/10 border border-white/10 rounded-lg px-4 py-3 pl-10 text-[var(--text-main)] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="https://example.com/my-avatar.jpg"
                  />
                </div>
                <p className="text-xs text-muted">You can also upload an image by hovering over your profile picture.</p>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSavingProfile} className="w-full md:w-auto">
                   {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
           </form>
        </div>
      </div>
    );
  }

  if (view === ViewState.SEARCH) {
    return (
      <div className="space-y-10 pb-10">
        {renderSongList(searchResults, "Search Results", "Best matches", "No results found. Try searching for an artist or song name.")}
      </div>
    );
  }
  
  if (view === ViewState.YOUR_PLAYLISTS) {
    const userPlaylists = playlists.filter(p => !p.isSystem);
    return (
      <div className="space-y-10 pb-10">
        <section>
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-main)] tracking-tight animate-fade-in">Your Playlists</h2>
          {userPlaylists.length === 0 ? (
             <div className="glass-panel p-10 rounded-xl text-center space-y-4">
                 <Music size={48} className="mx-auto text-gray-500" />
                 <h3 className="text-xl font-bold">No playlists yet</h3>
                 <p className="text-muted">Create your first playlist to get started.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userPlaylists.map((playlist, idx) => renderPlaylistCard(playlist, idx * 50))}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (view === ViewState.LIBRARY) {
    return (
      <div className="space-y-10 pb-10">
        <section>
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-main)] tracking-tight animate-fade-in">Full Library</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist, idx) => renderPlaylistCard(playlist, idx * 50))}
          </div>
        </section>
      </div>
    );
  }

  if (view === ViewState.PLAYLIST && selectedPlaylist) {
    return (
      <div className="space-y-10 pb-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-[var(--text-main)] transition-colors mb-4 group"
        >
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           Back
        </button>

        <div className="flex items-end gap-8 mb-8 animate-slide-up glass-panel p-8 rounded-3xl relative overflow-hidden group">
           {/* Background blur effect from cover */}
           <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center blur-3xl transition-opacity duration-700" style={{ backgroundImage: `url(${selectedPlaylist.coverUrl})` }}></div>
           
           <div className="relative z-10 w-60 h-60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex-shrink-0">
              <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           </div>
           
           <div className="relative z-10 flex flex-col justify-end h-full flex-1">
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">Playlist</p>
              
              <div className="mb-4">
                {isEditingPlaylist && !selectedPlaylist.isSystem ? (
                   <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={tempPlaylistName}
                        onChange={(e) => setTempPlaylistName(e.target.value)}
                        className="text-5xl md:text-7xl font-extrabold text-[var(--text-main)] bg-transparent border-b-2 border-primary outline-none w-full max-w-2xl"
                        autoFocus
                        onBlur={handleSavePlaylistName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSavePlaylistName()}
                      />
                      <button onClick={handleSavePlaylistName} className="p-2 bg-primary rounded-full hover:bg-primary-dark">
                         <Save size={24} className="text-white" />
                      </button>
                   </div>
                ) : (
                  <div className="flex items-center gap-4 group/title">
                     <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--text-main)] tracking-tight shadow-black drop-shadow-lg truncate">
                       {selectedPlaylist.name}
                     </h1>
                     {!selectedPlaylist.isSystem && (
                        <button 
                          onClick={() => setIsEditingPlaylist(true)}
                          className="opacity-0 group-hover/title:opacity-100 text-muted hover:text-primary transition-opacity"
                          title="Rename Playlist"
                        >
                           <Edit2 size={24} />
                        </button>
                     )}
                  </div>
                )}
              </div>

              <p className="text-gray-300 font-medium text-lg mb-6 max-w-2xl text-shadow-sm">{selectedPlaylist.description}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                  <button 
                    onClick={() => onPlayPlaylist(selectedPlaylist, false)}
                    className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-4 font-bold text-lg flex items-center gap-2 shadow-neon hover:shadow-neon-hover transition-all hover:scale-105"
                  >
                     <Play size={24} fill="currentColor" /> Play
                  </button>
                  <button 
                     onClick={() => onPlayPlaylist(selectedPlaylist, true)}
                     className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full px-6 py-4 font-bold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
                  >
                     <Shuffle size={20} /> Shuffle
                  </button>

                  {!selectedPlaylist.isSystem && onDeletePlaylist && (
                     <button 
                        onClick={() => onDeletePlaylist(selectedPlaylist.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-full px-6 py-4 font-bold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 ml-auto"
                     >
                        <Trash2 size={20} /> Delete Playlist
                     </button>
                  )}
              </div>
           </div>
        </div>
        {renderSongList(selectedPlaylist.songs, "Tracks", `${selectedPlaylist.songs.length} songs`, "This playlist is empty. Add some songs!", !selectedPlaylist.isSystem)}
      </div>
    );
  }

  if (view === ViewState.LIKED) {
    const likedSongs = songs.filter(s => likedSongIds.has(s.id));
    return (
      <div className="space-y-10 pb-10">
        <div className="flex items-end gap-6 mb-8 animate-fade-in glass-panel p-6 rounded-2xl">
           <div className="w-52 h-52 bg-gradient-to-br from-indigo-500 to-purple-700 shadow-2xl rounded-xl flex items-center justify-center">
              <Heart size={80} fill="white" className="text-white drop-shadow-lg" />
           </div>
           <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">Playlist</p>
              <h1 className="text-6xl font-bold text-[var(--text-main)] mb-4">Liked Songs</h1>
              <p className="text-muted font-medium">{likedSongs.length} songs</p>
           </div>
        </div>
        {renderSongList(likedSongs, "")}
      </div>
    );
  }

  if (view === ViewState.DISCOVER) {
     const newReleases = playlists.filter(p => p.name.includes("Top") || p.name.includes("Hits"));
     const remaining = playlists.filter(p => !p.name.includes("Top") && !p.name.includes("Hits"));
     return (
        <div className="space-y-10 pb-10">
           <section>
              <h2 className="text-2xl font-bold mb-6 text-[var(--text-main)] tracking-tight">New Releases</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {newReleases.map((p, i) => renderPlaylistCard(p, i * 50))}
                 {remaining.slice(0, 2).map((p, i) => renderPlaylistCard(p, (i+2) * 50))}
              </div>
           </section>
           {renderSongList(songs.slice(0, 10), "Trending Now")}
        </div>
     );
  }
  
  if (view === ViewState.SUGGESTIONS) {
     return (
        <div className="space-y-10 pb-10">
           <div className="glass-panel p-8 rounded-2xl mb-8 border-l-4 border-primary flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Made For You</h2>
                <p className="text-muted">Based on your recent listening history.</p>
              </div>
              <button 
                onClick={onRefreshSuggestions}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                title="Refresh Suggestions"
              >
                  <RefreshCw size={24} className="text-[var(--text-main)] group-hover:rotate-180 transition-transform duration-500" />
              </button>
           </div>
           {renderSongList(songs, "Top Picks")}
        </div>
     );
  }

  // Home View - Categorized
  const featuredPlaylists = playlists.filter(p => p.isSystem).slice(0, 4);
  const genrePlaylists = playlists.filter(p => p.isSystem).slice(4);

  return (
    <div className="space-y-12 pb-10">
      <section>
        <h2 className="text-3xl font-bold mb-6 text-[var(--text-main)] tracking-tight animate-fade-in">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredPlaylists.length > 0 ? (
             featuredPlaylists.map((playlist, idx) => renderPlaylistCard(playlist, idx * 50))
          ) : (
            // Loading Skeletons
            Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl animate-pulse">
                    <div className="w-full aspect-square bg-white/5 rounded-lg mb-4"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
            ))
          )}
        </div>
      </section>

      {/* Recommendations based on search */}
      {recommendations.length > 0 && (
         renderSongList(recommendations, `Because you searched "${lastSearchQuery}"`, "Top matches for you")
      )}

      {/* Genres and Moods */}
      {genrePlaylists.length > 0 && (
        <section>
            <h2 className="text-2xl font-bold mb-6 text-[var(--text-main)] tracking-tight animate-fade-in">Moods & Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {genrePlaylists.map((playlist, idx) => renderPlaylistCard(playlist, idx * 50 + 200))}
            </div>
        </section>
      )}

      {/* Real Recently Played or Fallback to Trending */}
      {recentlyPlayed.length > 0 ? (
          renderSongList(recentlyPlayed, "Recently Played")
      ) : (
          renderSongList(songs.slice(0, 10), "Trending Now")
      )}
    </div>
  );
};
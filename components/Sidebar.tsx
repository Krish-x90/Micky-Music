import React from 'react';
import { Home, Compass, Library, PlusSquare, Heart, Sparkles, Music2, ListMusic, Trash2 } from 'lucide-react';
import { ViewState, Playlist } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onCreatePlaylist: () => void;
  playlists: Playlist[];
  onViewPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist?: (playlistId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  onCreatePlaylist, 
  playlists,
  onViewPlaylist,
  onDeletePlaylist
}) => {
  const menuItems = [
    { id: ViewState.HOME, label: 'Home', icon: Home },
    { id: ViewState.DISCOVER, label: 'Discover', icon: Compass },
    { id: ViewState.SUGGESTIONS, label: 'Suggestions', icon: Sparkles },
  ];

  const userPlaylists = playlists.filter(p => !p.isSystem);

  return (
    <div className="w-64 bg-background/50 backdrop-blur-xl h-full flex flex-col border-r border-white/5 pt-8 px-6 pb-24 overflow-y-auto hidden md:flex flex-shrink-0 z-10 relative">
      <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer group" onClick={() => onChangeView(ViewState.HOME)}>
        {/* Custom Logo Container */}
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all relative overflow-hidden">
             {/* Custom Headphone Logo SVG */}
             <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                {/* Headband */}
                <path d="M20 55C20 32 32 15 50 15C68 15 80 32 80 55" stroke="white" strokeWidth="8" strokeLinecap="round" />
                {/* Earcups - Main Body */}
                <rect x="10" y="50" width="24" height="36" rx="8" fill="white" />
                <rect x="66" y="50" width="24" height="36" rx="8" fill="white" />
                {/* Orange Accents (Side Detail) */}
                <path d="M6 58H10V78H6V58Z" fill="#F97316" />
                <path d="M90 58H94V78H90V58Z" fill="#F97316" />
             </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 group-hover:text-white transition-colors uppercase">
          MICKY MUSIC
        </h1>
      </div>

      <div className="space-y-8 flex-1">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Menu
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeView(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${isActive 
                        ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-primary/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-primary/5 animate-pulse-slow"></div>}
                    <Icon size={20} className={`${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'group-hover:text-white group-hover:scale-110 transition-transform'}`} />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Library
          </p>
          <ul className="space-y-1">
             <li>
              <button
                onClick={() => onChangeView(ViewState.YOUR_PLAYLISTS)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${currentView === ViewState.YOUR_PLAYLISTS
                    ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Music2 size={20} className={`group-hover:text-white group-hover:scale-110 transition-transform ${currentView === ViewState.YOUR_PLAYLISTS ? 'text-primary' : 'text-gray-400'}`} />
                <span className="font-medium">Your Playlists</span>
              </button>
            </li>
             <li>
              <button
                onClick={() => onChangeView(ViewState.LIBRARY)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${currentView === ViewState.LIBRARY
                    ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Library size={20} className={`group-hover:text-white group-hover:scale-110 transition-transform ${currentView === ViewState.LIBRARY ? 'text-primary' : 'text-gray-400'}`} />
                <span className="font-medium">Full Library</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onChangeView(ViewState.LIKED)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${currentView === ViewState.LIKED
                    ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Heart size={20} className={`group-hover:text-white group-hover:scale-110 transition-transform ${currentView === ViewState.LIKED ? 'text-primary fill-primary' : 'text-gray-400'}`} />
                <span className="font-medium">Liked Songs</span>
              </button>
            </li>
          </ul>
        </div>

        {/* User Playlists Section */}
        {userPlaylists.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
              <span>Playlists</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{userPlaylists.length}</span>
            </p>
            <ul className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {userPlaylists.map(playlist => (
                 <li key={playlist.id}>
                   <div className="w-full flex items-center gap-1 group/item">
                     <button
                       onClick={() => onViewPlaylist(playlist)}
                       className="flex-1 flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
                     >
                       <div className="flex items-center gap-3 overflow-hidden">
                         <ListMusic size={16} className="text-gray-600 group-hover/item:text-primary transition-colors flex-shrink-0" />
                         <span className="truncate">{playlist.name}</span>
                       </div>
                       <span className="text-[10px] text-gray-600 group-hover/item:text-gray-400 transition-colors flex-shrink-0">
                          {playlist.songs.length}
                       </span>
                     </button>
                     {onDeletePlaylist && (
                        <button
                           onClick={(e) => {
                               e.stopPropagation();
                               onDeletePlaylist(playlist.id);
                           }}
                           className="opacity-0 group-hover/item:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all rounded-lg hover:bg-white/10"
                           title="Delete Playlist"
                        >
                           <Trash2 size={14} />
                        </button>
                     )}
                   </div>
                 </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-white/5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
           <button 
            onClick={onCreatePlaylist}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-xl group"
           >
              <PlusSquare size={20} className="group-hover:text-primary transition-colors" />
              <span>Create Playlist</span>
           </button>
        </div>
      </div>
    </div>
  );
};
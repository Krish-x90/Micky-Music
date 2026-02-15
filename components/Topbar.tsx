import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Loader2, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';

interface TopbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onSearch: (query: string) => void;
  isLoggedIn: boolean;
  username?: string;
  isSearching?: boolean;
  onLogout?: () => void;
  onViewProfile: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onLoginClick, 
  onSignupClick, 
  onSearch,
  isLoggedIn, 
  username,
  isSearching,
  onLogout,
  onViewProfile,
  isDarkMode,
  onToggleTheme
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        onSearch(query);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Immediate search on Enter
      onSearch(query);
    }
  };

  return (
    <div className="h-20 w-full flex items-center justify-between px-8 sticky top-0 z-20 glass mb-6">
      <div className="flex-1 max-w-xl">
        <div 
          className={`relative flex items-center w-full rounded-full transition-all duration-300 border
            ${searchFocused 
              ? 'bg-card border-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
              : 'bg-white/5 border-transparent hover:bg-white/10'}`}
        >
          {isSearching ? (
             <Loader2 size={18} className="absolute left-4 text-primary animate-spin" />
          ) : (
             <Search 
              size={18} 
              className={`absolute left-4 transition-colors ${searchFocused ? 'text-primary' : 'text-muted'}`} 
            />
          )}
          
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search artists, songs, albums..." 
            className="w-full bg-transparent py-2.5 pl-12 pr-4 text-sm text-[var(--text-main)] placeholder-gray-500 focus:outline-none rounded-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <button 
          onClick={onToggleTheme}
          className="p-2 text-muted hover:text-[var(--text-main)] transition-colors rounded-full hover:bg-white/5"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
           {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {isLoggedIn ? (
          <>
            <div 
              className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group"
              onClick={onViewProfile}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:ring-2 ring-primary transition-all">
                <UserIcon size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium hover:text-primary transition-colors">{username || 'User'}</span>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-2 text-muted hover:text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onLoginClick}>Log In</Button>
            <Button variant="primary" onClick={onSignupClick}>Sign Up</Button>
          </>
        )}
      </div>
    </div>
  );
};
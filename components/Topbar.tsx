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
    <div className="flex flex-col w-full sticky top-0 z-20 glass mb-6">
        {/* Row 1: Logo/Title (Mobile) & Desktop Search & Actions */}
        <div className="h-16 md:h-20 w-full flex items-center justify-between px-4 md:px-8">
            
            {/* Mobile Title (Since Sidebar is hidden on mobile) */}
            <div className="md:hidden flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-neon">
                     <div className="w-4 h-4 bg-white rounded-sm"></div>
                 </div>
                 <h1 className="text-lg font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  MICKY
                </h1>
            </div>

            {/* Desktop Search (Hidden on Mobile) */}
            <div className="hidden md:block flex-1 max-w-xl">
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

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
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
                      className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-white/10 cursor-pointer group"
                      onClick={onViewProfile}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:ring-2 ring-primary transition-all">
                        <UserIcon size={14} className="text-white" />
                      </div>
                      <span className="text-sm font-medium hover:text-primary transition-colors hidden md:block">{username || 'User'}</span>
                    </div>
                    {onLogout && (
                      <button 
                        onClick={onLogout}
                        className="p-2 text-muted hover:text-red-500 transition-colors hidden md:block"
                        title="Log Out"
                      >
                        <LogOut size={20} />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" onClick={onLoginClick}>Log In</Button>
                        <Button variant="primary" onClick={onSignupClick}>Sign Up</Button>
                    </div>

                    {/* Mobile Combined Icon */}
                    <button 
                        onClick={onLoginClick}
                        className="md:hidden p-2 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                        <UserIcon size={20} />
                    </button>
                  </>
                )}
            </div>
        </div>

        {/* Row 2: Mobile Search Bar (Full Width) */}
        <div className="md:hidden px-4 pb-4 w-full">
            <div 
              className={`relative flex items-center w-full rounded-xl transition-all duration-300 border
                ${searchFocused 
                  ? 'bg-card border-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              {isSearching ? (
                 <Loader2 size={20} className="absolute left-4 text-primary animate-spin" />
              ) : (
                 <Search 
                  size={20} 
                  className={`absolute left-4 transition-colors ${searchFocused ? 'text-primary' : 'text-muted'}`} 
                />
              )}
              
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..." 
                className="w-full bg-transparent py-3 pl-12 pr-4 text-base text-[var(--text-main)] placeholder-gray-500 focus:outline-none rounded-xl"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
        </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { PlayerBar } from './components/PlayerBar';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { LogoutModal } from './components/LogoutModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { DeletePlaylistModal } from './components/DeletePlaylistModal';
import { ViewState, Song, Playlist, AuthMode } from './types';
import { searchSongs } from './api';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [previousView, setPreviousView] = useState<ViewState>(ViewState.HOME);
  
  // Data State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]); 
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  
  // Dynamic Home Content State
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [suggestions, setSuggestions] = useState<Song[]>([]); // "Made For You"
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeQueue, setActiveQueue] = useState<Song[]>([]); // New: Track context
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Playback Control State
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);

  // Search State
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal States
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPlaylistModalOpen, setPlaylistModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
  const [playlistToDeleteId, setPlaylistToDeleteId] = useState<string | null>(null);
  
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<string | null>(null);

  // User State
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Theme Management ---
  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- Auth Listener & Firestore Sync ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.displayName || user.email?.split('@')[0]);
        setAvatarUrl(user.photoURL || undefined);

        // --- Firestore Listeners ---
        const userDocRef = doc(db, 'users', user.uid);
        
        // 1. Sync User Profile Data
        getDoc(userDocRef).then((docSnap) => {
             if (docSnap.exists()) {
                 const data = docSnap.data();
                 if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
                 if (data.username) setUsername(data.username);
             }
        });

        // 2. Sync Liked Songs
        const unsubLiked = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.likedSongs && Array.isArray(data.likedSongs)) {
              setLikedSongIds(new Set(data.likedSongs));
            }
          }
        });

        // 3. Sync Playlists
        const playlistsCollectionRef = collection(db, 'users', user.uid, 'playlists');
        const unsubPlaylists = onSnapshot(playlistsCollectionRef, (snapshot) => {
           const userPlaylists: Playlist[] = snapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data()
           } as Playlist));
           
           setPlaylists(prev => {
             // Keep system playlists, replace user playlists
             const systemPlaylists = prev.filter(p => p.isSystem);
             return [...systemPlaylists, ...userPlaylists];
           });
        });

        return () => {
          unsubLiked();
          unsubPlaylists();
        };

      } else {
        setIsLoggedIn(false);
        setUsername(undefined);
        setAvatarUrl(undefined);
        setLikedSongIds(new Set());
        // Reset to only system playlists
        setPlaylists(prev => prev.filter(p => p.isSystem));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setIsLogoutModalOpen(false);
      // Reset view to Home on logout
      setCurrentView(ViewState.HOME);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfile = async (newUsername: string, newAvatarUrl: string) => {
      if (!auth.currentUser) return;
      
      try {
          await updateProfile(auth.currentUser, {
              displayName: newUsername,
              photoURL: newAvatarUrl
          });

          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, { 
              username: newUsername,
              avatarUrl: newAvatarUrl
          }, { merge: true });

          setUsername(newUsername);
          setAvatarUrl(newAvatarUrl);
          
          alert("Profile updated successfully!");
      } catch (e) {
          console.error("Error updating profile:", e);
          alert("Failed to update profile.");
      }
  };

  const handleUpdatePlaylistName = async (playlistId: string, newName: string) => {
    // Optimistic Update
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) return { ...p, name: newName };
        return p;
    }));
    if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(prev => prev ? { ...prev, name: newName } : null);
    }

    // Firestore Update
    if (isLoggedIn && auth.currentUser) {
        try {
            const playlistRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
            await updateDoc(playlistRef, { name: newName });
        } catch (e) {
            console.error("Error updating playlist name:", e);
        }
    }
  };
  
  const handleDeletePlaylistRequest = (playlistId: string) => {
    if (!isLoggedIn) return;
    setPlaylistToDeleteId(playlistId);
    setIsDeletePlaylistModalOpen(true);
  };

  const handleConfirmDeletePlaylist = async () => {
    if (!playlistToDeleteId || !isLoggedIn || !auth.currentUser) return;
    
    const playlistId = playlistToDeleteId;

    // Optimistic UI update
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    
    // If we are currently viewing the playlist we just deleted, go back to Your Playlists
    if (selectedPlaylist && selectedPlaylist.id === playlistId) {
            setSelectedPlaylist(null);
            setCurrentView(ViewState.YOUR_PLAYLISTS);
    }
    
    // Close modal immediately
    setIsDeletePlaylistModalOpen(false);
    setPlaylistToDeleteId(null);
    
    try {
        const playlistRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
        await deleteDoc(playlistRef);
    } catch(e) {
        console.error("Error deleting playlist from database:", e);
        // We could revert optimistic update here if needed, but simplistic error handling for now
        alert("Failed to delete playlist from server. It may reappear on refresh.");
    }
  };

  const handleRemoveSongFromPlaylist = async (playlistId: string, songId: string) => {
    if (!isLoggedIn || !auth.currentUser) return;

    // Optimistic UI Update
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
            const updatedSongs = p.songs.filter(s => s.id !== songId);
            return {
                ...p,
                songs: updatedSongs,
                description: `${updatedSongs.length} songs`
            };
        }
        return p;
    }));

    if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(prev => prev ? {
            ...prev,
            songs: prev.songs.filter(s => s.id !== songId),
            description: `${prev.songs.filter(s => s.id !== songId).length} songs`
        } : null);
    }

    try {
        const playlistRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
        const playlistDoc = await getDoc(playlistRef);
        if (playlistDoc.exists()) {
             const data = playlistDoc.data();
             const currentSongs = data.songs || [];
             const updatedSongs = currentSongs.filter((s: Song) => s.id !== songId);
             await updateDoc(playlistRef, { 
                 songs: updatedSongs,
                 description: `${updatedSongs.length} songs` 
             });
        }
    } catch(e) {
        console.error("Error removing song:", e);
    }
  };

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
         const results = await Promise.all([
             searchSongs("Trending India Top 50", 40),
             searchSongs("English Pop Hits 2024", 40),
             searchSongs("Phonk Playlist", 40),
             searchSongs("Bollywood Romance", 40),
             searchSongs("Party Dance Songs", 40),
             searchSongs("Lofi Study Beats", 40),
             searchSongs("Classic Rock Legends", 40),
             searchSongs("EDM Festival Hits", 40),
             searchSongs("NCS Gaming Music", 40),
             searchSongs("Jazz Classics", 40)
         ]);

         const [india, global, phonk, romantic, party, lofi, rock, edm, gaming, jazz] = results;

         const createPlaylist = (id: string, name: string, desc: string, songs: Song[]): Playlist => ({
             id, name, description: desc, songs, isSystem: true,
             coverUrl: songs[0]?.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'
         });

         const newPlaylists = [
             createPlaylist('p_india', 'Bollywood Top 50', 'The hottest tracks from India.', india),
             createPlaylist('p_global', 'International Hits', 'Top English and Pop hits.', global),
             createPlaylist('p_phonk', 'Phonk Drift', 'High energy drift phonk beats.', phonk),
             createPlaylist('p_romantic', 'Romantic Vibes', 'Love is in the air.', romantic),
             createPlaylist('p_party', 'Party Starters', 'Get the floor moving.', party),
             createPlaylist('p_lofi', 'Lo-Fi Study', 'Chill beats for focus.', lofi),
             createPlaylist('p_rock', 'Classic Rock', 'Timeless legends.', rock),
             createPlaylist('p_edm', 'EDM Festival', 'Big room house and drops.', edm),
             createPlaylist('p_gaming', 'Gaming Zone', 'Dubstep and Trap for gaming.', gaming),
             createPlaylist('p_jazz', 'Smooth Jazz', 'Relaxing instrumental vibes.', jazz),
         ].filter(p => p.songs.length > 5); 

         setPlaylists(prev => {
           const userPlaylists = prev.filter(p => !p.isSystem);
           return [...newPlaylists, ...userPlaylists];
         });
         
         const combined = newPlaylists.flatMap(p => p.songs);
         const uniqueSongs = Array.from(new Map(combined.map(s => [s.id, s])).values());
         setAllSongs(uniqueSongs);
         
         setSuggestions(uniqueSongs.sort(() => Math.random() - 0.5).slice(0, 15));

         if (uniqueSongs.length > 0) {
             setCurrentSong(uniqueSongs[0]);
             setActiveQueue(uniqueSongs);
         }
      } catch (e) {
         console.error("Initial fetch failed", e);
      }
    };

    fetchInitialData();
  }, []);

  const handleRefreshSuggestions = () => {
     if (allSongs.length > 0) {
         setSuggestions([...allSongs].sort(() => Math.random() - 0.5).slice(0, 15));
     }
  };

  // --- Audio Handlers ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (!audio.src || audio.src === window.location.href) return;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'AbortError') return;
          console.log("Playback prevented:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.pause();

    if (!currentSong.audioUrl) {
        setIsPlaying(false);
        return;
    }

    audio.src = currentSong.audioUrl;
    audio.load();
    
    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name === 'AbortError') return;
            if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                 setIsPlaying(false);
            }
          });
        }
    }
  }, [currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSongEnd = () => handleNext();

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // --- Handlers ---

  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    setCurrentView(ViewState.SEARCH);
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
      setLastSearchQuery(query);
      if (results.length > 0) {
          const topMatch = results[0];
          const mainArtist = topMatch.artist.split(',')[0].split('&')[0].trim();
          if (!query.toLowerCase().includes(mainArtist.toLowerCase())) {
              try {
                  const relatedSongs = await searchSongs(`${mainArtist} hits`);
                  const filteredRecommendations = relatedSongs.filter(s => s.id !== topMatch.id);
                  setRecommendations(filteredRecommendations.slice(0, 15));
              } catch (e) {
                  setRecommendations(results.slice(0, 15));
              }
          } else {
              setRecommendations(results.slice(0, 15));
          }
      } else {
        setRecommendations([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = (song: Song, context?: Song[]) => {
    setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 20);
    });

    if (context) setActiveQueue(context);

    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist, shuffle: boolean = false) => {
    if (playlist.songs.length > 0) {
      setActiveQueue(playlist.songs);
      setIsShuffle(shuffle);
      if (shuffle) {
         const randomIdx = Math.floor(Math.random() * playlist.songs.length);
         setCurrentSong(playlist.songs[randomIdx]);
         setRecentlyPlayed(prev => [playlist.songs[randomIdx], ...prev.filter(s => s.id !== playlist.songs[randomIdx].id)].slice(0, 20));
      } else {
         setCurrentSong(playlist.songs[0]);
         setRecentlyPlayed(prev => [playlist.songs[0], ...prev.filter(s => s.id !== playlist.songs[0].id)].slice(0, 20));
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentSong(nextSong);
      setIsPlaying(true);
      return;
    }

    if (!currentSong) return;
    
    let contextList = activeQueue.length > 0 ? activeQueue : (currentView === ViewState.SEARCH ? searchResults : allSongs);
    if (contextList.length === 0) contextList = allSongs;
    if (contextList.length === 0) return;

    if (isShuffle) {
      const candidates = contextList.filter(s => s.id !== currentSong.id);
      const pool = candidates.length > 0 ? candidates : contextList;
      const sameArtistSongs = pool.filter(s => s.artist === currentSong.artist);
      
      if (sameArtistSongs.length > 0 && Math.random() < 0.25) {
          const randomIndex = Math.floor(Math.random() * sameArtistSongs.length);
          setCurrentSong(sameArtistSongs[randomIndex]);
      } else {
          const randomIndex = Math.floor(Math.random() * pool.length);
          setCurrentSong(pool[randomIndex]);
      }
    } else {
      const currentIndex = contextList.findIndex(s => s.id === currentSong.id);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % contextList.length;
      setCurrentSong(contextList[nextIndex]);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!currentSong) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let contextList = activeQueue.length > 0 ? activeQueue : (currentView === ViewState.SEARCH ? searchResults : allSongs);
    if (contextList.length === 0) contextList = allSongs;
    if (contextList.length === 0) return;

    if (isShuffle) {
       const randomIndex = Math.floor(Math.random() * contextList.length);
       setCurrentSong(contextList[randomIndex]);
    } else {
       const currentIndex = contextList.findIndex(s => s.id === currentSong.id);
       const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + contextList.length) % contextList.length;
       setCurrentSong(contextList[prevIndex]);
    }
    setIsPlaying(true);
  };

  const handleAddToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const handleToggleLike = async (songId?: string) => {
    // Auth Gate
    if (!isLoggedIn) {
        setAuthMode(AuthMode.LOGIN);
        setAuthModalOpen(true);
        return;
    }

    // If songId is passed (from list/row), use it. Otherwise use currentSong (from player bar).
    const targetId = songId || currentSong?.id;
    if (!targetId) return;

    // Determine current state
    const isCurrentlyLiked = likedSongIds.has(targetId);

    // Optimistic UI Update
    setLikedSongIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(targetId);
      else next.add(targetId);
      return next;
    });

    // Firestore Sync
    if (auth.currentUser) {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                let likes: string[] = data.likedSongs || [];
                
                if (isCurrentlyLiked) {
                    // Remove
                    likes = likes.filter((id: string) => id !== targetId);
                } else {
                    // Add if not exists
                    if (!likes.includes(targetId)) likes.push(targetId);
                }
                await updateDoc(userRef, { likedSongs: likes });
            } else {
                // Create doc if missing
                await setDoc(userRef, { likedSongs: [targetId] }, { merge: true });
            }
        } catch (e) {
            console.error("Error updating liked songs:", e);
            // Revert on error
            setLikedSongIds(prev => {
                const next = new Set(prev);
                if (isCurrentlyLiked) next.add(targetId);
                else next.delete(targetId);
                return next;
            });
        }
    }
  };

  const openAddToPlaylistModal = (songId: string) => {
    // Auth Gate
    if (!isLoggedIn) {
        setAuthMode(AuthMode.LOGIN);
        setAuthModalOpen(true);
        return;
    }

    setSongToAddToPlaylist(songId);
    setPlaylistModalOpen(true);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!songToAddToPlaylist) return;
    
    const songToAdd = allSongs.find(s => s.id === songToAddToPlaylist) || searchResults.find(s => s.id === songToAddToPlaylist);

    if (songToAdd) {
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId && !p.songs.find(s => s.id === songToAdd.id)) {
               const newSongs = [...p.songs, songToAdd];
               return { 
                   ...p, 
                   songs: newSongs,
                   description: `${newSongs.length} songs`
               };
          }
          return p;
        }));

        if (isLoggedIn && auth.currentUser) {
            try {
                const playlistRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
                const playlistDoc = await getDoc(playlistRef);
                if (playlistDoc.exists()) {
                    const data = playlistDoc.data();
                    const currentSongs = data.songs || [];
                    if (!currentSongs.find((s: Song) => s.id === songToAdd.id)) {
                         const updatedSongs = [...currentSongs, songToAdd];
                         await updateDoc(playlistRef, { 
                             songs: updatedSongs,
                             description: `${updatedSongs.length} songs`
                         });
                    }
                }
            } catch (e) {
                console.error("Error adding to playlist:", e);
            }
        }
    }
    setSongToAddToPlaylist(null);
  };

  const handleViewPlaylist = (playlist: Playlist) => {
    setPreviousView(currentView);
    setSelectedPlaylist(playlist);
    setCurrentView(ViewState.PLAYLIST);
  };
  
  const handleViewProfile = () => {
    setPreviousView(currentView);
    setCurrentView(ViewState.PROFILE);
  };
  
  const handleToggleNowPlaying = () => {
    if (currentView === ViewState.NOW_PLAYING) {
       setCurrentView(previousView);
    } else {
       setPreviousView(currentView);
       setCurrentView(ViewState.NOW_PLAYING);
    }
  };

  const handleBack = () => {
    setCurrentView(previousView);
  };

  const handleCreatePlaylistSimple = async (name: string) => {
    if (!isLoggedIn) return;

    const newPlaylistId = `u-${Date.now()}`;
    let initialSongs: Song[] = [];
    let coverUrl = '';

    if (songToAddToPlaylist) {
       const songToAdd = allSongs.find(s => s.id === songToAddToPlaylist) || searchResults.find(s => s.id === songToAddToPlaylist);
       if (songToAdd) {
          initialSongs.push(songToAdd);
          coverUrl = songToAdd.coverUrl;
       }
    }

    const newPlaylist: Playlist = {
      id: newPlaylistId,
      name,
      description: `${initialSongs.length} songs`,
      coverUrl,
      songs: initialSongs,
      isSystem: false
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    
    if (auth.currentUser) {
        try {
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'playlists', newPlaylist.id), {
                name: newPlaylist.name,
                description: newPlaylist.description,
                coverUrl: newPlaylist.coverUrl,
                songs: newPlaylist.songs,
                isSystem: false,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error creating playlist:", e);
        }
    }

    if (songToAddToPlaylist) {
       setSongToAddToPlaylist(null);
       setPlaylistModalOpen(false);
    }
  };

  const handleCreatePlaylistWithSongs = async (name: string, selectedSongIds: string[]) => {
    const selectedSongs = allSongs.filter(s => selectedSongIds.includes(s.id));
    
    const newPlaylist: Playlist = {
      id: `u-${Date.now()}`,
      name,
      description: `${selectedSongs.length} songs`,
      coverUrl: selectedSongs.length > 0 ? selectedSongs[0].coverUrl : '',
      songs: selectedSongs,
      isSystem: false
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setCurrentView(ViewState.LIBRARY); 

    if (isLoggedIn && auth.currentUser) {
        try {
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'playlists', newPlaylist.id), {
                name: newPlaylist.name,
                description: newPlaylist.description,
                coverUrl: newPlaylist.coverUrl,
                songs: newPlaylist.songs,
                isSystem: false,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error creating playlist with songs:", e);
        }
    }
  };
  
  const handleCreatePlaylistFromSidebar = () => {
     if (!isLoggedIn) {
        setAuthMode(AuthMode.LOGIN);
        setAuthModalOpen(true);
        return;
     }
     setCreatePlaylistModalOpen(true);
  };

  const openLogin = () => { setAuthMode(AuthMode.LOGIN); setAuthModalOpen(true); };
  const openSignup = () => { setAuthMode(AuthMode.SIGNUP); setAuthModalOpen(true); };
  const handleLoginSuccess = (user: string) => { 
     // Modal closes automatically via auth listener
  };

  return (
    <div className="flex h-screen bg-background text-[var(--text-main)] overflow-hidden font-sans selection:bg-primary selection:text-white transition-colors duration-300">
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
        onError={handleAudioError}
      />

      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onCreatePlaylist={handleCreatePlaylistFromSidebar}
        playlists={playlists}
        onViewPlaylist={handleViewPlaylist}
        onDeletePlaylist={handleDeletePlaylistRequest}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col h-full overflow-y-auto scroll-smooth custom-scrollbar">
          <Topbar 
            onLoginClick={openLogin}
            onSignupClick={openSignup}
            onSearch={handleSearch}
            isLoggedIn={isLoggedIn}
            username={username}
            isSearching={isSearching}
            onLogout={handleLogoutClick}
            onViewProfile={handleViewProfile}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
          
          <div className="px-8 pb-32 flex-1">
             <Dashboard 
               view={currentView}
               playlists={playlists}
               selectedPlaylist={selectedPlaylist}
               songs={suggestions}
               searchResults={searchResults}
               likedSongIds={likedSongIds}
               currentSong={currentSong}
               isPlaying={isPlaying}
               recentlyPlayed={recentlyPlayed}
               recommendations={recommendations}
               lastSearchQuery={lastSearchQuery}
               userProfile={{ username: username || '', avatarUrl: avatarUrl || '' }}
               onPlaySong={handlePlaySong}
               onPlayPlaylist={handlePlayPlaylist}
               onViewPlaylist={handleViewPlaylist}
               onToggleLike={handleToggleLike}
               onAddToPlaylist={openAddToPlaylistModal}
               onAddToQueue={handleAddToQueue}
               onRefreshSuggestions={handleRefreshSuggestions}
               onBack={handleBack}
               onUpdatePlaylistName={handleUpdatePlaylistName}
               onUpdateProfile={handleUpdateProfile}
               onDeletePlaylist={handleDeletePlaylistRequest}
               onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
             />
          </div>
        </div>
      </main>

      <PlayerBar 
        currentSong={currentSong}
        isPlaying={isPlaying}
        isShuffle={isShuffle}
        isLiked={currentSong ? likedSongIds.has(currentSong.id) : false}
        isFullScreen={currentView === ViewState.NOW_PLAYING}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleLike={() => handleToggleLike()}
        onAddToPlaylist={() => currentSong && openAddToPlaylistModal(currentSong.id)}
        onAddToQueue={() => currentSong && handleAddToQueue(currentSong)}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleFullScreen={handleToggleNowPlaying}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLogin={handleLoginSuccess}
      />

      <LogoutModal 
         isOpen={isLogoutModalOpen}
         onClose={() => setIsLogoutModalOpen(false)}
         onConfirm={handleLogoutConfirm}
      />

      <DeletePlaylistModal
        isOpen={isDeletePlaylistModalOpen}
        onClose={() => setIsDeletePlaylistModalOpen(false)}
        onConfirm={handleConfirmDeletePlaylist}
        playlistName={playlists.find(p => p.id === playlistToDeleteId)?.name}
      />

      <AddToPlaylistModal 
         isOpen={isPlaylistModalOpen}
         onClose={() => setPlaylistModalOpen(false)}
         playlists={playlists}
         onAddToPlaylist={handleAddToPlaylist}
         onCreatePlaylist={handleCreatePlaylistSimple}
      />

      <CreatePlaylistModal 
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setCreatePlaylistModalOpen(false)}
        allSongs={allSongs}
        onCreate={handleCreatePlaylistWithSongs}
      />
    </div>
  );
};

export default App;
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  audioUrl?: string; // URL for the audio file
  lyrics?: string; // Optional lyrics field
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  description: string;
  songs: Song[];
  isSystem?: boolean; // To distinguish user created vs system playlists
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export enum ViewState {
  HOME = 'HOME',
  DISCOVER = 'DISCOVER',
  SUGGESTIONS = 'SUGGESTIONS',
  LIBRARY = 'LIBRARY',
  YOUR_PLAYLISTS = 'YOUR_PLAYLISTS',
  LIKED = 'LIKED',
  SEARCH = 'SEARCH',
  PLAYLIST = 'PLAYLIST',
  PROFILE = 'PROFILE',
  NOW_PLAYING = 'NOW_PLAYING'
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
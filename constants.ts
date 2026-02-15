import { Song, Playlist } from './types';

// Using a royalty-free sample URL for testing purposes
const SAMPLE_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://picsum.photos/200/200?random=1',
    duration: 243,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    coverUrl: 'https://picsum.photos/200/200?random=2',
    duration: 230,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '3',
    title: 'Neon Lights',
    artist: 'Demi Lovato',
    album: 'Demi',
    coverUrl: 'https://picsum.photos/200/200?random=3',
    duration: 210,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '4',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://picsum.photos/200/200?random=4',
    duration: 200,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '5',
    title: 'Cyberpunk Theme',
    artist: 'Various Artists',
    album: 'OST',
    coverUrl: 'https://picsum.photos/200/200?random=5',
    duration: 185,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '6',
    title: 'Nightcall',
    artist: 'Kavinsky',
    album: 'OutRun',
    coverUrl: 'https://picsum.photos/200/200?random=6',
    duration: 258,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '7',
    title: 'Technologic',
    artist: 'Daft Punk',
    album: 'Human After All',
    coverUrl: 'https://picsum.photos/200/200?random=7',
    duration: 284,
    audioUrl: SAMPLE_AUDIO_URL
  },
  {
    id: '8',
    title: 'Instant Crush',
    artist: 'Daft Punk ft. Julian Casablancas',
    album: 'RAM',
    coverUrl: 'https://picsum.photos/200/200?random=8',
    duration: 337,
    audioUrl: SAMPLE_AUDIO_URL
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Synthwave Essentials',
    description: 'Retro futuristic sounds for your night drive.',
    coverUrl: 'https://picsum.photos/300/300?random=10',
    songs: [MOCK_SONGS[0], MOCK_SONGS[4], MOCK_SONGS[5]],
    isSystem: true
  },
  {
    id: 'p2',
    name: 'Deep Focus',
    description: 'Ambient tracks to help you concentrate.',
    coverUrl: 'https://picsum.photos/300/300?random=11',
    songs: [MOCK_SONGS[1], MOCK_SONGS[2]],
    isSystem: true
  },
  {
    id: 'p3',
    name: 'Neon Nights',
    description: 'High energy tracks for the party.',
    coverUrl: 'https://picsum.photos/300/300?random=12',
    songs: [MOCK_SONGS[2], MOCK_SONGS[3], MOCK_SONGS[6]],
    isSystem: true
  },
  {
    id: 'p4',
    name: 'Workout Pump',
    description: 'Get your heart rate up.',
    coverUrl: 'https://picsum.photos/300/300?random=13',
    songs: [MOCK_SONGS[3], MOCK_SONGS[0], MOCK_SONGS[7]],
    isSystem: true
  }
];

export const DISCOVER_PLAYLISTS: Playlist[] = [
  {
    id: 'd1',
    name: 'New Releases Radar',
    description: 'Fresh tracks just for you.',
    coverUrl: 'https://picsum.photos/300/300?random=20',
    songs: [MOCK_SONGS[5], MOCK_SONGS[6], MOCK_SONGS[7]],
    isSystem: true
  },
  {
    id: 'd2',
    name: 'Underground Hits',
    description: 'What\'s trending in the underground scene.',
    coverUrl: 'https://picsum.photos/300/300?random=21',
    songs: [MOCK_SONGS[4], MOCK_SONGS[1]],
    isSystem: true
  }
];

export const RECENTLY_PLAYED = MOCK_SONGS.slice(0, 4);
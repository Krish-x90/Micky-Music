import { Song } from './types';

interface SaavnSong {
  id: string;
  name: string;
  primaryArtists: string;
  album: { name: string } | string;
  image: { link?: string; url?: string; quality: string }[] | string;
  duration: string | number;
  downloadUrl: { link?: string; url?: string; quality: string }[] | string;
}

export const searchSongs = async (query: string, limit: number = 20): Promise<Song[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();
    const results: SaavnSong[] = json.data?.results || [];

    return results.map((item) => {
        // Helper to extract URL from array or string
        const getUrl = (source: any, qualityPreference?: string) => {
            if (typeof source === 'string') return source;
            if (Array.isArray(source) && source.length > 0) {
                if (qualityPreference) {
                    const match = source.find(s => s.quality && s.quality.includes(qualityPreference));
                    if (match) return match.link || match.url;
                }
                // Fallback to the last item (usually highest quality) or first
                const last = source[source.length - 1];
                return last?.link || last?.url || source[0]?.link || source[0]?.url;
            }
            return '';
        };

        // Handle Image Parsing (Try 500x500, then fallback)
        let imageUrl = getUrl(item.image, '500');
        if (!imageUrl) imageUrl = getUrl(item.image, '150');
        if (!imageUrl) imageUrl = getUrl(item.image);

        // Handle Audio URL Parsing (Try 320kbps, then 160kbps)
        let audioUrl = getUrl(item.downloadUrl, '320');
        if (!audioUrl) audioUrl = getUrl(item.downloadUrl, '160');
        if (!audioUrl) audioUrl = getUrl(item.downloadUrl);

        // Handle Album Name Parsing
        let albumName = 'Unknown Album';
        if (typeof item.album === 'string') {
          albumName = item.album;
        } else if (typeof item.album === 'object' && item.album !== null) {
          albumName = item.album.name || 'Unknown Album';
        }

        // Handle Title Parsing (Decode HTML entities)
        const title = item.name 
             ? item.name.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&") 
             : 'Unknown Title';

        const artist = item.primaryArtists || 'Unknown Artist';

        // Ensure HTTPS to prevent Mixed Content warnings
        if (imageUrl && imageUrl.startsWith('http:')) imageUrl = imageUrl.replace('http:', 'https:');
        if (audioUrl && audioUrl.startsWith('http:')) audioUrl = audioUrl.replace('http:', 'https:');

        // Parse Duration (API usually returns seconds)
        let duration = 0;
        if (typeof item.duration === 'string') {
            duration = parseInt(item.duration, 10);
        } else if (typeof item.duration === 'number') {
            duration = item.duration;
        }
        if (isNaN(duration)) duration = 0;

        return {
          id: item.id,
          title,
          artist,
          album: albumName,
          coverUrl: imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60', // Fallback image
          duration,
          audioUrl: audioUrl
        };
    }).filter(song => song.audioUrl); // Filter out songs without audio
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
};
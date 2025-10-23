/**
 * Music Search & Information API
 * GET/POST /music?query=song name&type=search
 * GET/POST /music?artist=artist name&type=artist
 */

module.exports = async (req, res) => {
    try {
        const { 
            query,
            artist,
            album,
            type = 'search',
            limit = 20,
            genre
        } = req.query;

        let results;

        switch (type) {
            case 'search':
                if (!query) {
                    return res.status(400).json({
                        success: false,
                        error: 'Query parameter is required for search'
                    });
                }
                results = searchMusic(query, parseInt(limit));
                break;

            case 'artist':
                if (!artist) {
                    return res.status(400).json({
                        success: false,
                        error: 'Artist parameter is required'
                    });
                }
                results = getArtistInfo(artist);
                break;

            case 'album':
                if (!album) {
                    return res.status(400).json({
                        success: false,
                        error: 'Album parameter is required'
                    });
                }
                results = getAlbumInfo(album, artist);
                break;

            case 'trending':
                results = getTrendingMusic(parseInt(limit));
                break;

            case 'genre':
                if (!genre) {
                    return res.status(400).json({
                        success: false,
                        error: 'Genre parameter is required'
                    });
                }
                results = getMusicByGenre(genre, parseInt(limit));
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid type. Use: search, artist, album, trending, or genre'
                });
        }

        res.json({
            success: true,
            type: type,
            data: results,
            message: `Music ${type} completed successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function searchMusic(query, limit) {
    const songs = [];
    const artists = ['The Weeknd', 'Taylor Swift', 'Drake', 'Ed Sheeran', 'Ariana Grande', 'Post Malone'];
    const genres = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Country'];

    for (let i = 0; i < limit; i++) {
        const artist = artists[Math.floor(Math.random() * artists.length)];
        songs.push({
            id: `song_${generateId()}`,
            title: `$${query}$$ {i + 1}`,
            artist: artist,
            album: `Album ${i + 1}`,
            duration: generateDuration(),
            durationSeconds: Math.floor(Math.random() * 300) + 120,
            genre: genres[Math.floor(Math.random() * genres.length)],
            releaseDate: generateRandomDate(),
            coverArt: `https://via.placeholder.com/300x300?text=${encodeURIComponent(query)}`,
            playCount: Math.floor(Math.random() * 10000000),
            likes: Math.floor(Math.random() * 1000000),
            explicit: Math.random() > 0.7,
            previewUrl: `https://example.com/preview/${generateId()}.mp3`,
            streamUrl: `https://example.com/stream/${generateId()}`,
            downloadUrl: `https://example.com/download/${generateId()}.mp3`,
            isrc: generateISRC(),
            bpm: Math.floor(Math.random() * 100) + 80,
            key: getRandomKey(),
            popularity: Math.floor(Math.random() * 100)
        });
    }

    return {
        query: query,
        totalResults: songs.length,
        songs: songs
    };
}

function getArtistInfo(artistName) {
    const genres = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic'];
    const topSongs = [];
    
    for (let i = 0; i < 10; i++) {
        topSongs.push({
            id: `song_${generateId()}`,
            title: `Top Song ${i + 1}`,
            album: `Album ${i + 1}`,
            duration: generateDuration(),
            playCount: Math.floor(Math.random() * 5000000),
            releaseDate: generateRandomDate()
        });
    }

    return {
        name: artistName,
        id: `artist_${generateId()}`,
        image: `https://via.placeholder.com/400x400?text=${encodeURIComponent(artistName)}`,
        bio: `${artistName} is a renowned artist known for amazing music.`,
        genres: genres.slice(0, Math.floor(Math.random() * 3) + 1),
        followers: Math.floor(Math.random() * 10000000),
        verified: true,
        monthlyListeners: Math.floor(Math.random() * 50000000),
        topSongs: topSongs,
        albums: Math.floor(Math.random() * 20) + 5,
        socialMedia: {
            instagram: `@${artistName.toLowerCase().replace(/\s+/g, '')}`,
            twitter: `@${artistName.toLowerCase().replace(/\s+/g, '')}`,
            facebook: artistName
        },
        similar: ['Artist 1', 'Artist 2', 'Artist 3']
    };
}

function getAlbumInfo(albumName, artistName) {
    const tracks = [];
    const trackCount = Math.floor(Math.random() * 15) + 8;

    for (let i = 0; i < trackCount; i++) {
        tracks.push({
            trackNumber: i + 1,
            title: `Track ${i + 1}`,
            duration: generateDuration(),
            explicit: Math.random() > 0.8,
            previewUrl: `https://example.com/preview/${generateId()}.mp3`
        });
    }

    const totalDuration = tracks.reduce((sum, track) => {
        const [min, sec] = track.duration.split(':').map(Number);
        return sum + min * 60 + sec;
    }, 0);

    return {
        name: albumName,
        artist: artistName || 'Various Artists',
        id: `album_${generateId()}`,
        coverArt: `https://via.placeholder.com/600x600?text=${encodeURIComponent(albumName)}`,
        releaseDate: generateRandomDate(),
        totalTracks: trackCount,
        duration: formatSeconds(totalDuration),
        genre: 'Pop',
        label: 'Record Label',
        type: 'Album',
        tracks: tracks,
        popularity: Math.floor(Math.random() * 100)
    };
}

function getTrendingMusic(limit) {
    return searchMusic('Trending', limit);
}

function getMusicByGenre(genre, limit) {
    const results = searchMusic(genre, limit);
    results.genre = genre;
    results.songs = results.songs.map(song => ({
        ...song,
        genre: genre
    }));
    return results;
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

function generateDuration() {
    const minutes = Math.floor(Math.random() * 5) + 2;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function generateRandomDate() {
    const start = new Date(2015, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function generateISRC() {
    const country = 'US';
    const registrant = Math.random().toString(36).substring(2, 5).toUpperCase();
    const year = String(new Date().getFullYear()).slice(-2);
    const designation = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    return `$${country}$$ {registrant}$${year}$$ {designation}`;
}

function getRandomKey() {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const mode = Math.random() > 0.5 ? 'Major' : 'Minor';
    return `${keys[Math.floor(Math.random() * keys.length)]} ${mode}`;
}

function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

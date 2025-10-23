/**
 * YouTube Search API
 * GET/POST /ytsearch?query=songs&limit=10&type=video
 */

module.exports = async (req, res) => {
    try {
        const { 
            query, 
            limit = 10, 
            type = 'video',
            order = 'relevance',
            duration = 'any'
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required'
            });
        }

        const maxLimit = Math.min(Math.max(parseInt(limit), 1), 50);

        // Simulated search results (In production, use YouTube Data API v3)
        const results = generateYouTubeResults(query, maxLimit, type);

        res.json({
            success: true,
            data: {
                query: query,
                type: type,
                totalResults: results.length,
                results: results,
                filters: {
                    order: order,
                    duration: duration
                },
                pagination: {
                    currentPage: 1,
                    totalPages: Math.ceil(results.length / 10),
                    hasMore: false
                }
            },
            message: `Found ${results.length} results for "${query}"`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generateYouTubeResults(query, limit, type) {
    const results = [];
    const videoTitles = [
        `${query} - Official Music Video`,
        `Best ${query} Compilation`,
        `${query} (Official Audio)`,
        `${query} Live Performance`,
        `${query} - Full Album`,
        `Top 10 ${query}`,
        `${query} Playlist 2024`,
        `${query} Mix - Best Songs`,
        `${query} - Extended Version`,
        `${query} Tutorial`
    ];

    const channels = ['MusicVEVO', 'OfficialChannel', 'TopMusic', 'BestVideos', 'MusicWorld'];

    for (let i = 0; i < limit; i++) {
        const videoId = generateVideoId();
        const title = videoTitles[i % videoTitles.length];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const views = Math.floor(Math.random() * 10000000) + 1000;
        const duration = generateDuration();

        results.push({
            videoId: videoId,
            title: title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: {
                default: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
                medium: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                high: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            },
            channel: {
                name: channel,
                id: generateChannelId(),
                url: `https://www.youtube.com/channel/${generateChannelId()}`,
                verified: Math.random() > 0.5
            },
            description: `This is a great video about ${query}. Watch now!`,
            duration: duration,
            durationSeconds: parseDurationToSeconds(duration),
            views: views,
            viewsFormatted: formatViews(views),
            likes: Math.floor(views * 0.05),
            publishedAt: generateRandomDate(),
            type: type,
            uploadDate: generateRandomDate()
        });
    }

    return results;
}

function generateVideoId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = '';
    for (let i = 0; i < 11; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateChannelId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = 'UC';
    for (let i = 0; i < 22; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateDuration() {
    const minutes = Math.floor(Math.random() * 10) + 1;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function parseDurationToSeconds(duration) {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function formatViews(views) {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
}

function generateRandomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
}

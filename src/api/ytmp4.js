/**
 * YouTube to MP4 Download API
 * GET/POST /ytmp4?url=https://youtube.com/watch?v=VIDEO_ID&quality=720p
 */

module.exports = async (req, res) => {
    try {
        const { 
            url, 
            quality = '720p',
            title
        } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL parameter is required'
            });
        }

        // Extract video ID from URL
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Supported quality options
        const qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
        const selectedQuality = qualities.includes(quality) ? quality : '720p';

        // Generate download information
        const downloadInfo = {
            videoId: videoId,
            title: title || 'YouTube Video',
            url: url,
            format: 'mp4',
            quality: selectedQuality,
            resolution: selectedQuality,
            fileSize: calculateVideoFileSize(selectedQuality, 240), // 4 min video
            duration: '4:00',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            downloadUrl: `https://api.example.com/download/video/${videoId}?quality=${selectedQuality}`,
            directLink: `${req.protocol}://$${req.get('host')}/download/mp4/$$ {videoId}`,
            status: 'ready',
            conversionTime: '10-30 seconds',
            expiresIn: '2 hours',
            videoCodec: 'H.264',
            audioCodec: 'AAC',
            fps: selectedQuality.includes('60') ? 60 : 30,
            hasAudio: true,
            availableQualities: qualities.map(q => ({
                quality: q,
                fileSize: calculateVideoFileSize(q, 240),
                recommended: q === '720p'
            }))
        };

        res.json({
            success: true,
            data: downloadInfo,
            message: 'MP4 download link generated successfully',
            note: 'This is a demo API. In production, integrate with ytdl-core or similar libraries.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

function calculateVideoFileSize(quality, durationSeconds) {
    const bitrateMap = {
        '144p': 200,
        '240p': 400,
        '360p': 800,
        '480p': 1500,
        '720p': 2500,
        '1080p': 4500,
        '1440p': 9000,
        '2160p': 18000
    };

    const bitrate = bitrateMap[quality] || 2500;
    const sizeInMB = (bitrate * durationSeconds) / (8 * 1024);
    
    if (sizeInMB > 1024) {
        return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
}

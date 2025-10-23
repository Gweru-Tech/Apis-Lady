/**
 * YouTube to MP3 Download API
 * GET/POST /ytmp3?url=https://youtube.com/watch?v=VIDEO_ID&quality=128
 */

module.exports = async (req, res) => {
    try {
        const { 
            url, 
            quality = '128',
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
        const qualities = ['64', '128', '192', '256', '320'];
        const selectedQuality = qualities.includes(quality) ? quality : '128';

        // Generate download information
        const downloadInfo = {
            videoId: videoId,
            title: title || 'YouTube Audio',
            url: url,
            format: 'mp3',
            quality: `${selectedQuality}kbps`,
            fileSize: calculateFileSize(selectedQuality, 240), // Assuming 4 min video
            duration: '4:00',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            downloadUrl: `https://api.example.com/download/audio/${videoId}?quality=${selectedQuality}`,
            directLink: `${req.protocol}://$${req.get('host')}/download/mp3/$$ {videoId}`,
            status: 'ready',
            conversionTime: '5-10 seconds',
            expiresIn: '2 hours',
            availableQualities: qualities.map(q => ({
                quality: `${q}kbps`,
                fileSize: calculateFileSize(q, 240)
            }))
        };

        res.json({
            success: true,
            data: downloadInfo,
            message: 'MP3 download link generated successfully',
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

function calculateFileSize(quality, durationSeconds) {
    const bitrate = parseInt(quality);
    const sizeInMB = (bitrate * durationSeconds) / (8 * 1024);
    return sizeInMB > 1 ? `${sizeInMB.toFixed(2)} MB` : `${(sizeInMB * 1024).toFixed(2)} KB`;
}

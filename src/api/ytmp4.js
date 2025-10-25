/**
 * YouTube Video Info API
 * GET /ytinfo?url=https://youtube.com/watch?v=VIDEO_ID
 */

const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL parameter is required'
            });
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;
        const formats = info.formats;

        // Get audio formats only
        const audioFormats = formats
            .filter(format => format.hasAudio && !format.hasVideo)
            .map(format => ({
                itag: format.itag,
                mimeType: format.mimeType,
                bitrate: format.bitrate,
                audioBitrate: format.audioBitrate,
                audioQuality: format.audioQuality,
                audioSampleRate: format.audioSampleRate,
                contentLength: format.contentLength,
                quality: format.quality
            }));

        const responseData = {
            success: true,
            data: {
                videoId: videoDetails.videoId,
                title: videoDetails.title,
                author: {
                    name: videoDetails.author.name,
                    channelUrl: videoDetails.author.channel_url,
                    subscriberCount: videoDetails.author.subscriber_count
                },
                duration: videoDetails.lengthSeconds,
                durationFormatted: formatDuration(parseInt(videoDetails.lengthSeconds)),
                viewCount: videoDetails.viewCount,
                uploadDate: videoDetails.uploadDate,
                description: videoDetails.description,
                thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
                thumbnails: videoDetails.thumbnails,
                category: videoDetails.category,
                keywords: videoDetails.keywords,
                availableQualities: ['64', '128', '192', '256', '320'].map(q => ({
                    quality: `${q}kbps`,
                    estimatedSize: calculateFileSize(q, parseInt(videoDetails.lengthSeconds))
                })),
                audioFormats: audioFormats,
                downloadUrl: `${req.protocol}://${req.get('host')}/ytmp3?url=${encodeURIComponent(url)}`
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function calculateFileSize(quality, durationSeconds) {
    const bitrate = parseInt(quality);
    const sizeInMB = (bitrate * durationSeconds) / (8 * 1024);
    return sizeInMB > 1 ? `${sizeInMB.toFixed(2)} MB` : `${(sizeInMB * 1024).toFixed(2)} KB`;
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

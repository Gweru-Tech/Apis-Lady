/**
 * YouTube to MP3 Download API - Production Ready
 * GET/POST /ytmp3?url=https://youtube.com/watch?v=VIDEO_ID&quality=128
 */

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (req, res) => {
    try {
        const { 
            url, 
            quality = '128',
            format = 'mp3'
        } = req.method === 'POST' ? req.body : req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL parameter is required',
                example: '/ytmp3?url=https://youtube.com/watch?v=dQw4w9WgXcQ'
            });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;

        // Supported quality options
        const qualities = {
            '64': '64k',
            '128': '128k',
            '192': '192k',
            '256': '256k',
            '320': '320k'
        };

        const selectedQuality = qualities[quality] || '128k';

        // Calculate estimated file size
        const durationInSeconds = parseInt(videoDetails.lengthSeconds);
        const estimatedSize = calculateFileSize(quality, durationInSeconds);

        // Set response headers for audio download
        const sanitizedTitle = videoDetails.title
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .substring(0, 100);

        res.setHeader('Content-Disposition', `attachment; filename="$${sanitizedTitle}.$$ {format}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Create audio stream
        const audioStream = ytdl(url, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        // Convert to MP3 using ffmpeg
        const ffmpegProcess = ffmpeg(audioStream)
            .audioBitrate(selectedQuality)
            .format(format)
            .on('start', (commandLine) => {
                console.log('FFmpeg started:', commandLine);
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Audio conversion failed',
                        details: err.message
                    });
                }
            })
            .on('end', () => {
                console.log('Conversion completed');
            });

        // Pipe the converted audio to response
        ffmpegProcess.pipe(res, { end: true });

    } catch (error) {
        console.error('Error:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to download audio',
                details: error.stack
            });
        }
    }
};

function calculateFileSize(quality, durationSeconds) {
    const bitrate = parseInt(quality);
    const sizeInMB = (bitrate * durationSeconds) / (8 * 1024);
    return sizeInMB > 1 ? `${sizeInMB.toFixed(2)} MB` : `${(sizeInMB * 1024).toFixed(2)} KB`;
}

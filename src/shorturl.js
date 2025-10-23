/**
 * URL Shortener API
 * GET/POST /shorturl?url=https://example.com
 */

const urlDatabase = new Map();

module.exports = async (req, res) => {
    try {
        const { url, action = 'shorten', code } = req.query;

        // Expand shortened URL
        if (action === 'expand' && code) {
            const originalUrl = urlDatabase.get(code);
            if (!originalUrl) {
                return res.status(404).json({
                    success: false,
                    error: 'Short code not found'
                });
            }

            return res.json({
                success: true,
                data: {
                    shortCode: code,
                    originalUrl: originalUrl,
                    action: 'expand'
                }
            });
        }

        // Shorten URL
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        // Generate short code
        const shortCode = generateShortCode();
        urlDatabase.set(shortCode, url);

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        res.json({
            success: true,
            data: {
                originalUrl: url,
                shortCode: shortCode,
                shortUrl: `$${baseUrl}/s/$$ {shortCode}`,
                expiresIn: '30 days',
                clicks: 0,
                createdAt: new Date().toISOString()
            },
            message: 'URL shortened successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

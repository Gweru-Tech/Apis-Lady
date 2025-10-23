/**
 * QR Code Generator API
 * GET/POST /qrcode?text=Hello&size=200
 */

module.exports = async (req, res) => {
    try {
        const { 
            text = 'Hello World', 
            size = 200, 
            format = 'png',
            color = '000000',
            background = 'ffffff'
        } = req.query;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text parameter is required'
            });
        }

        // Using QR Server API (free service)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=$${size}x$$ {size}&data=${encodeURIComponent(text)}&format=${format}&color=${color}&bgcolor=${background}`;

        res.json({
            success: true,
            data: {
                text: text,
                qrCodeUrl: qrUrl,
                size: `$${size}x$$ {size}`,
                format: format,
                downloadUrl: qrUrl,
                settings: {
                    foregroundColor: `#${color}`,
                    backgroundColor: `#${background}`
                }
            },
            message: 'QR Code generated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Base64 Encoder/Decoder API
 * GET/POST /base64?text=Hello&action=encode
 * GET/POST /base64?text=SGVsbG8=&action=decode
 */

module.exports = async (req, res) => {
    try {
        const { 
            text, 
            action = 'encode',
            url_safe = 'false'
        } = req.query;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text parameter is required'
            });
        }

        let result;
        let operation;

        if (action === 'encode') {
            result = Buffer.from(text, 'utf-8').toString('base64');
            if (url_safe === 'true') {
                result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            }
            operation = 'encoded';
        } else if (action === 'decode') {
            try {
                let decodedText = text;
                if (url_safe === 'true') {
                    decodedText = text.replace(/-/g, '+').replace(/_/g, '/');
                    while (decodedText.length % 4) {
                        decodedText += '=';
                    }
                }
                result = Buffer.from(decodedText, 'base64').toString('utf-8');
                operation = 'decoded';
            } catch {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid base64 string'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid action. Use "encode" or "decode"'
            });
        }

        res.json({
            success: true,
            data: {
                original: text,
                result: result,
                action: action,
                operation: operation,
                urlSafe: url_safe === 'true',
                length: {
                    original: text.length,
                    result: result.length
                }
            },
            message: `Text ${operation} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

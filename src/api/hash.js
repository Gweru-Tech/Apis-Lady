/**
 * Hash Generator API
 * GET/POST /hash?text=Hello&algorithm=sha256
 */

const crypto = require('crypto');

module.exports = async (req, res) => {
    try {
        const { 
            text, 
            algorithm = 'sha256',
            encoding = 'hex'
        } = req.query;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text parameter is required'
            });
        }

        const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
        const algo = algorithm.toLowerCase();

        if (!supportedAlgorithms.includes(algo)) {
            return res.status(400).json({
                success: false,
                error: `Unsupported algorithm. Supported: ${supportedAlgorithms.join(', ')}`
            });
        }

        const hash = crypto.createHash(algo).update(text).digest(encoding);

        // Generate all hashes for comparison
        const allHashes = {};
        supportedAlgorithms.forEach(alg => {
            allHashes[alg] = crypto.createHash(alg).update(text).digest(encoding);
        });

        res.json({
            success: true,
            data: {
                original: text,
                hash: hash,
                algorithm: algo,
                encoding: encoding,
                length: hash.length,
                allHashes: allHashes,
                timestamp: new Date().toISOString()
            },
            message: `Hash generated using ${algo.toUpperCase()}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

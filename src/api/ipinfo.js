/**
 * IP Information API
 * GET/POST /ipinfo?ip=8.8.8.8
 */

module.exports = async (req, res) => {
    try {
        const { ip } = req.query;
        
        const targetIp = ip || req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        '127.0.0.1';

        // Simulated IP data (in production, use ipapi.co or ip-api.com)
        const ipData = generateIpInfo(targetIp);

        res.json({
            success: true,
            data: ipData,
            message: 'IP information retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generateIpInfo(ip) {
    const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Singapore', 'Mumbai'];
    const countries = [
        { name: 'United States', code: 'US', flag: '🇺🇸' },
        { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
        { name: 'Japan', code: 'JP', flag: '🇯🇵' },
        { name: 'France', code: 'FR', flag: '🇫🇷' },
        { name: 'Australia', code: 'AU', flag: '🇦🇺' },
        { name: 'UAE', code: 'AE', flag: '🇦🇪' },
        { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
        { name: 'India', code: 'IN', flag: '🇮🇳' }
    ];
    
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    return {
        ip: ip,
        type: ip.includes(':') ? 'IPv6' : 'IPv4',
        city: randomCity,
        region: 'Region Name',
        country: randomCountry.name,
        countryCode: randomCountry.code,
        flag: randomCountry.flag,
        continent: 'North America',
        latitude: (Math.random() * 180 - 90).toFixed(4),
        longitude: (Math.random() * 360 - 180).toFixed(4),
        timezone: 'America/New_York',
        offset: '-05:00',
        isp: 'Example ISP',
        org: 'Example Organization',
        as: 'AS15169 Example AS',
        asname: 'EXAMPLE-AS',
        mobile: false,
        proxy: false,
        hosting: false,
        query: ip,
        timestamp: new Date().toISOString()
    };
}

/**
 * Weather API - Get weather information
 * GET/POST /weather?city=London
 */

module.exports = async (req, res) => {
    try {
        const { city = 'London', unit = 'metric' } = req.query;

        // Simulated weather data (replace with real API like OpenWeatherMap in production)
        const weatherData = {
            city: city,
            country: getCountryCode(city),
            temperature: Math.floor(Math.random() * 35) + 5,
            unit: unit === 'imperial' ? '°F' : '°C',
            condition: getRandomCondition(),
            humidity: Math.floor(Math.random() * 60) + 40,
            windSpeed: Math.floor(Math.random() * 20) + 5,
            pressure: Math.floor(Math.random() * 100) + 980,
            visibility: Math.floor(Math.random() * 10) + 1,
            clouds: Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            forecast: generateForecast()
        };

        res.json({
            success: true,
            data: weatherData,
            message: `Weather data for ${city} retrieved successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function getRandomCondition() {
    const conditions = ['Clear', 'Cloudy', 'Rainy', 'Sunny', 'Partly Cloudy', 'Stormy', 'Windy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
}

function getCountryCode(city) {
    const cities = {
        'London': 'GB', 'Paris': 'FR', 'Tokyo': 'JP', 'New York': 'US',
        'Sydney': 'AU', 'Berlin': 'DE', 'Mumbai': 'IN', 'Dubai': 'AE'
    };
    return cities[city] || 'US';
}

function generateForecast() {
    return Array.from({ length: 5 }, (_, i) => ({
        day: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.floor(Math.random() * 30) + 10,
        condition: getRandomCondition()
    }));
}

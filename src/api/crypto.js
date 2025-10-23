/**
 * Cryptocurrency Prices API
 * GET/POST /crypto?symbol=BTC&currency=USD
 */

module.exports = async (req, res) => {
    try {
        const { 
            symbol = 'BTC', 
            currency = 'USD',
            action = 'price'
        } = req.query;

        const cryptoData = {
            'BTC': { name: 'Bitcoin', basePrice: 45000 },
            'ETH': { name: 'Ethereum', basePrice: 2500 },
            'BNB': { name: 'Binance Coin', basePrice: 320 },
            'ADA': { name: 'Cardano', basePrice: 0.85 },
            'SOL': { name: 'Solana', basePrice: 95 },
            'XRP': { name: 'Ripple', basePrice: 0.65 },
            'DOT': { name: 'Polkadot', basePrice: 18 },
            'DOGE': { name: 'Dogecoin', basePrice: 0.15 },
            'MATIC': { name: 'Polygon', basePrice: 1.2 },
            'AVAX': { name: 'Avalanche', basePrice: 38 }
        };

        const crypto = cryptoData[symbol.toUpperCase()];
        
        if (!crypto) {
            return res.status(404).json({
                success: false,
                error: 'Cryptocurrency symbol not found'
            });
        }

        // Simulate price fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
        const currentPrice = crypto.basePrice * (1 + fluctuation);
        const change24h = (Math.random() - 0.5) * 10; // ±5%
        
        const priceData = {
            symbol: symbol.toUpperCase(),
            name: crypto.name,
            price: parseFloat(currentPrice.toFixed(2)),
            currency: currency,
            change24h: parseFloat(change24h.toFixed(2)),
            changePercent24h: parseFloat(((change24h / currentPrice) * 100).toFixed(2)),
            high24h: parseFloat((currentPrice * 1.05).toFixed(2)),
            low24h: parseFloat((currentPrice * 0.95).toFixed(2)),
            volume24h: Math.floor(Math.random() * 10000000000),
            marketCap: Math.floor(currentPrice * 19000000), // Simulated
            timestamp: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };

        res.json({
            success: true,
            data: priceData,
            message: `${crypto.name} price retrieved successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

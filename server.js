const express = require('express');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Load settings
const settings = require('./src/settings.json');

// Track start time
const startTime = Date.now();

// Store loaded routes
const loadedRoutes = [];

// Auto-load API routes from src/api folder
const apiFolder = path.join(__dirname, 'src', 'api');

if (fs.existsSync(apiFolder)) {
    const apiFiles = fs.readdirSync(apiFolder).filter(file => file.endsWith('.js'));
    
    apiFiles.forEach(file => {
        const routeName = path.basename(file, '.js');
        const routePath = `/${routeName}`;
        
        try {
            const routeHandler = require(path.join(apiFolder, file));
            
            // Register both GET and POST methods
            app.get(routePath, async (req, res) => {
                try {
                    await routeHandler(req, res);
                } catch (error) {
                    res.status(500).json({
                        status: 'error',
                        success: false,
                        error: error.message
                    });
                }
            });
            
            app.post(routePath, async (req, res) => {
                try {
                    await routeHandler(req, res);
                } catch (error) {
                    res.status(500).json({
                        status: 'error',
                        success: false,
                        error: error.message
                    });
                }
            });
            
            loadedRoutes.push({
                path: routePath,
                name: routeName,
                file: file
            });
            
            console.log(chalk.green('✓'), `Loaded route: ${chalk.cyan(routePath)}`);
        } catch (error) {
            console.log(chalk.red('✗'), `Failed to load ${file}:`, error.message);
        }
    });
}

// Serve static files (homepage)
app.use(express.static(path.join(__dirname, 'api-page')));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// API Status endpoint
app.get('/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    res.json({
        status: 'success',
        creator: settings.author,
        success: true,
        server: 'online',
        uptime: uptime,
        uptimeFormatted: formatUptime(uptime),
        version: settings.version,
        totalRoutes: loadedRoutes.length + 7,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform
    });
});

// API Routes list
app.get('/api/routes', (req, res) => {
    const allRoutes = [
        { path: '/', methods: 'GET', description: 'Homepage' },
        { path: '/api/info', methods: 'GET', description: 'API Information' },
        { path: '/api/routes', methods: 'GET', description: 'List all routes' },
        { path: '/api/settings', methods: 'GET', description: 'API settings' },
        { path: '/api/status', methods: 'GET', description: 'Server status' },
        { path: '/health', methods: 'GET', description: 'Health check' },
        { path: '/ping', methods: 'GET', description: 'Ping endpoint' },
        ...loadedRoutes.map(route => ({
            path: route.path,
            methods: 'GET, POST',
            description: `${route.name} API endpoint`
        }))
    ];
    
    res.json({
        status: 'success',
        creator: settings.author,
        success: true,
        totalRoutes: allRoutes.length,
        routes: allRoutes
    });
});

// API Settings
app.get('/api/settings', (req, res) => {
    res.json({
        status: 'success',
        creator: settings.author,
        success: true,
        data: settings
    });
});

// API Info
app.get('/api/info', (req, res) => {
    res.json({
        status: 'success',
        creator: settings.author,
        success: true,
        apiName: settings.name,
        version: settings.version,
        description: settings.description,
        author: settings.author,
        documentation: settings.documentation,
        contact: settings.apiSettings.contact,
        features: settings.features,
        uptime: formatUptime(Math.floor((Date.now() - startTime) / 1000))
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: Math.floor((Date.now() - startTime) / 1000)
    });
});

// Ping endpoint
app.get('/ping', (req, res) => {
    res.json({ 
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            status: 'error',
            success: false,
            message: 'API endpoint not found',
            path: req.path,
            availableEndpoints: loadedRoutes.map(r => r.path)
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(chalk.red('Error:'), err);
    res.status(500).json({
        status: 'error',
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Helper function
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `$${days}d$$ {hours}h ${minutes}m`;
    if (hours > 0) return `$${hours}h$$ {minutes}m ${secs}s`;
    if (minutes > 0) return `$${minutes}m$$ {secs}s`;
    return `${secs}s`;
}

// Start server
app.listen(PORT, () => {
    console.log('\n' + chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.bold.magenta('  🐞 Ladybug APIs Server Started'));
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.green('✓'), 'Server running on:', chalk.yellow(`http://localhost:${PORT}`));
    console.log(chalk.green('✓'), 'Environment:', chalk.yellow(process.env.NODE_ENV || 'development'));
    console.log(chalk.green('✓'), 'Version:', chalk.yellow(settings.version));
    console.log(chalk.green('✓'), 'Loaded routes:', chalk.yellow(loadedRoutes.length));
    console.log(chalk.cyan('═══════════════════════════════════════\n'));
    
    console.log(chalk.bold('📋 Available Routes:'));
    console.log(chalk.gray('  GET  /                    - Homepage'));
    console.log(chalk.gray('  GET  /api/status          - Server status'));
    console.log(chalk.gray('  GET  /api/routes          - List all routes'));
    console.log(chalk.gray('  GET  /api/settings        - API settings'));
    console.log(chalk.gray('  GET  /api/info            - API information'));
    console.log(chalk.gray('  GET  /health              - Health check'));
    console.log(chalk.gray('  GET  /ping                - Ping endpoint\n'));
    
    if (loadedRoutes.length > 0) {
        console.log(chalk.bold('🎯 Loaded API Routes:'));
        loadedRoutes.forEach(route => {
            console.log(chalk.gray(`  GET/POST $${route.path.padEnd(20)} -$$ {route.name}`));
        });
        console.log('');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n⚠️  SIGTERM signal received: closing HTTP server'));
    process.exit(0);
});

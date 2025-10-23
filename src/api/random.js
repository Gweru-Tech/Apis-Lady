/**
 * Random Data Generator API
 * GET/POST /random?type=number&min=1&max=100
 * Types: number, string, uuid, color, name, email, phone, date
 */

const crypto = require('crypto');

module.exports = async (req, res) => {
    try {
        const { 
            type = 'number',
            min = 1,
            max = 100,
            length = 10,
            count = 1
        } = req.query;

        const itemCount = Math.min(Math.max(parseInt(count), 1), 100);
        const results = [];

        for (let i = 0; i < itemCount; i++) {
            let result;

            switch (type.toLowerCase()) {
                case 'number':
                    result = generateRandomNumber(parseInt(min), parseInt(max));
                    break;
                case 'string':
                    result = generateRandomString(parseInt(length));
                    break;
                case 'uuid':
                    result = generateUUID();
                    break;
                case 'color':
                    result = generateRandomColor();
                    break;
                case 'name':
                    result = generateRandomName();
                    break;
                case 'email':
                    result = generateRandomEmail();
                    break;
                case 'phone':
                    result = generateRandomPhone();
                    break;
                case 'date':
                    result = generateRandomDate();
                    break;
                case 'boolean':
                    result = Math.random() > 0.5;
                    break;
                case 'float':
                    result = parseFloat((Math.random() * (max - min) + parseFloat(min)).toFixed(2));
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid type. Supported: number, string, uuid, color, name, email, phone, date, boolean, float'
                    });
            }

            results.push(result);
        }

        res.json({
            success: true,
            data: {
                type: type,
                count: itemCount,
                results: itemCount === 1 ? results[0] : results,
                parameters: {
                    min: min,
                    max: max,
                    length: length
                }
            },
            message: `Random ${type} generated successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateUUID() {
    return crypto.randomUUID();
}

function generateRandomColor() {
    const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return {
        hex: `#${hex}`,
        rgb: hexToRgb(hex),
        name: getColorName(hex)
    };
}

function hexToRgb(hex) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgb($${r},$$ {g}, ${b})`;
}

function getColorName(hex) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    return 'Mixed';
}

function generateRandomName() {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Sarah', 'Richard', 'Jessica', 'Joseph', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return {
        full: `$${firstName}$$ {lastName}`,
        first: firstName,
        last: lastName
    };
}

function generateRandomEmail() {
    const name = generateRandomString(8).toLowerCase();
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'email.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
}

function generateRandomPhone() {
    const formats = [
        '+1-XXX-XXX-XXXX',
        '(XXX) XXX-XXXX',
        'XXX-XXX-XXXX',
        '+44-XXXX-XXXXXX'
    ];
    
    const format = formats[Math.floor(Math.random() * formats.length)];
    return format.replace(/X/g, () => Math.floor(Math.random() * 10));
}

function generateRandomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    return {
        iso: date.toISOString(),
        formatted: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        timestamp: date.getTime()
    };
}

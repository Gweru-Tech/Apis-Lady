/**
 * Password Generator API
 * GET/POST /password?length=16&numbers=true&symbols=true&uppercase=true
 */

module.exports = async (req, res) => {
    try {
        const {
            length = 12,
            numbers = 'true',
            symbols = 'true',
            uppercase = 'true',
            lowercase = 'true',
            count = 1
        } = req.query;

        const passwordLength = Math.min(Math.max(parseInt(length), 6), 128);
        const passwordCount = Math.min(Math.max(parseInt(count), 1), 10);

        const passwords = [];
        
        for (let i = 0; i < passwordCount; i++) {
            passwords.push(generatePassword({
                length: passwordLength,
                numbers: numbers === 'true',
                symbols: symbols === 'true',
                uppercase: uppercase === 'true',
                lowercase: lowercase === 'true'
            }));
        }

        res.json({
            success: true,
            data: {
                passwords: passwords,
                count: passwords.length,
                length: passwordLength,
                settings: {
                    includeNumbers: numbers === 'true',
                    includeSymbols: symbols === 'true',
                    includeUppercase: uppercase === 'true',
                    includeLowercase: lowercase === 'true'
                },
                strength: calculateStrength(passwordLength, {
                    numbers: numbers === 'true',
                    symbols: symbols === 'true',
                    uppercase: uppercase === 'true',
                    lowercase: lowercase === 'true'
                })
            },
            message: 'Password(s) generated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generatePassword(options) {
    let charset = '';
    
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';

    let password = '';
    for (let i = 0; i < options.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
}

function calculateStrength(length, options) {
    let strength = 0;
    if (length >= 12) strength += 25;
    else if (length >= 8) strength += 15;
    else strength += 5;

    if (options.lowercase) strength += 15;
    if (options.uppercase) strength += 20;
    if (options.numbers) strength += 20;
    if (options.symbols) strength += 20;

    if (strength >= 80) return 'Very Strong';
    if (strength >= 60) return 'Strong';
    if (strength >= 40) return 'Medium';
    return 'Weak';
}

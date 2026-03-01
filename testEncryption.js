require('dotenv').config({ path: './backend/.env' });

// Set a mock 32-byte hex key for testing BEFORE requiring the utility
process.env.TOKEN_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const { encrypt, decrypt } = require('./backend/utils/encryptToken');

// Mock data
const mockToken = 'ghp_this_is_a_mock_github_access_token';

try {
    console.log('--- Testing Token Encryption ---');
    console.log('Original Token:', mockToken);
    console.log('Using mock TOKEN_ENCRYPTION_KEY for test');

    const encrypted = encrypt(mockToken);
    console.log('Encrypted Token:', encrypted);

    const decrypted = decrypt(encrypted);
    console.log('Decrypted Token:', decrypted);

    if (mockToken === decrypted) {
        console.log(' Encryption/Decryption Test Passed!');
    } else {
        console.log(' Encryption/Decryption Test Failed!');
    }
} catch (err) {
    console.error('Error during test:', err.message);
}

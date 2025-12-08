/**
 * Simple encryption utilities for API key storage
 * Uses browser's built-in crypto API for basic obfuscation
 */

const ENCRYPTION_KEY = 'research-reader-v1'; // Simple key for obfuscation

/**
 * Encode a string to base64
 */
export function encodeBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decode a base64 string
 */
export function decodeBase64(str: string): string {
    return decodeURIComponent(escape(atob(str)));
}

/**
 * Simple XOR cipher for additional obfuscation
 */
function xorCipher(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Encrypt a string (simple obfuscation, not cryptographically secure)
 * This is client-side only and provides basic protection against casual inspection
 */
export function encrypt(text: string): string {
    const xored = xorCipher(text, ENCRYPTION_KEY);
    return encodeBase64(xored);
}

/**
 * Decrypt a string
 */
export function decrypt(encryptedText: string): string {
    try {
        const decoded = decodeBase64(encryptedText);
        return xorCipher(decoded, ENCRYPTION_KEY);
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}

/**
 * Mask an API key for display (show only first 4 and last 4 characters)
 */
export function maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
        return '••••••••';
    }

    const visibleChars = 4;
    const start = apiKey.substring(0, visibleChars);
    const end = apiKey.substring(apiKey.length - visibleChars);
    const maskedLength = Math.max(8, apiKey.length - (visibleChars * 2));
    const masked = '•'.repeat(maskedLength);

    return `${start}${masked}${end}`;
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKeyFormat(apiKey: string, provider: 'openai' | 'tavily'): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
        return false;
    }

    // OpenAI keys start with 'sk-'
    if (provider === 'openai') {
        return apiKey.startsWith('sk-') && apiKey.length > 20;
    }

    // Tavily keys are typically alphanumeric
    if (provider === 'tavily') {
        return apiKey.length > 10;
    }

    return false;
}

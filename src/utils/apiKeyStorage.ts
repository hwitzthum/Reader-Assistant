import { encrypt, decrypt } from './encryption';

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
    OPENAI_API_KEY: 'rr_openai_key',
    TAVILY_API_KEY: 'rr_tavily_key',
} as const;

/**
 * API Key configuration interface
 */
export interface ApiKeys {
    openai: string;
    tavily: string;
}

/**
 * Save OpenAI API key to encrypted localStorage
 */
export function saveOpenAIKey(apiKey: string): void {
    try {
        const encrypted = encrypt(apiKey);
        localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, encrypted);
    } catch (error) {
        console.error('Failed to save OpenAI API key:', error);
        throw new Error('Failed to save API key');
    }
}

/**
 * Get OpenAI API key from encrypted localStorage
 */
export function getOpenAIKey(): string {
    try {
        const encrypted = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
        if (!encrypted) return '';
        return decrypt(encrypted);
    } catch (error) {
        console.error('Failed to retrieve OpenAI API key:', error);
        return '';
    }
}

/**
 * Save Tavily API key to encrypted localStorage
 */
export function saveTavilyKey(apiKey: string): void {
    try {
        const encrypted = encrypt(apiKey);
        localStorage.setItem(STORAGE_KEYS.TAVILY_API_KEY, encrypted);
    } catch (error) {
        console.error('Failed to save Tavily API key:', error);
        throw new Error('Failed to save API key');
    }
}

/**
 * Get Tavily API key from encrypted localStorage
 */
export function getTavilyKey(): string {
    try {
        const encrypted = localStorage.getItem(STORAGE_KEYS.TAVILY_API_KEY);
        if (!encrypted) return '';
        return decrypt(encrypted);
    } catch (error) {
        console.error('Failed to retrieve Tavily API key:', error);
        return '';
    }
}

/**
 * Get all API keys
 */
export function getAllApiKeys(): ApiKeys {
    return {
        openai: getOpenAIKey(),
        tavily: getTavilyKey(),
    };
}

/**
 * Check if API keys are configured
 */
export function hasApiKeys(): { openai: boolean; tavily: boolean } {
    return {
        openai: getOpenAIKey().length > 0,
        tavily: getTavilyKey().length > 0,
    };
}

/**
 * Clear OpenAI API key
 */
export function clearOpenAIKey(): void {
    localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
}

/**
 * Clear Tavily API key
 */
export function clearTavilyKey(): void {
    localStorage.removeItem(STORAGE_KEYS.TAVILY_API_KEY);
}

/**
 * Clear all API keys
 */
export function clearAllApiKeys(): void {
    clearOpenAIKey();
    clearTavilyKey();
}

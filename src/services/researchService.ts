import { getTavilyKey } from '../utils/apiKeyStorage';

export interface ResearchResult {
    title: string;
    url: string;
    snippet: string;
    score: number;
}

/**
 * Search for research using Tavily API
 */
export async function searchResearch(query: string): Promise<ResearchResult[]> {
    const apiKey = getTavilyKey();

    if (!apiKey) {
        throw new Error('Tavily API key not found. Please add it in Settings.');
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: 'advanced',
                include_answer: false,
                max_results: 5,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to search research');
        }

        const data = await response.json();

        return (data.results || []).map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.content,
            score: result.score || 0,
        }));
    } catch (error) {
        console.error('Error searching research:', error);
        throw error;
    }
}

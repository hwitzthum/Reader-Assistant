import { getOpenAIKey } from '../utils/apiKeyStorage';

export interface Explanation {
    text: string;
    selectedText: string;
    timestamp: number;
}

/**
 * Generate an AI explanation for selected text using OpenAI GPT-4
 */
export async function generateExplanation(
    selectedText: string,
    context: string
): Promise<string> {
    const apiKey = getOpenAIKey();

    if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add it in Settings.');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful research assistant. Provide clear, concise explanations of academic text. Focus on clarifying complex concepts, terminology, and context.',
                    },
                    {
                        role: 'user',
                        content: `Please explain the following text from a research article:\n\n"${selectedText}"\n\nContext: ${context.substring(0, 500)}`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate explanation');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'No explanation generated';
    } catch (error) {
        console.error('Error generating explanation:', error);
        throw error;
    }
}

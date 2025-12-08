import { useState } from 'react';
import { searchResearch, type ResearchResult } from '../services/researchService';
import './ResearchPanel.css';

export default function ResearchPanel() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ResearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const searchResults = await searchResearch(query);
            setResults(searchResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="research-panel">
            <div className="search-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for related research..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? '🔍 Searching...' : '🔍 Search'}
                </button>
            </div>

            {error && (
                <div className="error-state">
                    <p>❌ {error}</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="results-list">
                    {results.map((result, index) => (
                        <div key={index} className="result-item animate-fadeIn">
                            <h4 className="result-title">
                                <a href={result.url} target="_blank" rel="noopener noreferrer">
                                    {result.title}
                                </a>
                            </h4>
                            <p className="result-snippet">{result.snippet}</p>
                            <div className="result-meta">
                                <span className="result-score">
                                    Relevance: {Math.round(result.score * 100)}%
                                </span>
                                <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="result-link"
                                >
                                    Visit source →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!results.length && !error && !isLoading && (
                <div className="placeholder-state">
                    <div className="placeholder-icon">🌐</div>
                    <h4>Web Research</h4>
                    <p>Search for additional context and related research from credible sources.</p>
                </div>
            )}
        </div>
    );
}

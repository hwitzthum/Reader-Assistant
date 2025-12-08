import { useState } from 'react';
import { useSelectionStore } from '../store/selectionStore';
import { generateExplanation } from '../services/aiService';
import './ExplanationsPanel.css';

export default function ExplanationsPanel() {
    const { selectedText, clearSelection } = useSelectionStore();
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetExplanation = async () => {
        if (!selectedText) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await generateExplanation(selectedText, selectedText);
            setExplanation(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate explanation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setExplanation('');
        setError('');
        clearSelection();
    };

    return (
        <div className="explanations-panel">
            {!selectedText && !explanation ? (
                <div className="placeholder-state">
                    <div className="placeholder-icon">🤖</div>
                    <h4>AI Explanations</h4>
                    <p>Select text in the document to get AI-powered explanations.</p>
                </div>
            ) : (
                <div className="explanation-content">
                    {selectedText && (
                        <div className="selected-text-card">
                            <div className="card-header">
                                <span className="card-title">Selected Text</span>
                                <button className="btn-clear" onClick={handleClear}>✕</button>
                            </div>
                            <p className="selected-text">"{selectedText}"</p>
                            {!explanation && !isLoading && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGetExplanation}
                                >
                                    🤖 Get Explanation
                                </button>
                            )}
                        </div>
                    )}

                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Generating explanation...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <p>❌ {error}</p>
                        </div>
                    )}

                    {explanation && !isLoading && (
                        <div className="explanation-card animate-fadeIn">
                            <div className="card-header">
                                <span className="card-title">AI Explanation</span>
                            </div>
                            <div className="explanation-text">
                                {explanation}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

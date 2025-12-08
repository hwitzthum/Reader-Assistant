import { useState, useEffect } from 'react';
import {
    saveOpenAIKey,
    saveTavilyKey,
    getOpenAIKey,
    getTavilyKey,
    clearOpenAIKey,
    clearTavilyKey,
} from '../utils/apiKeyStorage';
import { maskApiKey, validateApiKeyFormat } from '../utils/encryption';
import './SettingsPanel.css';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const [openaiKey, setOpenaiKey] = useState('');
    const [tavilyKey, setTavilyKey] = useState('');
    const [showOpenaiKey, setShowOpenaiKey] = useState(false);
    const [showTavilyKey, setShowTavilyKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{
        openai: 'idle' | 'success' | 'error';
        tavily: 'idle' | 'success' | 'error';
    }>({ openai: 'idle', tavily: 'idle' });

    // Load existing keys on mount
    useEffect(() => {
        const existingOpenaiKey = getOpenAIKey();
        const existingTavilyKey = getTavilyKey();

        if (existingOpenaiKey) {
            setOpenaiKey(existingOpenaiKey);
        }
        if (existingTavilyKey) {
            setTavilyKey(existingTavilyKey);
        }
    }, [isOpen]);

    const handleSaveOpenAI = () => {
        if (!validateApiKeyFormat(openaiKey, 'openai')) {
            setSaveStatus(prev => ({ ...prev, openai: 'error' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, openai: 'idle' })), 3000);
            return;
        }

        try {
            saveOpenAIKey(openaiKey);
            setSaveStatus(prev => ({ ...prev, openai: 'success' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, openai: 'idle' })), 3000);
        } catch (error) {
            setSaveStatus(prev => ({ ...prev, openai: 'error' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, openai: 'idle' })), 3000);
        }
    };

    const handleSaveTavily = () => {
        if (!validateApiKeyFormat(tavilyKey, 'tavily')) {
            setSaveStatus(prev => ({ ...prev, tavily: 'error' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, tavily: 'idle' })), 3000);
            return;
        }

        try {
            saveTavilyKey(tavilyKey);
            setSaveStatus(prev => ({ ...prev, tavily: 'success' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, tavily: 'idle' })), 3000);
        } catch (error) {
            setSaveStatus(prev => ({ ...prev, tavily: 'error' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, tavily: 'idle' })), 3000);
        }
    };

    const handleClearOpenAI = () => {
        clearOpenAIKey();
        setOpenaiKey('');
        setSaveStatus(prev => ({ ...prev, openai: 'idle' }));
    };

    const handleClearTavily = () => {
        clearTavilyKey();
        setTavilyKey('');
        setSaveStatus(prev => ({ ...prev, tavily: 'idle' }));
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>⚙️ Settings</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    {/* OpenAI API Key Section */}
                    <div className="settings-section">
                        <h3>🤖 OpenAI API Key</h3>
                        <p className="settings-description">
                            Required for AI-powered explanations and Q&A generation.
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="settings-link"
                            >
                                Get your API key →
                            </a>
                        </p>

                        <div className="api-key-input-group">
                            <input
                                type={showOpenaiKey ? 'text' : 'password'}
                                className="input api-key-input"
                                placeholder="sk-..."
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                            />
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                                title={showOpenaiKey ? 'Hide key' : 'Show key'}
                            >
                                {showOpenaiKey ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {openaiKey && !showOpenaiKey && (
                            <div className="masked-key">
                                Stored: {maskApiKey(openaiKey)}
                            </div>
                        )}

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveOpenAI}
                                disabled={!openaiKey}
                            >
                                💾 Save
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleClearOpenAI}
                                disabled={!openaiKey}
                            >
                                🗑️ Clear
                            </button>
                        </div>

                        {saveStatus.openai === 'success' && (
                            <div className="status-message success">✅ API key saved successfully!</div>
                        )}
                        {saveStatus.openai === 'error' && (
                            <div className="status-message error">❌ Invalid API key format. OpenAI keys start with 'sk-'</div>
                        )}
                    </div>

                    {/* Tavily API Key Section */}
                    <div className="settings-section">
                        <h3>🌐 Tavily API Key</h3>
                        <p className="settings-description">
                            Required for web research and fetching additional context.
                            <a
                                href="https://tavily.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="settings-link"
                            >
                                Get your API key →
                            </a>
                        </p>

                        <div className="api-key-input-group">
                            <input
                                type={showTavilyKey ? 'text' : 'password'}
                                className="input api-key-input"
                                placeholder="tvly-..."
                                value={tavilyKey}
                                onChange={(e) => setTavilyKey(e.target.value)}
                            />
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={() => setShowTavilyKey(!showTavilyKey)}
                                title={showTavilyKey ? 'Hide key' : 'Show key'}
                            >
                                {showTavilyKey ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {tavilyKey && !showTavilyKey && (
                            <div className="masked-key">
                                Stored: {maskApiKey(tavilyKey)}
                            </div>
                        )}

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveTavily}
                                disabled={!tavilyKey}
                            >
                                💾 Save
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleClearTavily}
                                disabled={!tavilyKey}
                            >
                                🗑️ Clear
                            </button>
                        </div>

                        {saveStatus.tavily === 'success' && (
                            <div className="status-message success">✅ API key saved successfully!</div>
                        )}
                        {saveStatus.tavily === 'error' && (
                            <div className="status-message error">❌ Invalid API key format</div>
                        )}
                    </div>

                    {/* Security Notice */}
                    <div className="settings-section security-notice">
                        <h4>🔒 Security Information</h4>
                        <ul>
                            <li>API keys are stored locally in your browser only</li>
                            <li>Keys are encrypted before storage</li>
                            <li>Keys are never sent to any server except OpenAI and Tavily</li>
                            <li>You can clear your keys at any time</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

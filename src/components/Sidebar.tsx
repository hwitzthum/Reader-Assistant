import './Sidebar.css';
import ExplanationsPanel from './ExplanationsPanel';
import FootnotesPanel from './FootnotesPanel';
import ResearchPanel from './ResearchPanel';
import QAPanel from './QAPanel';

interface SidebarProps {
    activeTab: 'explanations' | 'footnotes' | 'research' | 'qa';
    onTabChange: (tab: 'explanations' | 'footnotes' | 'research' | 'qa') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="sidebar">
            <div className="sidebar-tabs">
                <button
                    className={`sidebar-tab ${activeTab === 'explanations' ? 'active' : ''}`}
                    onClick={() => onTabChange('explanations')}
                >
                    <span className="tab-icon">🤖</span>
                    <span className="tab-label">Explanations</span>
                </button>
                <button
                    className={`sidebar-tab ${activeTab === 'footnotes' ? 'active' : ''}`}
                    onClick={() => onTabChange('footnotes')}
                >
                    <span className="tab-icon">🔗</span>
                    <span className="tab-label">Footnotes</span>
                </button>
                <button
                    className={`sidebar-tab ${activeTab === 'research' ? 'active' : ''}`}
                    onClick={() => onTabChange('research')}
                >
                    <span className="tab-icon">🌐</span>
                    <span className="tab-label">Research</span>
                </button>
                <button
                    className={`sidebar-tab ${activeTab === 'qa' ? 'active' : ''}`}
                    onClick={() => onTabChange('qa')}
                >
                    <span className="tab-icon">✅</span>
                    <span className="tab-label">Q&A</span>
                </button>
            </div>

            <div className="sidebar-content">
                {activeTab === 'explanations' && <ExplanationsPanel />}
                {activeTab === 'footnotes' && <FootnotesPanel />}
                {activeTab === 'research' && <ResearchPanel />}
                {activeTab === 'qa' && <QAPanel />}
            </div>
        </div>
    );
}

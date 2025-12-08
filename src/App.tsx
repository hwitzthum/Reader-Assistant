import { useState } from 'react'
import './App.css'
import SettingsPanel from './components/SettingsPanel'
import DocumentUploader from './components/DocumentUploader'
import DocumentViewer from './components/DocumentViewer'
import Sidebar from './components/Sidebar'
import { useDocumentStore } from './store/documentStore'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanations' | 'footnotes' | 'research' | 'qa'>('explanations');
  const { document, clearDocument } = useDocumentStore();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-md">
            <h1 className="text-gradient" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
              📚 Research Reader
            </h1>
          </div>
          <div className="flex gap-md">
            {document && (
              <button
                className="btn btn-ghost"
                onClick={clearDocument}
              >
                ✕ Close Document
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setIsSettingsOpen(true)}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {!document ? (
          <div className="welcome-section">
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-2xl)' }}>
              <h2 className="text-gradient" style={{ marginBottom: 'var(--space-lg)' }}>
                Welcome to Research Reader
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2xl)' }}>
                AI-powered research article reader with intelligent explanations,
                footnote resolution, and interactive Q&A testing.
              </p>

              <DocumentUploader />
            </div>

            {/* Feature Cards */}
            <div className="features-grid">
              <div className="glass-card">
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>🤖</div>
                <h3>AI Explanations</h3>
                <p>Get instant, context-aware explanations powered by GPT-4</p>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>🔗</div>
                <h3>Footnote Resolution</h3>
                <p>Automatic footnote detection and reference resolution</p>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>🌐</div>
                <h3>Web Research</h3>
                <p>Fetch additional context from credible academic sources</p>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>✅</div>
                <h3>Interactive Q&A</h3>
                <p>Test your understanding with AI-generated questions</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="split-screen-layout">
            <div className="document-pane">
              <DocumentViewer />
            </div>
            <div className="sidebar-pane">
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container text-center">
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Built with React, TypeScript, OpenAI, and Tavily
          </p>
        </div>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export default App

import { useDocumentStore } from '../store/documentStore';
import './FootnotesPanel.css';

export default function FootnotesPanel() {
    const { document: parsedDocument } = useDocumentStore();

    const handleFootnoteClick = (marker: string) => {
        // Find the reference in the document
        const refId = `ref-${marker.replace(/[\[\]]/g, '')}`;
        const element = document.getElementById(refId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            element.classList.add('highlight-ref');
            setTimeout(() => element.classList.remove('highlight-ref'), 2000);
        }
    };

    if (!parsedDocument || parsedDocument.footnotes.length === 0) {
        return (
            <div className="footnotes-panel">
                <div className="placeholder-state">
                    <div className="placeholder-icon">🔗</div>
                    <h4>Footnotes</h4>
                    <p>No footnotes detected in this document.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="footnotes-panel">
            <div className="footnotes-header">
                <h3>Detected Footnotes</h3>
                <span className="footnote-count">{parsedDocument.footnotes.length} found</span>
            </div>

            <div className="footnotes-list">
                {parsedDocument.footnotes.map((footnote, index) => (
                    <div
                        key={index}
                        className="footnote-item animate-fadeIn"
                        onClick={() => handleFootnoteClick(typeof footnote === 'string' ? footnote : footnote.marker)}
                    >
                        <div className="footnote-marker">
                            {typeof footnote === 'string' ? footnote : footnote.marker}
                        </div>
                        <div className="footnote-info">
                            <p className="footnote-text">
                                {typeof footnote === 'string' ? 'Click to view reference in document' : footnote.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useDocumentStore } from '../store/documentStore';
import { useSelectionStore } from '../store/selectionStore';
import './DocumentViewer.css';

export default function DocumentViewer() {
    const { document } = useDocumentStore();
    const { setSelectedText } = useSelectionStore();

    if (!document) {
        return null;
    }

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 0) {
            setSelectedText(text);
        }
    };

    return (
        <div className="document-viewer">
            <div className="document-header">
                <h2 className="document-title">{document.metadata.title}</h2>
                <div className="document-meta">
                    {document.metadata.author && (
                        <span className="meta-item">👤 {document.metadata.author}</span>
                    )}
                    {document.metadata.pageCount && (
                        <span className="meta-item">📄 {document.metadata.pageCount} pages</span>
                    )}
                    <span className="meta-item">🔖 {document.footnotes.length} footnotes</span>
                </div>
            </div>

            <div
                className="document-content"
                onMouseUp={handleTextSelection}
            >
                <div>
                    {document.content ? (
                        document.content.map((block: any) => {
                            if (block.type === 'heading') {
                                return (
                                    <h3 key={block.id} id={block.id} className="document-heading">
                                        {block.text}
                                    </h3>
                                );
                            } else {
                                // Render paragraph with clickable footnotes
                                const parts = block.text.split(/(\[\d+\])/g);
                                return (
                                    <p key={block.id} id={block.id} className="document-paragraph">
                                        {parts.map((part: string, i: number) => {
                                            if (/^\[\d+\]$/.test(part)) {
                                                return (
                                                    <span key={i} className="footnote-ref" id={`ref-${part.replace(/[\[\]]/g, '')}`}>
                                                        {part}
                                                    </span>
                                                );
                                            }
                                            return part;
                                        })}
                                    </p>
                                );
                            }
                        })
                    ) : (
                        // Fallback for older parsed documents
                        document.text.split('\n\n').map((paragraph: string, index: number) => (
                            paragraph.trim() && (
                                <p key={index} className="document-paragraph">
                                    {paragraph}
                                </p>
                            )
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

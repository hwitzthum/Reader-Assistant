import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocumentStore } from '../store/documentStore';
import { useSelectionStore } from '../store/selectionStore';
import './PDFViewer.css';
import 'pdfjs-dist/web/pdf_viewer.css';

// Ensure worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFPageProps {
    pageNumber: number;
    pdf: pdfjsLib.PDFDocumentProxy;
    scale: number;
}

function PDFPage({ pageNumber, pdf, scale }: PDFPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        let active = true;

        const renderPage = async () => {
            try {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale });

                // Render Canvas
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        const renderContext: any = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        await page.render(renderContext).promise;
                    }
                }

                // Render Text Layer
                const textLayerDiv = textLayerRef.current;
                if (textLayerDiv) {
                    textLayerDiv.innerHTML = ''; // Clear previous
                    textLayerDiv.style.height = `${viewport.height}px`;
                    textLayerDiv.style.width = `${viewport.width}px`;

                    const textContent = await page.getTextContent();
                    // @ts-ignore
                    await pdfjsLib.renderTextLayer({
                        textContentSource: textContent,
                        container: textLayerDiv,
                        viewport: viewport,
                        textDivs: []
                    }).promise;
                }

                if (active) setRendered(true);
            } catch (error) {
                console.error(`Error rendering page ${pageNumber}:`, error);
            }
        };

        renderPage();

        return () => { active = false; };
    }, [pdf, pageNumber, scale]);

    return (
        <div className="pdf-page" style={{ position: 'relative', marginBottom: '20px' }}>
            <canvas ref={canvasRef} />
            <div ref={textLayerRef} className="textLayer" />
            {!rendered && <div className="page-loading">Loading page {pageNumber}...</div>}
        </div>
    );
}

export default function PDFViewer() {
    const { file } = useDocumentStore();
    const { setSelectedText } = useSelectionStore();
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.2); // Default zoom
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!file) return;

        const loadPdf = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const loadedPdf = await loadingTask.promise;
                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);
            } catch (error) {
                console.error('Error loading PDF for viewer:', error);
            }
        };

        loadPdf();
    }, [file]);

    const handleSelection = () => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (text && text.length > 0) {
            setSelectedText(text);
        }
    };

    if (!file || !pdf) return <div className="pdf-loading">Loading PDF...</div>;

    return (
        <div className="pdf-viewer-container" ref={containerRef} onMouseUp={handleSelection}>
            <div className="pdf-controls">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3, s + 0.1))}>+</button>
            </div>

            <div className="pdf-pages">
                {Array.from({ length: numPages }, (_, i) => (
                    <PDFPage
                        key={i + 1}
                        pageNumber={i + 1}
                        pdf={pdf}
                        scale={scale}
                    />
                ))}
            </div>
        </div>
    );
}

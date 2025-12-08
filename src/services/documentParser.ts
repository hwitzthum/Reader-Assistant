import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export type ContentBlock = {
    type: 'heading' | 'paragraph';
    level?: number; // For headings: 1, 2, 3, etc.
    text: string;
    id: string; // Unique identifier for scrolling
};

export type Footnote = {
    marker: string;
    text: string;
    id: string;
};

export type ParsedDocument = {
    text: string; // Keep for backward compatibility
    content: ContentBlock[]; // Structured content
    metadata: {
        title?: string;
        author?: string;
        pageCount?: number;
    };
    footnotes: Footnote[];
};

/**
 * Parse a file (PDF or DOCX) and extract text and metadata
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return parsePDF(file);
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
    ) {
        return parseDOCX(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
}

/**
 * Parse PDF file
 */
async function parsePDF(file: File): Promise<ParsedDocument> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const metadata = await pdf.getMetadata().catch(() => ({ info: {} }));

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + '\n\n';
        }

        const content = parseContentStructure(fullText);
        const footnotes = extractFootnotes(fullText);

        return {
            text: fullText,
            content,
            metadata: {
                title: (metadata.info as any)?.Title || file.name,
                author: (metadata.info as any)?.Author,
                pageCount: pdf.numPages,
            },
            footnotes,
        };
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file.');
    }
}

/**
 * Parse DOCX file
 */
async function parseDOCX(file: File): Promise<ParsedDocument> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        const fullText = result.value;
        const content = parseContentStructure(fullText);
        const footnotes = extractFootnotes(fullText);

        return {
            text: fullText,
            content,
            metadata: {
                title: file.name,
                pageCount: 1, // DOCX doesn't easily give page count without rendering
            },
            footnotes,
        };
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file.');
    }
}

/**
 * Parse text content into structured blocks (headings, paragraphs)
 */
function parseContentStructure(text: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const lines = text.split(/\n\s*\n/); // Split by double newlines

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Simple heuristic for headings: short lines, often all caps or ending with colon
        // In a real app, we'd use font size/weight from PDF, but text extraction loses that
        const isHeading = (trimmed.length < 60 && !trimmed.endsWith('.')) ||
            /^[A-Z\s0-9]+$/.test(trimmed) ||
            /^(Chapter|Section|\d+\.)/.test(trimmed);

        if (isHeading) {
            blocks.push({
                type: 'heading',
                level: 2, // Default to h2
                text: trimmed,
                id: `block-${index}`
            });
        } else {
            blocks.push({
                type: 'paragraph',
                text: trimmed,
                id: `block-${index}`
            });
        }
    });

    return blocks;
}

/**
 * Extract potential footnotes and their content from text
 */
function extractFootnotes(text: string): Footnote[] {
    const footnotes: Footnote[] = [];
    const markers = new Set<string>();

    // 1. Find all unique footnote markers in the text (e.g., [1], [12])
    const bracketRegex = /\[(\d+)\]/g;
    let match;
    while ((match = bracketRegex.exec(text)) !== null) {
        markers.add(match[0]);
    }

    // 2. Convert text to lines for easier processing
    const lines = text.split('\n');
    const markerDefinitions = new Map<string, string>();

    // 3. Scan lines to find definitions
    // We look for lines that START with a marker, e.g., "[1] Author..."
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check if line starts with a marker
        // We use a regex to match the start of the line
        const lineStartMatch = line.match(/^\[(\d+)\]/);
        if (lineStartMatch) {
            const marker = lineStartMatch[0];

            // If this is a known marker, extract the text
            if (markers.has(marker)) {
                let content = line.substring(marker.length).trim();

                // Look ahead to capture multi-line footnotes
                // We stop if we hit an empty line or the next marker
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j].trim();
                    if (!nextLine || /^\[\d+\]/.test(nextLine)) break;

                    content += ' ' + nextLine;
                    j++;
                }

                // Store the definition (overwriting previous ones if found, 
                // assuming references list is at the end or bottom)
                markerDefinitions.set(marker, content);
            }
        }
    }

    // 4. Build the result objects
    markers.forEach(marker => {
        const definition = markerDefinitions.get(marker);

        // Only include if we found a definition OR if it's a marker we want to track
        // If no definition found, provide a helpful fallback
        const text = definition || `Reference ${marker} (Definition not found in text)`;

        footnotes.push({
            marker,
            text,
            id: `footnote-${marker.replace(/[\[\]]/g, '')}`
        });
    });

    // Sort footnotes by number
    return footnotes.sort((a, b) => {
        const numA = parseInt(a.marker.replace(/[\[\]]/g, ''));
        const numB = parseInt(b.marker.replace(/[\[\]]/g, ''));
        return numA - numB;
    });
}

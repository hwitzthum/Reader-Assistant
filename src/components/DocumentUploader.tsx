import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { parseDocument } from '../services/documentParser';
import { useDocumentStore } from '../store/documentStore';
import './DocumentUploader.css';

export default function DocumentUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setLoading, setDocument, setError, isLoading, error } = useDocumentStore();

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            await processFile(file);
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a PDF or DOCX file.');
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('File is too large. Maximum size is 50MB.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const parsedDoc = await parseDocument(file);
            setDocument(parsedDoc, file);
        } catch (err) {
            console.error('Error processing file:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse document');
        } finally {
            setLoading(false);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="uploader-container">
            <div
                className={`upload-zone glass-card ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={onButtonClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.doc"
                    style={{ display: 'none' }}
                />

                {isLoading ? (
                    <div className="upload-content">
                        <div className="spinner"></div>
                        <p>Processing document...</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📄</div>
                        <h3>Upload Research Article</h3>
                        <p>Drag & drop your PDF or DOCX file here</p>
                        <p className="upload-hint">or click to browse</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message animate-slideIn">
                    ❌ {error}
                </div>
            )}
        </div>
    );
}

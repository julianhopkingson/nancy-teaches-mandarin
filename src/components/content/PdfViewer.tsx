'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    url: string;
    title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }

    function onDocumentLoadError(err: Error) {
        console.error('PDF load error:', err);
        setError('无法加载 PDF 文件');
        setLoading(false);
    }

    const goToPrev = () => setPageNumber(p => Math.max(1, p - 1));
    const goToNext = () => setPageNumber(p => Math.min(numPages, p + 1));
    const zoomIn = () => setScale(s => Math.min(2.5, s + 0.2));
    const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));

    if (!url) {
        return (
            <div className="h-[70vh] flex items-center justify-center bg-[#fffef5] dark:bg-gray-800 rounded-2xl">
                <p className="text-red-500">PDF URL is missing</p>
            </div>
        );
    }

    return (
        <div
            className="bg-[#fffef5] dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Controls */}
            <div className="sticky top-0 bg-white/90 dark:bg-gray-700 px-4 py-3 flex items-center justify-between gap-2 z-10 border-b">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrev}
                        disabled={pageNumber <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-coral text-white disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                    >
                        ‹
                    </button>
                    <span className="text-sm min-w-[60px] text-center">
                        {pageNumber} / {numPages || '-'}
                    </span>
                    <button
                        onClick={goToNext}
                        disabled={pageNumber >= numPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-coral text-white disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                    >
                        ›
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-lg">−</button>
                    <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-lg">+</button>
                </div>
            </div>

            {/* PDF Content */}
            <div className="overflow-auto flex justify-center p-4" style={{ maxHeight: '70vh' }}>
                {loading && (
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-text-muted text-sm">加载中...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-[60vh]">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    error={null}
                >
                    {!loading && !error && (
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    )}
                </Document>
            </div>
        </div>
    );
}


import React, { useRef } from 'react';
import { Document, Page } from 'react-pdf';

interface DocumentViewerProps {
  file: File | null;
  pageNumber: number;
  scale: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onPageRenderSuccess: (page: any) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
  onPageRenderSuccess,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!file) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No document loaded</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative mx-auto"
      onClick={onClick}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex justify-center"
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          onRenderSuccess={onPageRenderSuccess}
          className="shadow-lg"
        />
      </Document>
    </div>
  );
};

export default DocumentViewer;

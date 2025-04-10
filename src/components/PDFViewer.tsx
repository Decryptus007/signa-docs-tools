
import React from 'react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import PDFViewerContainer from './pdf/PDFViewerContainer';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  activeTool: string;
  activeColor: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, activeTool, activeColor }) => {
  console.log('PDFViewer rendering with props:', { activeTool, activeColor });
  
  return (
    <PDFViewerContainer 
      file={file} 
      activeTool={activeTool} 
      activeColor={activeColor} 
    />
  );
};

export default PDFViewer;

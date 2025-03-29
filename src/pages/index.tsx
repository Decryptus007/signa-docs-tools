
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import AnnotationToolbar from '@/components/AnnotationToolbar';
import { toast } from 'sonner';
import download from 'downloadjs';
import { PDFDocument } from 'pdf-lib';

// Dynamically import PDFViewer with no SSR
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { 
  ssr: false
});

const Index = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<string>('none');
  const [activeColor, setActiveColor] = useState<string>('#FEF08A'); // Default yellow

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    setActiveTool('none');
  };

  const handleExport = async () => {
    if (!pdfFile) return;

    toast.info('Preparing document for export...');
    
    try {
      // This is a simplified export - in a real app, we'd need to properly merge
      // annotations with the PDF using PDF.js and PDF-lib
      
      // For demonstration, we'll just return the original PDF
      // In a full implementation, we'd capture the canvas state and merge it with the PDF
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdfDoc.save();
      
      // Generate a new filename
      const originalName = pdfFile.name;
      const newName = originalName.replace('.pdf', '-annotated.pdf');
      
      download(pdfBytes, newName, 'application/pdf');
      toast.success('Document exported successfully!');
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error('Failed to export document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">PDF Annotation Tool</h1>
            
            {!pdfFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Get started by uploading a PDF</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-4">
        {!pdfFile ? (
          <div className="w-full h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <>
            <div className="w-auto">
              <AnnotationToolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                activeColor={activeColor}
                setActiveColor={setActiveColor}
                onExport={handleExport}
                canExport={!!pdfFile}
              />
            </div>
            
            <div className="flex-1 bg-white rounded-lg shadow overflow-auto h-[calc(100vh-12rem)]">
              <PDFViewer 
                file={pdfFile} 
                activeTool={activeTool}
                activeColor={activeColor}
              />
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            PDF Annotation Tool - Created with Lovable
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

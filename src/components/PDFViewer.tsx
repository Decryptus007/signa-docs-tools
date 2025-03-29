
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { fabric } from 'fabric';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  activeTool: string;
  activeColor: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, activeTool, activeColor }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<{ left: number; top: number; text: string }>>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [commentPosition, setCommentPosition] = useState<{ left: number; top: number } | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    toast.success(`Document loaded with ${numPages} pages`);
  };

  const handlePageRenderSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    setPageHeight(viewport.height);
    
    if (canvasContainerRef.current) {
      const containerWidth = canvasContainerRef.current.clientWidth;
      const newScale = containerWidth / viewport.width;
      setScale(newScale * 0.95); // 95% of container width
    }

    initializeCanvas();
  };

  const initializeCanvas = () => {
    if (!canvasContainerRef.current) return;

    // Clean up previous canvas if it exists
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // Create a new canvas element
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'annotation-canvas';
    canvasEl.style.position = 'absolute';
    canvasEl.style.top = '0';
    canvasEl.style.left = '0';
    canvasEl.style.pointerEvents = isAnnotating ? 'auto' : 'none';
    
    // Clear previous canvas
    const oldCanvas = canvasContainerRef.current.querySelector('canvas');
    if (oldCanvas) {
      canvasContainerRef.current.removeChild(oldCanvas);
    }
    
    canvasContainerRef.current.appendChild(canvasEl);

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas('annotation-canvas', {
      width: pageWidth * scale,
      height: pageHeight * scale,
      backgroundColor: 'transparent',
    });

    fabricCanvasRef.current = canvas;
    
    // Set brush options
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;
    canvas.isDrawingMode = isDrawingMode;

    // Render existing comments
    renderComments();
  };

  const renderComments = () => {
    if (!fabricCanvasRef.current) return;
    
    // Remove existing comment elements
    comments.forEach((comment, index) => {
      const existingComment = document.getElementById(`comment-${index}`);
      if (existingComment) {
        existingComment.remove();
      }
    });
    
    // Add comment elements
    comments.forEach((comment, index) => {
      const commentEl = document.createElement('div');
      commentEl.id = `comment-${index}`;
      commentEl.className = 'absolute bg-yellow-100 p-2 rounded shadow-md text-sm';
      commentEl.style.left = `${comment.left}px`;
      commentEl.style.top = `${comment.top}px`;
      commentEl.textContent = comment.text;
      
      if (canvasContainerRef.current) {
        canvasContainerRef.current.appendChild(commentEl);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'comment' && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;
      
      setCommentPosition({ left, top });
      setIsAnnotating(true);
    }
  };

  const addComment = () => {
    if (commentPosition && commentText.trim()) {
      setComments([...comments, { ...commentPosition, text: commentText }]);
      setCommentText('');
      setCommentPosition(null);
      setIsAnnotating(false);
      toast.success('Comment added');
    }
  };

  const cancelComment = () => {
    setCommentText('');
    setCommentPosition(null);
    setIsAnnotating(false);
  };

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = activeTool === 'signature';
      
      if (activeTool === 'highlight' || activeTool === 'underline') {
        fabricCanvasRef.current.freeDrawingBrush.color = activeColor;
        fabricCanvasRef.current.freeDrawingBrush.width = activeTool === 'highlight' ? 20 : 2;
      }
      
      setIsDrawingMode(activeTool === 'signature');
    }
    
    if (canvasContainerRef.current) {
      const canvas = canvasContainerRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.pointerEvents = (activeTool !== 'none') ? 'auto' : 'none';
      }
    }
  }, [activeTool, activeColor]);

  // Adjust canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && pageWidth) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        setScale(containerWidth / pageWidth * 0.95);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageWidth]);

  // Update canvas dimensions when scale changes
  useEffect(() => {
    if (fabricCanvasRef.current && pageWidth && pageHeight) {
      fabricCanvasRef.current.setDimensions({
        width: pageWidth * scale,
        height: pageHeight * scale
      });
      
      // Scale all objects
      fabricCanvasRef.current.getObjects().forEach((obj) => {
        obj.scaleX = scale;
        obj.scaleY = scale;
        obj.left = obj.left ? obj.left * scale : 0;
        obj.top = obj.top ? obj.top * scale : 0;
        obj.setCoords();
      });
      
      fabricCanvasRef.current.renderAll();
      renderComments();
    }
  }, [scale]);

  return (
    <div className="relative w-full h-full">
      {file ? (
        <div className="relative w-full">
          <div 
            ref={canvasContainerRef} 
            className="relative mx-auto"
            onClick={handleCanvasClick}
          >
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onRenderSuccess={handlePageRenderSuccess}
                className="shadow-lg"
              />
            </Document>
          </div>
          
          {numPages && numPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-4">
              <Button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages!}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
          
          {commentPosition && (
            <div 
              className="absolute bg-white p-4 rounded shadow-md z-10 border border-gray-300"
              style={{ 
                left: `${commentPosition.left}px`, 
                top: `${commentPosition.top + 20}px`,
                minWidth: '250px'
              }}
            >
              <textarea
                className="w-full p-2 border rounded mb-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment here..."
                rows={3}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={cancelComment}>Cancel</Button>
                <Button size="sm" onClick={addComment}>Add Comment</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">No document loaded</p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

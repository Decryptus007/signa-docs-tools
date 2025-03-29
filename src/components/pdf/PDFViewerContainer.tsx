
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import DocumentViewer from './DocumentViewer';
import PageNavigation from './PageNavigation';
import AnnotationCanvas from './AnnotationCanvas';
import CommentOverlay from './CommentOverlay';

interface PDFViewerContainerProps {
  file: File | null;
  activeTool: string;
  activeColor: string;
}

const PDFViewerContainer: React.FC<PDFViewerContainerProps> = ({ 
  file, 
  activeTool, 
  activeColor 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [fabricLoaded, setFabricLoaded] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<{ left: number; top: number; text: string }>>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [commentPosition, setCommentPosition] = useState<{ left: number; top: number } | null>(null);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<any>(null);

  // Set drawing mode based on the active tool
  useEffect(() => {
    setIsDrawingMode(activeTool === 'signature' || 
                     activeTool === 'highlight' || 
                     activeTool === 'underline');
    
    if (activeTool !== 'none' && fabricLoaded) {
      toast.info(`${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} tool activated`);
    }
  }, [activeTool, fabricLoaded]);

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

    setFabricLoaded(true);
  };
  
  const renderComments = () => {
    console.log('Canvas initialized, comments can now be rendered');
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

  // Adjust canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && pageWidth) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        setScale(containerWidth / pageWidth * 0.95);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [pageWidth]);

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full" ref={canvasContainerRef}>
        <DocumentViewer
          file={file}
          pageNumber={pageNumber}
          scale={scale}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onPageRenderSuccess={handlePageRenderSuccess}
          onClick={handleCanvasClick}
        />
        
        {fabricLoaded && (
          <AnnotationCanvas
            fabricLoaded={fabricLoaded}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            scale={scale}
            activeColor={activeColor}
            activeTool={activeTool}
            isAnnotating={isAnnotating}
            fabricCanvasRef={fabricCanvasRef}
            containerRef={canvasContainerRef}
            onInitialized={renderComments}
          />
        )}
        
        <CommentOverlay
          comments={comments}
          commentPosition={commentPosition}
          commentText={commentText}
          setCommentText={setCommentText}
          addComment={addComment}
          cancelComment={cancelComment}
        />
      </div>

      <PageNavigation
        pageNumber={pageNumber}
        numPages={numPages}
        setPageNumber={setPageNumber}
      />
    </div>
  );
};

export default PDFViewerContainer;


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
    const isDrawing = activeTool === 'signature' || 
                     activeTool === 'highlight' || 
                     activeTool === 'underline';
    
    setIsDrawingMode(isDrawing);
    
    console.log('Tool changed:', { activeTool, isDrawingMode: isDrawing });
    
    if (activeTool !== 'none' && fabricLoaded) {
      toast.info(`${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} tool activated`);
    }
  }, [activeTool, fabricLoaded]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    toast.success(`Document loaded with ${numPages} pages`);
  };

  const handlePageRenderSuccess = (page: any) => {
    try {
      const viewport = page.getViewport({ scale: 1 });
      setPageWidth(viewport.width);
      setPageHeight(viewport.height);
      
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const newScale = containerWidth / viewport.width;
        setScale(newScale * 0.95); // 95% of container width
      }

      // Delay setting fabric loaded to ensure the PDF page is fully rendered
      setTimeout(() => {
        setFabricLoaded(true);
        console.log('PDF page rendered, fabric can now be loaded');
      }, 300);
    } catch (error) {
      console.error('Error in page render success handler:', error);
    }
  };
  
  const renderComments = () => {
    console.log('Canvas initialized, comments can now be rendered');
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    console.log('Canvas clicked with tool:', activeTool);
    
    if (activeTool === 'comment' && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;
      
      setCommentPosition({ left, top });
      setIsAnnotating(true);
      console.log('Comment position set:', { left, top });
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
        const newScale = containerWidth / pageWidth * 0.95;
        setScale(newScale);
        console.log('Window resized, new scale:', newScale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageWidth]);

  return (
    <div className="relative w-full h-full">
      <div 
        className="relative w-full" 
        ref={canvasContainerRef}
        style={{ cursor: activeTool !== 'none' ? 'crosshair' : 'default' }}
      >
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

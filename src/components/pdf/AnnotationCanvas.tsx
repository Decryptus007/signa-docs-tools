
import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface AnnotationCanvasProps {
  fabricLoaded: boolean;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  activeColor: string;
  activeTool: string;
  isAnnotating: boolean;
  fabricCanvasRef: React.MutableRefObject<any>;
  containerRef: React.RefObject<HTMLDivElement>;
  onInitialized: () => void;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  fabricLoaded,
  pageWidth,
  pageHeight,
  scale,
  activeColor,
  activeTool,
  isAnnotating,
  fabricCanvasRef,
  containerRef,
  onInitialized
}) => {
  const fabricImportAttempted = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && fabricLoaded && !fabricImportAttempted.current) {
      fabricImportAttempted.current = true;
      
      // Import fabric directly with correct module structure for v6
      import('fabric').then((fabricModule) => {
        console.log('Fabric module loaded successfully:', fabricModule);
        // In Fabric.js v6, the Canvas class is exported directly
        if (fabricModule.Canvas) {
          initializeCanvas(fabricModule);
        } else if (fabricModule.fabric && fabricModule.fabric.Canvas) {
          // Fallback for older versions that had a nested structure
          initializeCanvas(fabricModule.fabric);
        } else {
          console.error('Fabric.js loaded but Canvas constructor not found:', fabricModule);
          toast.error('Failed to initialize annotation tools');
        }
      }).catch(error => {
        console.error('Failed to load fabric.js:', error);
        toast.error('Failed to load annotation tools');
      });
    }
  }, [fabricLoaded]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    try {
      console.log('Updating drawing mode for tool:', activeTool);
      
      // Set drawing mode based on the active tool
      fabricCanvasRef.current.isDrawingMode = activeTool === 'signature' || 
                                             activeTool === 'highlight' || 
                                             activeTool === 'underline';
      
      if (fabricCanvasRef.current.isDrawingMode && fabricCanvasRef.current.freeDrawingBrush) {
        // Configure brush based on tool type
        if (activeTool === 'highlight') {
          fabricCanvasRef.current.freeDrawingBrush.width = 20;
          fabricCanvasRef.current.freeDrawingBrush.color = activeColor;
          
          // Set opacity for highlighting
          try {
            fabricCanvasRef.current.freeDrawingBrush.opacity = 0.5;
          } catch (e) {
            console.log('Brush opacity not supported, using alternative method');
            // For some versions that don't support direct opacity
            fabricCanvasRef.current.freeDrawingBrush.color = activeColor + '80'; // 50% alpha
          }
        } else {
          fabricCanvasRef.current.freeDrawingBrush.width = 2;
          fabricCanvasRef.current.freeDrawingBrush.color = activeColor;
        }
        
        console.log('Drawing brush configured:', {
          color: fabricCanvasRef.current.freeDrawingBrush.color,
          width: fabricCanvasRef.current.freeDrawingBrush.width,
          isDrawingMode: fabricCanvasRef.current.isDrawingMode
        });
      }
      
      fabricCanvasRef.current.renderAll();
    } catch (error) {
      console.error('Error updating canvas drawing mode:', error);
    }
    
    // Update canvas pointer events
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.pointerEvents = (activeTool !== 'none') ? 'auto' : 'none';
        console.log('Canvas pointer events set to:', canvas.style.pointerEvents);
      }
    }
  }, [activeTool, activeColor, containerRef]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !pageWidth || !pageHeight) return;
    
    try {
      console.log('Resizing canvas to:', { width: pageWidth * scale, height: pageHeight * scale });
      
      // Set dimensions according to scale
      fabricCanvasRef.current.setDimensions({
        width: pageWidth * scale,
        height: pageHeight * scale
      });
      
      // Scale all objects
      const objects = fabricCanvasRef.current.getObjects();
      if (objects && Array.isArray(objects)) {
        objects.forEach((obj) => {
          if (obj) {
            obj.scaleX = scale;
            obj.scaleY = scale;
            obj.left = obj.left ? obj.left * scale : 0;
            obj.top = obj.top ? obj.top * scale : 0;
            obj.setCoords();
          }
        });
      }
      
      fabricCanvasRef.current.renderAll();
    } catch (error) {
      console.error('Error scaling canvas:', error);
    }
  }, [scale, pageWidth, pageHeight]);

  const initializeCanvas = (fabricModule: any) => {
    if (!containerRef.current) {
      console.warn('Container ref not available');
      return;
    }

    try {
      console.log('Initializing fabric canvas with module:', fabricModule);
      
      // Clean up previous canvas if it exists
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        } catch (err) {
          console.error('Error disposing fabric canvas:', err);
        }
      }

      // Create a new canvas element
      const canvasEl = document.createElement('canvas');
      canvasEl.id = 'annotation-canvas';
      canvasEl.style.position = 'absolute';
      canvasEl.style.top = '0';
      canvasEl.style.left = '0';
      canvasEl.style.pointerEvents = isAnnotating || activeTool !== 'none' ? 'auto' : 'none';
      canvasEl.style.zIndex = '10';
      
      // Find and safely remove the old canvas
      const oldCanvas = containerRef.current.querySelector('#annotation-canvas');
      if (oldCanvas && oldCanvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(oldCanvas);
      }
      
      // Add the new canvas
      containerRef.current.appendChild(canvasEl);

      // Make sure we have valid dimensions
      const canvasWidth = Math.max(pageWidth * scale, 100);
      const canvasHeight = Math.max(pageHeight * scale, 100);
      
      console.log('Creating new fabric canvas with dimensions:', { 
        width: canvasWidth, 
        height: canvasHeight 
      });

      // Initialize Fabric.js canvas using the Canvas constructor from the imported module
      const FabricCanvas = fabricModule.Canvas;
      const canvas = new FabricCanvas(canvasEl, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'transparent',
        selection: false
      });

      // Store the canvas reference
      fabricCanvasRef.current = canvas;
      
      // Initialize the brush - crucial for drawing tools
      if (!canvas.freeDrawingBrush) {
        // In Fabric v6, we need to create a PencilBrush
        if (fabricModule.PencilBrush) {
          canvas.freeDrawingBrush = new fabricModule.PencilBrush(canvas);
        } else if (fabricModule.BaseBrush) {
          // Fallback if PencilBrush is not available
          canvas.freeDrawingBrush = new fabricModule.BaseBrush(canvas);
        }
      }
      
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = activeTool === 'highlight' ? 20 : 2;
        
        // Try to set opacity for highlighting if supported
        if (activeTool === 'highlight' && canvas.freeDrawingBrush.opacity !== undefined) {
          canvas.freeDrawingBrush.opacity = 0.5;
        }
      }
      
      // Set drawing mode based on active tool
      canvas.isDrawingMode = activeTool === 'signature' || 
                           activeTool === 'highlight' || 
                           activeTool === 'underline';

      console.log('Drawing mode initialized:', {
        isDrawingMode: canvas.isDrawingMode,
        activeTool: activeTool
      });

      // Add event listeners to debug and verify canvas interaction
      canvas.on('mouse:down', (e) => {
        console.log('Canvas mouse down with tool:', activeTool, e);
      });
      
      canvas.on('path:created', (e) => {
        console.log('Path created:', e);
        toast.success('Annotation added');
      });

      // Notify parent component the canvas is ready
      onInitialized();
      toast.success('Annotation tools ready');
      console.log('Fabric canvas initialized successfully');
    } catch (err) {
      console.error('Failed to initialize annotation canvas:', err);
      toast.error('Failed to initialize annotation tools');
    }
  };

  return null; // This is a non-visual component that manages the canvas
};

export default AnnotationCanvas;

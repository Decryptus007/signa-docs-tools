
import React, { useEffect, useRef } from 'react';

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
  const fabricModuleRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && fabricLoaded && !fabricModuleRef.current) {
      import('fabric').then((module) => {
        fabricModuleRef.current = module;
        initializeCanvas();
      }).catch(error => {
        console.error('Failed to load fabric.js:', error);
      });
    }
  }, [fabricLoaded]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.isDrawingMode = activeTool === 'signature';
        
        if (activeTool === 'highlight' || activeTool === 'underline') {
          fabricCanvasRef.current.freeDrawingBrush.color = activeColor;
          fabricCanvasRef.current.freeDrawingBrush.width = activeTool === 'highlight' ? 20 : 2;
        }
      } catch (error) {
        console.error('Error updating canvas drawing mode:', error);
      }
    }
    
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.pointerEvents = (activeTool !== 'none') ? 'auto' : 'none';
      }
    }
  }, [activeTool, activeColor, containerRef, fabricCanvasRef]);

  useEffect(() => {
    if (fabricCanvasRef.current && pageWidth && pageHeight) {
      try {
        fabricCanvasRef.current.setDimensions({
          width: pageWidth * scale,
          height: pageHeight * scale
        });
        
        // Scale all objects
        const objects = fabricCanvasRef.current.getObjects();
        if (objects && Array.isArray(objects)) {
          objects.forEach((obj: any) => {
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
    }
  }, [scale, pageWidth, pageHeight, fabricCanvasRef]);

  const initializeCanvas = () => {
    if (!containerRef.current || !fabricModuleRef.current) {
      console.warn('Container ref or fabric module not available yet');
      return;
    }

    try {
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
      canvasEl.style.pointerEvents = isAnnotating ? 'auto' : 'none';
      
      // Find and safely remove the old canvas
      const oldCanvas = containerRef.current.querySelector('#annotation-canvas');
      if (oldCanvas) {
        // Check if oldCanvas is actually a child of containerRef.current
        if (oldCanvas.parentNode === containerRef.current) {
          containerRef.current.removeChild(oldCanvas);
        } else {
          console.warn('Old canvas found but is not a child of container, cannot remove');
        }
      }
      
      // Add the new canvas
      containerRef.current.appendChild(canvasEl);

      // Initialize Fabric.js canvas using the imported module
      const { Canvas } = fabricModuleRef.current;
      
      if (!Canvas) {
        console.error('Fabric Canvas constructor not found. Make sure fabric.js is loaded correctly.');
        return;
      }
      
      try {
        const canvas = new Canvas(canvasEl, {
          width: pageWidth * scale || 100, // Fallback dimensions if pageWidth is not set yet
          height: pageHeight * scale || 100,
          backgroundColor: 'transparent',
        });

        fabricCanvasRef.current = canvas;
        
        // Set brush options
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = activeColor;
          canvas.freeDrawingBrush.width = 2;
          canvas.isDrawingMode = activeTool === 'signature';
        }

        // Notify parent component
        onInitialized();
      } catch (error) {
        console.error('Error initializing Fabric canvas:', error);
      }
    } catch (err) {
      console.error('Failed to initialize annotation canvas:', err);
    }
  };

  return null; // This is a non-visual component that manages the canvas
};

export default AnnotationCanvas;

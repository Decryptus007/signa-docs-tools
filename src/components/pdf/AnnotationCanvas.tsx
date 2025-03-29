
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
      });
    }
  }, [fabricLoaded]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = activeTool === 'signature';
      
      if (activeTool === 'highlight' || activeTool === 'underline') {
        fabricCanvasRef.current.freeDrawingBrush.color = activeColor;
        fabricCanvasRef.current.freeDrawingBrush.width = activeTool === 'highlight' ? 20 : 2;
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
      fabricCanvasRef.current.setDimensions({
        width: pageWidth * scale,
        height: pageHeight * scale
      });
      
      // Scale all objects
      fabricCanvasRef.current.getObjects().forEach((obj: any) => {
        obj.scaleX = scale;
        obj.scaleY = scale;
        obj.left = obj.left ? obj.left * scale : 0;
        obj.top = obj.top ? obj.top * scale : 0;
        obj.setCoords();
      });
      
      fabricCanvasRef.current.renderAll();
    }
  }, [scale, pageWidth, pageHeight, fabricCanvasRef]);

  const initializeCanvas = () => {
    if (!containerRef.current || !fabricModuleRef.current) return;

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
    
    // Find and safely remove the old canvas
    const oldCanvas = containerRef.current.querySelector('#annotation-canvas');
    if (oldCanvas && oldCanvas.parentNode === containerRef.current) {
      containerRef.current.removeChild(oldCanvas);
    }
    
    containerRef.current.appendChild(canvasEl);

    // Initialize Fabric.js canvas
    const { Canvas } = fabricModuleRef.current;
    const canvas = new Canvas(canvasEl, {
      width: pageWidth * scale,
      height: pageHeight * scale,
      backgroundColor: 'transparent',
    });

    fabricCanvasRef.current = canvas;
    
    // Set brush options
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;
    canvas.isDrawingMode = activeTool === 'signature';

    onInitialized();
  };

  return null; // This is a non-visual component that manages the canvas
};

export default AnnotationCanvas;

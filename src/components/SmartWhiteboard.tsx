import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X } from 'lucide-react';

interface SmartWhiteboardProps {
  onSave: (base64Image: string) => void;
  onClose: () => void;
}

const SmartWhiteboard = ({ onSave, onClose }: SmartWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas details and prevent mobile scrolling natively
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const ctx = canvas.getContext('2d');
        let imgData: ImageData | null = null;
        if (ctx && canvas.width > 0) {
          try { imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch(e) {}
        }
        
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (imgData) {
            ctx.putImageData(imgData, 0, 0);
          }
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'black';
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // This is the absolute key to fixing mobile drawing:
    // React's synthetic touch events are passive by default, 
    // so we must use native events to prevent the window from scrolling while drawing.
    const preventScroll = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };
    
    // addEventListener with { passive: false } overrides default mobile scroll behavior
    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('touchstart', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // reset path
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a JPEG to save space
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background sm:p-4 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm">
        <div>
          <h3 className="font-bold text-foreground">Pizarrón Inteligente</h3>
          <p className="text-xs text-muted-foreground">Dibuja tus ecuaciones a mano ✏️</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative bg-muted/30 p-3 sm:p-6 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white rounded-2xl shadow-sm border border-border cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }} // Crucial to prevent page scrolling while drawing on mobile
        />
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-card border-t border-border flex justify-between gap-3 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
        <Button variant="outline" onClick={clearCanvas} className="gap-2 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 flex-1 sm:flex-none">
          <Trash2 size={18} /> Borrar
        </Button>
        <Button onClick={handleSave} className="flex-[2] gap-2 shadow-md">
          <Check size={18} /> Enviar al Tutor
        </Button>
      </div>
    </div>
  );
};

export default SmartWhiteboard;

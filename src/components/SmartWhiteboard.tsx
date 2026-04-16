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

  // Initialize canvas details
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        // Adjust canvas size to parent container
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // white background
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent scrolling
    if ('touches' in e && e.cancelable !== false) {
       // React's synthetic events sometimes can't preventDefault if passive: true
       // But we handle it via CSS touch-action: none.
    }
    
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

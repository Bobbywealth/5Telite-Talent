import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignatureCaptureProps {
  contractTitle: string;
  onSign: (signatureDataUrl: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  width?: number;
  height?: number;
}

export function SignatureCapture({ 
  contractTitle,
  onSign, 
  onCancel, 
  isLoading = false,
  width = 400,
  height = 200 
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isLoading) return;

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!hasSignature) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureDataUrl = canvas.toDataURL('image/png');
    onSign(signatureDataUrl);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Digital Signature</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please sign in the box below using your mouse or finger.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`border border-slate-200 dark:border-slate-700 rounded cursor-crosshair ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e);
            }}
            onTouchEnd={stopDrawing}
            data-testid="signature-canvas"
          />
        </div>
        
        <div className="text-center mb-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {hasSignature ? (
              <span className="text-green-600 dark:text-green-400">✓ Signature captured</span>
            ) : (
              <span>Draw your signature above</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature || isLoading}
            data-testid="button-clear-signature"
          >
            Clear
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel-signature"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!hasSignature || isLoading}
              data-testid="button-sign-contract"
            >
              {isLoading ? "Signing..." : "Sign Contract"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
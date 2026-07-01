import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  showDownloadButton?: boolean;
}

export default function QRCodeComponent({
  value,
  size = 180,
  className = '',
  showDownloadButton = true,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size * 2, // Generate at 2x resolution for crispness, scaled via CSS
          margin: 2,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error rendering QR code', error);
        }
      );
    }
  }, [value, size]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    try {
      const pngUrl = canvasRef.current.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-website.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Failed to download QR code PNG:', err);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-xs max-w-full ${className}`}>
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/20">
        <canvas 
          ref={canvasRef} 
          className="rounded-lg" 
          style={{ width: size, height: size }} 
        />
      </div>
      
      {showDownloadButton && (
        <button
          type="button"
          onClick={downloadPNG}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors cursor-pointer w-full justify-center"
        >
          📥 ទាញយក QR Code (PNG)
        </button>
      )}
    </div>
  );
}

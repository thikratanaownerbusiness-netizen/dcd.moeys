import React from 'react';

// Code 39 encoding table
// 'n' for narrow, 'w' for wide
const CODE39_ENCODINGS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  'A': 'wnnnnwnnw',
  'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn',
  'D': 'nnnnwwnnw',
  'E': 'wnnnwwnnn',
  'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw',
  'H': 'wnnnnwwnn',
  'I': 'nnwnnwwnn',
  'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww',
  'L': 'nnwnnnnww',
  'M': 'wnwnnnnwn',
  'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn',
  'P': 'nnwnwnnwn',
  'Q': 'nnnnnnwww',
  'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn',
  'T': 'nnnnwnwwn',
  'U': 'wwnnnnnnw',
  'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn',
  'X': 'nwnnwnnnw',
  'Y': 'wwnnwnnnn',
  'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  '*': 'nwnnwnwnn', // Start/Stop
  '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn'
};

interface BarcodeProps {
  value: string;
  height?: number;
  showText?: boolean;
  className?: string;
  showDownloadButton?: boolean;
}

export default function Barcode({
  value,
  height = 50,
  showText = true,
  className = '',
  showDownloadButton = false
}: BarcodeProps) {
  // Normalize value: convert to uppercase, filter supported Code 39 characters
  const normalizedValue = value.toUpperCase();
  
  // Create full Code 39 string with start/stop characters
  const fullString = `*${normalizedValue}*`;
  
  const narrowWidth = 1.5;
  const wideWidth = 4.0;
  const gapWidth = 1.5;

  // Compute positions
  const rects: { x: number; width: number }[] = [];
  let currentX = 0;

  for (let c = 0; c < fullString.length; c++) {
    const char = fullString[c];
    const pattern = CODE39_ENCODINGS[char] || CODE39_ENCODINGS[' ']; // fallback to space if unsupported

    for (let i = 0; i < 9; i++) {
      const isBar = i % 2 === 0;
      const isWide = pattern[i] === 'w';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push({ x: currentX, width });
      }
      currentX += width;
    }
    // Add inter-character gap
    currentX += gapWidth;
  }

  const svgWidth = currentX - gapWidth; // subtract the last extra gap
  const svgId = `barcode-svg-${normalizedValue.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const downloadSVG = () => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) return;
    
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `barcode-${normalizedValue}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const downloadPNG = () => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 4; // High-resolution scale for crisp barcode scanning when printed
      const barCanvasHeight = height * scale;
      let totalCanvasHeight = barCanvasHeight;
      
      if (showText) {
        totalCanvasHeight += 24 * scale;
      }
      
      canvas.width = svgWidth * scale;
      canvas.height = totalCanvasHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw white crisp background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the barcode bars
        context.drawImage(image, 0, 0, canvas.width, barCanvasHeight);
        
        // Draw matching human-readable code string
        if (showText) {
          context.font = `bold ${10 * scale}px monospace`;
          context.fillStyle = '#000000';
          context.textAlign = 'center';
          context.textBaseline = 'top';
          context.fillText(normalizedValue, canvas.width / 2, barCanvasHeight + (4 * scale));
        }
        
        try {
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `barcode-${normalizedValue}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (err) {
          console.error("Failed to generate PNG image download:", err);
        }
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-100 dark:border-slate-800/45 shadow-2xs max-w-full ${className}`}>
      <svg
        id={svgId}
        width="100%"
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="text-slate-950 fill-current dark:text-slate-900"
      >
        {rects.map((r, idx) => (
          <rect
            key={idx}
            x={r.x}
            y={0}
            width={r.width}
            height={height}
          />
        ))}
      </svg>
      {showText && (
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-slate-700 dark:text-slate-400 mt-1 select-all">
          {normalizedValue}
        </span>
      )}

      {showDownloadButton && (
        <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/40 w-full justify-center no-print">
          <button
            type="button"
            onClick={downloadPNG}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
            title="Download high resolution label for printing"
          >
            💾 ទាញយក PNG
          </button>
          <button
            type="button"
            onClick={downloadSVG}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-450 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Download scalable vector graphic"
          >
            💾 ទាញយក SVG
          </button>
        </div>
      )}
    </div>
  );
}

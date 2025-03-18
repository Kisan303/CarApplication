import { SVGProps } from "react";

export function MusicIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      {...props}
    >
      <defs>
        <linearGradient id="record-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="100%" height="100%" fill="#faf5ff" />
      
      {/* Turntable base */}
      <rect x="200" y="300" width="400" height="50" rx="10" fill="#1e1b4b" />
      <rect x="210" y="180" width="380" height="120" rx="10" fill="#312e81" />
      
      {/* Turntable platter */}
      <circle cx="400" cy="240" r="120" fill="#4c1d95" stroke="#2e1065" strokeWidth="2" />
      
      {/* Records */}
      <g>
        {/* Record 1 - Bottom */}
        <circle cx="400" cy="240" r="100" fill="#1e1b4b" stroke="#000" strokeWidth="1" />
        <circle cx="400" cy="240" r="95" fill="#4a1d96" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="90" fill="#5b21b6" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="40" fill="#2e1065" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="35" fill="#4a1d96" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="30" fill="#7e22ce" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="25" fill="#a855f7" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="20" fill="#d8b4fe" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="15" fill="#f3e8ff" stroke="#000" strokeWidth="0.5" />
        <circle cx="400" cy="240" r="5" fill="#1e1b4b" />
        
        {/* Grooves */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle 
            key={i} 
            cx="400" 
            cy="240" 
            r={45 + i * 3} 
            fill="none" 
            stroke="#2e1065" 
            strokeWidth="0.5" 
            opacity="0.3" 
          />
        ))}
      </g>
      
      {/* Tonearm */}
      <g>
        <circle cx="520" cy="240" r="15" fill="#64748b" stroke="#334155" strokeWidth="1" />
        <rect x="460" y="235" width="60" height="10" fill="#64748b" stroke="#334155" strokeWidth="1" rx="5" />
        <rect x="420" y="230" width="40" height="20" fill="#64748b" stroke="#334155" strokeWidth="1" rx="5" transform="rotate(-10 420 240)" />
      </g>
      
      {/* Music notes floating */}
      <g>
        {[
          { x: 600, y: 180, scale: 1.2, rotate: 10 },
          { x: 650, y: 230, scale: 0.8, rotate: -15 },
          { x: 580, y: 270, scale: 1, rotate: 5 },
          { x: 620, y: 150, scale: 0.7, rotate: 20 },
          { x: 570, y: 200, scale: 0.9, rotate: -10 }
        ].map((note, i) => (
          <g key={i} transform={`translate(${note.x}, ${note.y}) scale(${note.scale}) rotate(${note.rotate})`}>
            <path 
              d="M0,0 C0,-20 5,-30 15,-30 C25,-30 25,-15 15,-10 C5,-5 0,-10 0,-20 L0,20" 
              fill="#8b5cf6" 
              stroke="#6d28d9" 
              strokeWidth="1"
            />
            <ellipse cx="0" cy="20" rx="6" ry="4" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1" />
          </g>
        ))}
      </g>
      
      {/* Control buttons */}
      <g transform="translate(300, 300)">
        <circle cx="0" cy="35" r="8" fill="#a855f7" />
        <rect x="20" y="30" width="25" height="10" rx="5" fill="#a855f7" />
        <rect x="55" y="30" width="10" height="10" rx="2" fill="#a855f7" />
        <rect x="75" y="30" width="10" height="10" rx="2" fill="#a855f7" />
      </g>
    </svg>
  );
}
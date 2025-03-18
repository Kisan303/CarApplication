import { SVGProps } from "react";

export function CarIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      {...props}
    >
      <defs>
        <linearGradient id="car-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="car-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
      
      {/* Background with snow effect */}
      <rect width="100%" height="100%" fill="#f1f5f9" />
      <g className="snowflakes">
        {Array.from({ length: 50 }).map((_, i) => (
          <circle
            key={i}
            cx={Math.random() * 800}
            cy={Math.random() * 600}
            r={Math.random() * 3 + 1}
            fill="white"
          />
        ))}
      </g>
      
      {/* Shadow */}
      <ellipse cx="400" cy="500" rx="220" ry="40" fill="#94a3b8" opacity="0.3" filter="url(#car-shadow)" />
      
      {/* Car body */}
      <g transform="translate(180, 250)">
        {/* Car base */}
        <path
          d="M10,160 C10,100 60,100 100,80 L300,80 C380,80 400,120 430,160 L10,160 Z"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="2"
        />
        
        {/* Roof */}
        <path
          d="M120,80 L140,30 L270,30 L290,80 Z"
          fill="#2563eb"
          stroke="#1e40af"
          strokeWidth="2"
        />
        
        {/* Windows */}
        <path
          d="M125,75 L145,35 L265,35 L285,75 Z"
          fill="#bfdbfe"
          stroke="#1e40af"
          strokeWidth="1"
        />
        
        {/* Window dividers */}
        <line x1="205" y1="35" x2="205" y2="75" stroke="#1e40af" strokeWidth="1" />
        
        {/* Wheels */}
        <g transform="translate(100, 160)">
          <circle cx="0" cy="0" r="35" fill="#0f172a" stroke="#000000" strokeWidth="2" />
          <circle cx="0" cy="0" r="25" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="#94a3b8" />
        </g>
        <g transform="translate(340, 160)">
          <circle cx="0" cy="0" r="35" fill="#0f172a" stroke="#000000" strokeWidth="2" />
          <circle cx="0" cy="0" r="25" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="#94a3b8" />
        </g>
        
        {/* Details */}
        <rect x="400" y="120" width="25" height="10" fill="#ef4444" rx="3" /> {/* Taillight */}
        <rect x="20" y="120" width="25" height="10" fill="#f59e0b" rx="3" /> {/* Headlight */}
        <rect x="350" y="110" width="5" height="15" fill="#f59e0b" /> {/* Door handle */}
        
        {/* Roof luggage */}
        <rect x="160" y="10" width="80" height="20" rx="5" fill="#854d0e" stroke="#422006" strokeWidth="1" />
        <rect x="170" y="5" width="60" height="5" fill="#a16207" stroke="#422006" strokeWidth="1" />
      </g>
    </svg>
  );
}
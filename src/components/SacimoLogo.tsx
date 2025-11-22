import React from 'react'

interface SacimoLogoProps {
  className?: string
  size?: number
}

export function SacimoLogo({ className = "", size = 40 }: SacimoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background gradient circle */}
      <defs>
        <linearGradient id="sacimoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C5CDB" />
          <stop offset="100%" stopColor="#5E3A9B" />
        </linearGradient>
        <linearGradient id="sacimoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B72E7" />
          <stop offset="100%" stopColor="#7C5CDB" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="8"
        fill="url(#sacimoGradient)"
      />

      {/* House/Building shape */}
      <path
        d="M20 10L12 16V28H16V22H24V28H28V16L20 10Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Door */}
      <rect
        x="17"
        y="22"
        width="6"
        height="6"
        rx="1"
        fill="url(#sacimoGradient)"
      />

      {/* AI/Sparkle element - top right */}
      <g transform="translate(26, 8)">
        <path
          d="M4 0L4.5 2.5L7 3L4.5 3.5L4 6L3.5 3.5L1 3L3.5 2.5L4 0Z"
          fill="white"
          fillOpacity="0.9"
        />
      </g>

      {/* Small sparkle - bottom left */}
      <g transform="translate(10, 26)">
        <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.8" />
        <path
          d="M2 0L2 1L3 1L3 2L2 2L2 3L1 3L1 2L0 2L0 1L1 1L1 0L2 0Z"
          fill="white"
          fillOpacity="0.6"
        />
      </g>
    </svg>
  )
}


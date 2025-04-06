"use client"

import { useState, useEffect } from "react"

export default function LMSCardanoLogo({ onClick, className = "" }) {
  const [hovered, setHovered] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Start animation after component mounts
    setAnimated(true)

    // Optional: create a subtle animation loop
    const interval = setInterval(() => {
      setAnimated((prev) => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center gap-2 cursor-pointer ${className}`} onClick={onClick}>
      <div
        className="relative w-8 h-8 transition-all duration-500 ease-in-out"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full transition-all duration-500 ${hovered ? "scale-105" : "scale-100"}`}
        >
          {/* Gradient background */}
          <defs>
            <linearGradient id="cardanoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0033AD" />
              <stop offset="100%" stopColor="#0055FF" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main circle with gradient */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="url(#cardanoGradient)"
            className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-90"}`}
          />

          {/* Decorative rings */}
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            className={`transition-all duration-1000 ${animated ? "opacity-100" : "opacity-0"}`}
          />
          <circle
            cx="100"
            cy="100"
            r="65"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            className={`transition-all duration-1000 delay-100 ${animated ? "opacity-100" : "opacity-0"}`}
          />

          {/* Cardano symbol (improved) */}
          <circle
            cx="100"
            cy="100"
            r="55"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            className={`transition-all duration-700 ${hovered ? "stroke-opacity-90" : "stroke-opacity-80"}`}
          />
          <circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className={`transition-all duration-700 delay-100 ${hovered ? "stroke-opacity-90" : "stroke-opacity-80"}`}
          />

          {/* Book/learning element (improved) */}
          <g
            className={`transition-all duration-500 ${hovered ? "translate-x-1 translate-y-1" : ""}`}
            filter="url(#glow)"
          >
            <path d="M85 75 L85 125 L115 110 L145 125 L145 75 Z" fill="white" opacity="0.95" />
            <path d="M85 75 L85 125 L115 110 L115 75 Z" fill="#f0f8ff" opacity="0.7" />
            <path d="M85 75 L145 75 L145 125 L85 125" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />

            {/* Book pages */}
            <path d="M100 80 L130 80" stroke="rgba(0,51,173,0.3)" strokeWidth="1" />
            <path d="M100 85 L130 85" stroke="rgba(0,51,173,0.3)" strokeWidth="1" />
            <path d="M100 90 L130 90" stroke="rgba(0,51,173,0.3)" strokeWidth="1" />
            <path d="M100 95 L120 95" stroke="rgba(0,51,173,0.3)" strokeWidth="1" />
          </g>

          {/* Blockchain nodes (improved) */}
          <g className={`transition-all duration-700 ${animated ? "opacity-100" : "opacity-0"}`}>
            <circle cx="60" cy="85" r="4" fill="white" opacity="0.9" />
            <circle cx="70" cy="105" r="4" fill="white" opacity="0.9" />
            <circle cx="60" cy="125" r="4" fill="white" opacity="0.9" />
            <circle cx="140" cy="85" r="4" fill="white" opacity="0.9" />
            <circle cx="130" cy="105" r="4" fill="white" opacity="0.9" />
            <circle cx="140" cy="125" r="4" fill="white" opacity="0.9" />

            <path d="M60 85 L70 105 L60 125" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M140 85 L130 105 L140 125" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path
              d="M60 85 C90 65, 110 65, 140 85"
              stroke="white"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
              strokeDasharray="3,3"
              className={`transition-all duration-1000 ${animated ? "opacity-70" : "opacity-0"}`}
            />
            <path
              d="M60 125 C90 145, 110 145, 140 125"
              stroke="white"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
              strokeDasharray="3,3"
              className={`transition-all duration-1000 ${animated ? "opacity-70" : "opacity-0"}`}
            />
          </g>
        </svg>
      </div>

      {/* Logo text (improved) */}
      <div className="text-center">
        <h1 className="text-sm font-bold tracking-tight flex items-center gap-1">
          <span className="bg-gradient-to-r from-[#0033AD] to-[#0055FF] bg-clip-text text-transparent font-extrabold">
            LMS
          </span>
          <span className="text-gray-700 font-light">|</span>
          <span className="text-gray-800 font-semibold">Cardano</span>
        </h1>
      </div>
    </div>
  )
}

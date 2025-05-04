"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

function CircularDesign() {
  const [hovered, setHovered] = useState(false)
  const [animated, setAnimated] = useState(false)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    // Start animation after component mounts
    setAnimated(true)

    // Create a subtle animation loop
    const interval = setInterval(() => {
      setAnimated((prev) => !prev)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }

  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0px 10px 30px rgba(0, 0, 0, 0.2))" }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
          <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="textHoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="pattern1" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
            <rect width="100%" height="100%" fill="none" />
            <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.3)" />
          </pattern>
        </defs>

        {/* Background pattern */}
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="url(#pattern1)"
          className={`transition-all duration-1000 ${animated ? "opacity-70" : "opacity-40"}`}
        />

        {/* Main circle with gradient */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill={hovered ? "url(#hoverGradient)" : "url(#mainGradient)"}
          className={`transition-all duration-500 ${clicked ? "opacity-90" : "opacity-100"}`}
        />

        {/* Decorative rings */}
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          className={`transition-all duration-1000 ${animated ? "opacity-100" : "opacity-40"}`}
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="3"
          className={`transition-all duration-1000 delay-100 ${animated ? "opacity-100" : "opacity-40"}`}
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
          className={`transition-all duration-1000 delay-200 ${animated ? "opacity-100" : "opacity-40"}`}
        />

        {/* Inner circle with pulse effect */}
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="rgba(255,255,255,0.15)"
          className={`transition-all duration-1500 ${animated ? "opacity-70" : "opacity-30"}`}
        />
        <circle
          cx="200"
          cy="200"
          r="80"
          fill="rgba(255,255,255,0.25)"
          className={`transition-all duration-1500 delay-300 ${animated ? "opacity-80" : "opacity-40"}`}
        />

        {/* Center circle */}
        <circle
          cx="200"
          cy="200"
          r="65"
          fill="white"
          filter="url(#glow)"
          className={`transition-all duration-700 ${hovered ? "opacity-95" : "opacity-90"} ${
            clicked ? "opacity-100" : ""
          }`}
        />

        {/* Decorative elements */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle} 200 200)`}>
            <circle
              cx="200"
              cy="80"
              r={hovered ? "10" : "8"}
              fill="white"
              className={`transition-all duration-500 delay-${index * 50} ${animated ? "opacity-90" : "opacity-50"}`}
            />
            <line
              x1="200"
              y1="90"
              x2="200"
              y2="110"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              className={`transition-all duration-700 delay-${index * 50} ${animated ? "opacity-80" : "opacity-40"}`}
            />
          </g>
        ))}

        {/* Animated arcs */}
        <path
          d="M 80 200 A 120 120 0 0 1 320 200"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeDasharray="10,10"
          className={`transition-all duration-2000 ${animated ? "opacity-80" : "opacity-40"}`}
        />
        <path
          d="M 320 200 A 120 120 0 0 1 80 200"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeDasharray="10,10"
          className={`transition-all duration-2000 ${animated ? "opacity-40" : "opacity-80"}`}
        />

        {/* Decorative particles */}
        {[...Array(20)].map((_, i) => {
          const angle = Math.random() * 360
          const distance = 140 + Math.random() * 40
          const x = 200 + distance * Math.cos((angle * Math.PI) / 180)
          const y = 200 + distance * Math.sin((angle * Math.PI) / 180)
          const size = 1 + Math.random() * 3

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill="white"
              className={`transition-all duration-1000 delay-${i * 100} ${animated ? "opacity-80" : "opacity-40"}`}
            />
          )
        })}

        {/* Text "LMS CaUTC" in the center with enhanced styling */}
        <g filter="url(#textGlow)">
          <text
            x="200"
            y="190"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`transition-all duration-500 ${hovered ? "opacity-100" : "opacity-95"}`}
            style={{
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: "800",
              fontSize: "32px",
              fill: hovered ? "url(#textHoverGradient)" : "url(#textGradient)",
              letterSpacing: "1px",
            }}
          >
            LMS
          </text>
          <text
            x="200"
            y="225"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`transition-all duration-500 ${hovered ? "opacity-100" : "opacity-95"}`}
            style={{
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: "700",
              fontSize: "28px",
              fill: hovered ? "url(#textHoverGradient)" : "url(#textGradient)",
              letterSpacing: "0.5px",
            }}
          >
            CaUTC
          </text>
        </g>

        {/* Subtle shine effect */}
        <ellipse
          cx="170"
          cy="170"
          rx="50"
          ry="30"
          fill="rgba(255,255,255,0.15)"
          transform="rotate(-30 170 170)"
          className={`transition-all duration-1000 ${hovered ? "opacity-30" : "opacity-20"}`}
        />
      </svg>

      {/* Outer glow effect */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${hovered ? "opacity-70" : "opacity-0"}`}
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(255,255,255,0) 70%)",
          zIndex: -1,
          transform: "scale(1.2)",
        }}
      ></div>
    </motion.div>
  )
}

// SplashScreen component that will show for 8 seconds or until clicked
const SplashScreen = ({ onComplete }) => {
  // Xử lý khi người dùng click vào splash screen
  const handleClick = () => {
    if (onComplete) onComplete();
  };

  useEffect(() => {
    // Set a timeout to call onComplete after 8 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 8000);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleClick}
    >
      <div className="w-[80vmin] max-w-[600px] min-w-[300px]">
        <CircularDesign />
      </div>
      
      {/* URL hiển thị phía dưới */}
      <motion.div 
        className="mt-8 text-white text-lg font-medium opacity-70"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        By team_blockchain
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;

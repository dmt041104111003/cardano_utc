import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < 4 ? prevStep + 1 : 0));
    }, 2000);
    return () => clearInterval(stepInterval);
  }, []);
  
  useEffect(() => {
    if (!heroRef.current) return;
    
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 1 + 0.5,
        delay: Math.random() * 5,
        color: [
          'rgba(79, 70, 229, 0.4)', // indigo
          'rgba(59, 130, 246, 0.4)', // blue
          'rgba(139, 92, 246, 0.4)', // purple
          'rgba(236, 72, 153, 0.4)'  // pink
        ][Math.floor(Math.random() * 4)]
      });
    }
    setParticles(newParticles);
    
    const handleMouseMove = (e) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-speed');
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        el.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={heroRef} className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white min-h-screen overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }}
            animate={{
              y: ['0%', '100%'],
              x: [`${particle.x}%`, `${particle.x + (Math.random() * 10 - 5)}%`],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: particle.speed * 10,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute text-indigo-500 opacity-20 parallax"
          data-speed="5"
          style={{ fontSize: '80px', top: '15%', left: '10%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
            <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute text-blue-500 opacity-20 parallax"
          data-speed="3"
          style={{ fontSize: '60px', bottom: '25%', right: '15%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
            <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
            <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
            <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute text-purple-500 opacity-20 parallax"
          data-speed="4"
          style={{ fontSize: '70px', top: '30%', right: '20%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </div>
      
      <div className="absolute right-10 top-40 hidden lg:block parallax" data-speed="2">
        <div className="scene">
          <div className="cube">
            <div className="cube__face cube__face--front"></div>
            <div className="cube__face cube__face--back"></div>
            <div className="cube__face cube__face--right"></div>
            <div className="cube__face cube__face--left"></div>
            <div className="cube__face cube__face--top"></div>
            <div className="cube__face cube__face--bottom"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute left-20 bottom-40 hidden lg:block parallax" data-speed="3">
        <div className="scene scene--small">
          <div className="cube cube--small">
            <div className="cube__face cube__face--front"></div>
            <div className="cube__face cube__face--back"></div>
            <div className="cube__face cube__face--right"></div>
            <div className="cube__face cube__face--left"></div>
            <div className="cube__face cube__face--top"></div>
            <div className="cube__face cube__face--bottom"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/3 left-1/4 hidden lg:block parallax" data-speed="1">
        <div className="glowing-orb"></div>
      </div>
      
      <div className="relative max-w-6xl w-full text-center space-y-10 z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4 shadow-glow"
        >
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
            Blockchain-Powered Learning Platform
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="perspective-container my-6"
        >
          <h1 className="md:text-6xl text-4xl font-extrabold leading-tight max-w-4xl mx-auto">
            <div className="threed-text-container">
              <span className="threed-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
                Welcome to Lms - Cardano
              </span>
            </div>
            <span className="inline-block relative mt-2">
              <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"></span>
              <span className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-70 animate-pulse"></span>
            </span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl filter opacity-70 animate-pulse-slow"></div>
          <p className="relative text-gray-600 text-lg bg-white/80 rounded-xl px-8 py-5 shadow-lg backdrop-blur-md border border-indigo-100/50 transform hover:scale-105 transition-all duration-300 glassmorphism">
            Leverage the power of <span className="font-semibold text-indigo-600 animate-shimmer bg-clip-text text-transparent bg-[length:200%_100%] bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600">Cardano blockchain</span> to access top-tier instructors, interactive content, and secure, transparent certifications. Join the future of learning on the blockchain!
          </p>
        </motion.div>

        <div className="mt-12">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Blockchain Certification
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">NFT Certificate Minting Process</h2>
          <div className="flex flex-wrap items-center justify-between max-w-3xl mx-auto">
            {[
              'Course Completion',
              'Generate Certificate',
              'Create Metadata',
              'Mint NFT',
              'Transfer to Student'
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center mb-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-full text-white font-semibold transition-all duration-500 shadow-md ${
                    currentStep >= index
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-3 text-gray-700 text-center text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
          
          <div className="relative max-w-3xl mx-auto mt-4">
            <div className="h-1.5 bg-gray-200 rounded-full"></div>
            <div
              className="absolute top-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          
          <div className="mt-6 text-gray-700 bg-white/80 rounded-xl p-4 max-w-xl mx-auto shadow-sm">
            {currentStep === 0 && (
              <p className="flex items-center justify-center">
                <span className="w-6 h-6 mr-3 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </span>
                Student completes all course requirements
              </p>
            )}
            {currentStep === 1 && (
              <p className="flex items-center justify-center">
                <span className="w-6 h-6 mr-3 bg-blue-500 rounded-full animate-spin flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                Generating unique certificate with student data
              </p>
            )}
            {currentStep === 2 && (
              <p className="flex items-center justify-center">
                <span className="w-6 h-6 mr-3 bg-blue-500 rounded-full animate-spin flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                Creating NFT metadata with course & achievement details
              </p>
            )}
            {currentStep === 3 && (
              <p className="flex items-center justify-center">
                <span className="w-6 h-6 mr-3 bg-blue-500 rounded-full animate-spin flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                Minting NFT on Cardano blockchain
              </p>
            )}
            {currentStep === 4 && (
              <p className="flex items-center justify-center">
                <span className="w-6 h-6 mr-3 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </span>
                NFT Certificate transferred to student's wallet
              </p>
            )}
          </div>
        </div>

        
        <motion.div 
          className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to={'/course-list'} onClick={() => window.scrollTo(0, 0)}>
            <motion.button 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="relative z-10">Explore Courses</span>
            </motion.button>
          </Link>
          <Link to={'/nft-explorer'} onClick={() => window.scrollTo(0, 0)}>
            <motion.button 
              className="px-8 py-4 bg-white border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-indigo-100 rounded-full group-hover:w-32 group-hover:h-32 opacity-50"></span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">Verify Certificates</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-indigo-300 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-70 animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-60 animate-float delay-500"></div>
        
        
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-20 h-1 bg-indigo-400/30 rounded-full top-1/4 left-1/4 animate-flow-right"></div>
          <div className="absolute w-32 h-1 bg-blue-400/30 rounded-full top-1/3 right-1/3 animate-flow-left delay-1000"></div>
          <div className="absolute w-16 h-1 bg-purple-400/30 rounded-full bottom-1/4 left-1/3 animate-flow-right delay-2000"></div>
          <div className="absolute w-24 h-1 bg-indigo-400/30 rounded-full bottom-1/3 right-1/4 animate-flow-left delay-3000"></div>
        </div>
        
        
        <div className="absolute w-4 h-4 bg-blue-500/40 rounded-full top-1/4 left-1/5 animate-pulse"></div>
        <div className="absolute w-4 h-4 bg-indigo-500/40 rounded-full top-1/3 right-1/4 animate-pulse delay-1000"></div>
        <div className="absolute w-4 h-4 bg-purple-500/40 rounded-full bottom-1/3 left-1/3 animate-pulse delay-2000"></div>
        <div className="absolute w-4 h-4 bg-blue-500/40 rounded-full bottom-1/4 right-1/5 animate-pulse delay-3000"></div>
        
        
        <div className="absolute h-0.5 bg-gradient-to-r from-blue-400/0 via-blue-400/50 to-blue-400/0 top-1/4 left-0 right-0 animate-flow-right"></div>
        <div className="absolute h-0.5 bg-gradient-to-r from-indigo-400/0 via-indigo-400/50 to-indigo-400/0 top-1/3 left-0 right-0 animate-flow-left delay-1000"></div>
        <div className="absolute h-0.5 bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 bottom-1/3 left-0 right-0 animate-flow-right delay-2000"></div>
      </div>
    </div>
  );
};


const styles = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes flowRight {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes flowLeft {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  
  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(79, 70, 229, 0.2)); }
    50% { filter: drop-shadow(0 0 10px rgba(79, 70, 229, 0.6)); }
  }
  
  /* 3D Cube Animation */
  .scene {
    width: 100px;
    height: 100px;
    perspective: 400px;
  }
  
  .cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(-50px);
    animation: rotate 10s infinite linear;
  }
  
  .cube__face {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid rgba(79, 70, 229, 0.3);
    background: rgba(79, 70, 229, 0.1);
    opacity: 0.7;
    box-shadow: 0 0 15px rgba(79, 70, 229, 0.3);
  }
  
  .scene--small {
    width: 60px;
    height: 60px;
    perspective: 240px;
  }
  
  .cube--small {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(-30px);
    animation: rotate 8s infinite linear reverse;
  }
  
  .cube--small .cube__face {
    width: 60px;
    height: 60px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    background: rgba(139, 92, 246, 0.1);
  }
  
  .cube--small .cube__face--front  { transform: rotateY(0deg) translateZ(30px); }
  .cube--small .cube__face--right  { transform: rotateY(90deg) translateZ(30px); }
  .cube--small .cube__face--back   { transform: rotateY(180deg) translateZ(30px); }
  .cube--small .cube__face--left   { transform: rotateY(-90deg) translateZ(30px); }
  .cube--small .cube__face--top    { transform: rotateX(90deg) translateZ(30px); }
  .cube--small .cube__face--bottom { transform: rotateX(-90deg) translateZ(30px); }
  
  /* Glowing Orb */
  .glowing-orb {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(79, 70, 229, 0.3) 50%, rgba(79, 70, 229, 0) 70%);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
    animation: pulse-glow 4s ease-in-out infinite alternate;
  }
  
  @keyframes pulse-glow {
    0% { transform: scale(0.8); opacity: 0.7; }
    100% { transform: scale(1.2); opacity: 0.9; }
  }
  
  .cube__face--front  { transform: rotateY(0deg) translateZ(50px); }
  .cube__face--right  { transform: rotateY(90deg) translateZ(50px); }
  .cube__face--back   { transform: rotateY(180deg) translateZ(50px); }
  .cube__face--left   { transform: rotateY(-90deg) translateZ(50px); }
  .cube__face--top    { transform: rotateX(90deg) translateZ(50px); }
  .cube__face--bottom { transform: rotateX(-90deg) translateZ(50px); }
  
  @keyframes rotate {
    0% { transform: translateZ(-50px) rotateX(0deg) rotateY(0deg); }
    100% { transform: translateZ(-50px) rotateX(360deg) rotateY(360deg); }
  }
  
  /* Utility Classes */
  .animate-fade-in-down {
    animation: fadeInDown 1s ease-out;
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }

  .animate-ping {
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .animate-flow-right {
    animation: flowRight 15s linear infinite;
  }
  
  .animate-flow-left {
    animation: flowLeft 15s linear infinite;
  }
  
  .shadow-glow {
    animation: glow 3s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.3; }
  }
  
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  
  @keyframes shimmer {
    to { background-position: 200% 0; }
  }
  
  .text-glow {
    text-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
  }
  
  /* 3D Text Effects */
  .perspective-container {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  
  .threed-text-container {
    display: inline-block;
    animation: float-3d 6s ease-in-out infinite;
  }
  
  .threed-text {
    display: inline-block;
    text-shadow: 
      1px 1px 0 rgba(79, 70, 229, 0.3),
      2px 2px 0 rgba(79, 70, 229, 0.3),
      3px 3px 0 rgba(79, 70, 229, 0.3),
      4px 4px 0 rgba(79, 70, 229, 0.3),
      5px 5px 0 rgba(79, 70, 229, 0.3),
      6px 6px 10px rgba(0, 0, 0, 0.4);
    transform: translateZ(30px);
  }
  
  @keyframes float-3d {
    0%, 100% { transform: translateZ(0) rotateX(0) rotateY(0); }
    25% { transform: translateZ(20px) rotateX(5deg) rotateY(5deg); }
    50% { transform: translateZ(10px) rotateX(-2deg) rotateY(-5deg); }
    75% { transform: translateZ(15px) rotateX(5deg) rotateY(-2deg); }
  }
  
  .perspective-text {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .glassmorphism {
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  }
`;

export default Hero;
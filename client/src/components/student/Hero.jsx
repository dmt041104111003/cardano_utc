import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import SearchBar from './SearchBar';
import { FaEthereum } from 'react-icons/fa';

const Hero = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate the minting process by advancing steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < 4 ? prevStep + 1 : 0));
    }, 2000); // Change step every 2 seconds
    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 bg-gradient-to-b from-green-100/70 via-cyan-100/50 to-white min-h-screen overflow-hidden">
      <div className="relative max-w-6xl w-full text-center space-y-10 z-10">
        {/* Title */}
        <h1 className="md:text-6xl text-4xl font-extrabold text-gray-800 leading-tight max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-cyan-600 animate-fade-in-down">
        Welcome to Lms - Cardano{' '}
          <span className="inline-block relative">
            decentralized certifications
            <span className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full opacity-50"></span>
            {/* <FaEthereum className="inline-block ml-2 text-green-500 animate-pulse" size={30} /> */}
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg max-w-2xl mx-auto bg-white/80 rounded-lg px-6 py-4 shadow-lg backdrop-blur-sm border border-green-200/30">
          Leverage the power of Cardano blockchain to access top-tier instructors, interactive content, and secure, transparent certifications. Join the future of learning on the blockchain!
        </p>

        {/* Mint Steps Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">NFT Certificate Minting Process</h2>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              'Course Completion',
              'Generate Certificate',
              'Create Metadata',
              'Mint NFT',
              'Transfer to Student'
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-semibold transition-all duration-500 ${
                    currentStep >= index
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                {/* Step Label */}
                <span className="mt-2 text-gray-600 text-center text-sm">{step}</span>
              </div>
            ))}
          </div>
          {/* Progress Line */}
          <div className="relative max-w-3xl mx-auto mt-4">
            <div className="h-1 bg-gray-300 rounded-full"></div>
            <div
              className="absolute top-0 h-1 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          {/* Status Messages */}
          <div className="mt-6 text-gray-600">
            {currentStep === 0 && (
              <p className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </span>
                Student completes all course requirements
              </p>
            )}
            {currentStep === 1 && (
              <p className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 bg-blue-500 rounded-full animate-spin"></span>
                Generating unique certificate with student data
              </p>
            )}
            {currentStep === 2 && (
              <p className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 bg-blue-500 rounded-full animate-spin"></span>
                Creating NFT metadata with course & achievement details
              </p>
            )}
            {currentStep === 3 && (
              <p className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 bg-blue-500 rounded-full animate-spin"></span>
                Minting NFT on Cardano blockchain
              </p>
            )}
            {currentStep === 4 && (
              <p className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </span>
                NFT Certificate transferred to student's wallet
              </p>
            )}
          </div>
        </div>

        {/* Call to Action Button */}
        <Link to={'/course-list'} onClick={() => scrollTo(0, 0)}>
          <button className="mt-6 px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Start Learning on Cardano Now
          </button>
        </Link>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-300 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-cyan-300 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white rounded-full opacity-50 animate-ping"></div>
      </div>
    </div>
  );
};

// CSS Keyframes for Animations
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
`;

export default Hero;
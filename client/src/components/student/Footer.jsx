import React from 'react';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Footer = () => {
    return (
        <footer className='bg-gradient-to-b from-gray-900 to-indigo-950 text-left w-full mt-10 relative overflow-hidden'>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/4 left-3/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <div className='flex flex-col md:flex-row items-start px-8 md:px-12 lg:px-24 justify-center gap-10 
            md:gap-16 lg:gap-24 py-16 border-b border-white/10 relative z-10 max-w-7xl mx-auto'>
                
                <div className='flex flex-col md:items-start items-center w-full'>
                    <div className='max-w-xs relative inline-block group'>
                        <div className='absolute inset-0 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 blur-xl rounded-xl z-0 opacity-80 group-hover:opacity-100 transition-all duration-500 animate-pulse'></div>
                        <div className='absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-md rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                        <div className='relative z-10 p-2'>
                            <LMSCardanoLogo className="w-32 h-auto drop-shadow-lg" />
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <p className='text-center md:text-left text-sm text-white/80 flex items-center gap-2 hover:text-white transition-colors'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span>08 1919 8989</span>
                        </p>
                        <p className='text-center md:text-left text-sm text-white/80 flex items-center gap-2 hover:text-white transition-colors'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>contact@fullstack.edu.vn</span>
                        </p>
                        <p className='text-center md:text-left text-sm text-white/80 flex items-center gap-2 hover:text-white transition-colors'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>Số 1, ngõ 41, Trần Duy Hưng, Cầu Giấy, Hà Nội</span>
                        </p>
                    </div>
                </div>

                <div className='flex flex-col md:items-start items-center w-full'>
                    <h2 className='font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-5 text-lg'>Quick Links</h2>
                    <ul className='flex md:flex-col w-full justify-between text-sm md:space-y-4'>
                        <li>
                            <a href="/educator/dashboard" className='text-white/80 hover:text-white transition-colors flex items-center gap-2 group'>
                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                                <span>Educator Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="/student/my-enrollments" className='text-white/80 hover:text-white transition-colors flex items-center gap-2 group'>
                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                                <span>My Enrollments</span>
                            </a>
                        </li>
                        <li>
                            <a href="/student/profile" className='text-white/80 hover:text-white transition-colors flex items-center gap-2 group'>
                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                                <span>My Profile</span>
                            </a>
                        </li>
                        <li>
                            <a href="/student/certificates" className='text-white/80 hover:text-white transition-colors flex items-center gap-2 group'>
                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                                <span>NFT Certificates</span>
                            </a>
                        </li>
                        <li>
                            <a href="/courses" className='text-white/80 hover:text-white transition-colors flex items-center gap-2 group'>
                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                                <span>All Courses</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div className='flex flex-col md:items-start items-center w-full'>    
                    <h2 className='font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-5 text-lg'>Stay Connected</h2>
                    <p className='text-sm text-white/80 mb-5 md:text-left text-center'>
                        Subscribe to our channels for the latest courses, blockchain certification updates, and learning resources.
                    </p>
                    <div className='flex flex-wrap items-center gap-3 justify-center md:justify-start'>
                        <a 
                            href="https://www.youtube.com/watch?v=6ckXXCDMBow" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className='flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                            </svg>
                            <span>YouTube</span>
                        </a>
                        
                        <a 
                            href="https://www.linkedin.com/in/tung-dao-bb2349254/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                            </svg>
                            <span>LinkedIn</span>
                        </a>
                        
                        <a 
                            href="https://github.com/dmt041104111003/cardano_utc/wiki" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className='flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
            <div className='py-8 text-center relative z-10'>
                <div className='max-w-7xl mx-auto px-8 md:px-12 lg:px-24'>
                    <div className='h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mb-8'></div>
                    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                        <p className='text-xs md:text-sm text-white/60'>
                            © {new Date().getFullYear()} LMS Cardano. All rights reserved.
                        </p>
                        <div className='flex items-center gap-4'>
                            <a href="#" className='text-xs text-white/60 hover:text-white transition-colors'>Privacy Policy</a>
                            <span className='text-white/30'>•</span>
                            <a href="#" className='text-xs text-white/60 hover:text-white transition-colors'>Terms of Service</a>
                            <span className='text-white/30'>•</span>
                            <a href="#" className='text-xs text-white/60 hover:text-white transition-colors'>Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                .animate-pulse {
                    animation: pulse 3s infinite;
                }
            `}</style>
        </footer>
    );
}

export default Footer;
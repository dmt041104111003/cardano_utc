/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { assets } from '../../assets/assets';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Footer = () => {
    return (
        <footer className='bg-gray-950 md:px-36 text-left w-full mt-10'>
            <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 
            md:gap-32 py-10 border-b border-white/30'>
                
                <div className='flex flex-col md:items-start items-center w-full'>
                    <div className='max-w-xs relative inline-block'>
                        <div className='absolute inset-0 bg-white/10 blur-md rounded-xl z-0'></div>
                        <div className='relative z-10'>
                            <LMSCardanoLogo />
                        </div>
                    </div>
                    <p className='mt-4 text-center md:text-left text-sm text-white text-glow-light'>Phone: 08 1919 8989 </p>
                    <p className='mt-2 text-center md:text-left text-sm text-white text-glow-light'>Email: contact@fullstack.edu.vn</p>
                    <p className='mt-2 text-center md:text-left text-sm text-white text-glow-light'>Address: Số 1, ngõ 41, Trần Duy Hưng, Cầu Giấy, Hà Nội </p>
                </div>

                <div className='flex flex-col md:items-start items-center w-full'>
                    <h2 className='font-semibold text-white mb-5 text-glow-light'>Info</h2>
                    <ul className='flex md:flex-col w-full justify-between text-sm text-white md:space-y-2'>
                        <li><a href="#" className='hover:underline'>Educator Dashboard</a></li>
                        <li><a href="#" className='hover:underline'>My Enrollments</a></li>
                        <li><a href="#" className='hover:underline'>My profile</a></li>
                    </ul>
                </div>

                <div className='hidden md:flex flex-col items-start w-full'>    
                    <h2 className='font-semibold text-white mb-5 text-glow-light'>Stay Updated</h2>
                    <p className='text-sm text-white text-glow-light'>
                        Get the latest courses, blockchain certification updates, and learning resources delivered to your inbox.
                    </p>
                    <div className='flex items-center gap-2 pt-4'>
                        <input 
                            className='border border-gray-500/30 bg-gray-800 text-white placeholder-gray-400 outline-none 
                            w-64 h-9 rounded px-2 text-sm' 
                            type="email" 
                            placeholder='Enter your email'
                        />
                        <button className='bg-blue-600 w-24 h-9 text-white rounded hover:bg-blue-500 transition'>
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
            <p className='py-4 text-center text-xs md:text-sm text-white/60'>Copyright @team_blockchain</p>

            {/* Extra styles for glow */}
            <style jsx>{`
                .text-glow-light {
                    text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </footer>
    );
}

export default Footer;

import React from 'react';
import { assets } from '../../assets/assets';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Footer = () => {
    return (
        <footer className='flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 transition-all duration-300'>
            <div className='flex items-center gap-3'>
                <div className='max-w-[100px]'>
                    <LMSCardanoLogo className="hover:opacity-80 transition-opacity" />
                </div>
                <div className='hidden md:block h-5 w-px bg-blue-200'></div>
                <p className='text-xs text-blue-700 font-medium'>
                    Copyright @team_blockchain
                </p>
            </div>
            <div className='flex items-center gap-2 max-md:mb-2'>
                <a href="#" className="p-1.5 rounded-full hover:bg-blue-100 transition-colors duration-200">
                    <img src={assets.facebook_icon} alt="facebook icon" className="w-4 h-4" />
                </a>
                <a href="#" className="p-1.5 rounded-full hover:bg-blue-100 transition-colors duration-200">
                    <img src={assets.twitter_icon} alt="twitter icon" className="w-4 h-4" />
                </a>
                <a href="#" className="p-1.5 rounded-full hover:bg-blue-100 transition-colors duration-200">
                    <img src={assets.instagram_icon} alt="instagram icon" className="w-4 h-4" />
                </a>
            </div>
        </footer>
    );
}

export default Footer;

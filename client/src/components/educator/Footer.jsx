/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { assets } from '../../assets/assets';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Footer = () => {
    return (
        <footer className='flex md:flex-row flex-col-reverse
        items-center justify-between text-left w-full px-8 '>
            <div className='flex items-center gap-4'>
                <div className='max-w-xs'>
                    <LMSCardanoLogo />
                </div>
                <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
                <p className='py-4 text-center text-xs md:text-sm text-gray-500'>
                Copyright @team_blockchain
                </p>
            </div>
            <div className='flex items-center gap-3 max-md:mt-4'>
                <a href="#">
                    <img src={assets.facebook_icon} alt="facebook icon" />
                </a>
                <a href="#">
                    <img src={assets.twitter_icon} alt="twitter icon" />
                </a>
                <a href="#">
                    <img src={assets.instagram_icon} alt="instagram icon" />
                </a>
                
            </div>
        </footer>
    );
}

export default Footer;

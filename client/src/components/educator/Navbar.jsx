/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { assets, dummyEducatorData } from '../../assets/assets';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Navbar = () => {
    const navigate = useNavigate();
    const educatorData = dummyEducatorData
    const {user} = useUser()
    const { } = useContext(AppContext);
    return (
        <div className='flex items-center justify-between px-4 md:px-8 py-3'>
            <div className='flex items-center gap-4'>
                <LMSCardanoLogo onClick={() => navigate('/')} />
            </div>
            <div className='flex items-center gap-5 text-blue-800 relative'>
                <p>Hi! {user? user.fullName:'Developers'}</p>
                {user?<UserButton/> : <img className='max-w-8' src={assets.profile_img}/>}
            </div>
        </div>
    );
}

export default Navbar;

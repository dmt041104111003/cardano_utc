/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { assets } from "../../assets/assets.js";
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext.jsx';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const { isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);

    const becomeEducator = async () => {
        try {
            if (isEducator) {
                navigate('/educator');
                return;
            }

            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/educator/update-role',
                { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setIsEducator(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex items-center justify-between px-5 sm:px-10 md:px-14 lg:px-36 border-b border-green-200/30 py-4 shadow-md bg-gradient-to-b from-green-100/70 to-cyan-100/50">
            <div className='flex items-center gap-4'>
                <LMSCardanoLogo onClick={() => navigate('/')} className="hover:scale-105 transition-transform" />
            </div>

            {/* Menu cho desktop */}
            <div className='hidden md:flex items-center gap-6 text-gray-600'>
                <div className='flex items-center gap-6'>
                    {user && (
                        <>
                        <Link 
                                to='/' 
                                className='text-sm font-medium hover:text-cyan-600 transition-colors'
                            >
                                Home
                            </Link>
                            <button 
                                onClick={becomeEducator} 
                                className='text-sm font-medium hover:text-green-600 transition-colors'
                            >
                                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                            </button>
                            <button 
                                onClick={() => navigate('/courses')}
                                className='text-sm font-medium hover:text-green-600 transition-colors'
                            >
                                Courses
                            </button>
                            
                      
                            <Link 
                                to='/my-enrollments' 
                                className='text-sm font-medium hover:text-cyan-600 transition-colors'
                            >
                                My Enrollments
                            </Link>
                            <Link 
                                to='/my-profile' 
                                className='text-sm font-medium hover:text-blue-600 transition-colors'
                            >
                                My Profile
                            </Link>
                        </>
                    )}
                </div>
                {user ? (
                    <UserButton afterSignOutUrl="/" />
                ) : (
                    <button 
                        onClick={() => openSignIn()} 
                        className='bg-gradient-to-r from-green-500 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:from-green-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg'
                    >
                        Create Account
                    </button>
                )}
            </div>

            {/* Menu cho mobile */}
            <div className='md:hidden flex items-center gap-2 sm:gap-4 text-gray-600'>
                <div className='flex items-center gap-2 max-sm:text-xs'>
                    {user && (
                        <>
                            <button 
                                onClick={() => navigate('/courses')}
                                className='text-xs font-medium hover:text-green-600 transition-colors'
                            >
                                Courses
                            </button>
                            <button 
                                onClick={becomeEducator} 
                                className='text-xs font-medium hover:text-green-600 transition-colors'
                            >
                                {isEducator ? 'Educator' : 'Become Edu'}
                            </button>
                            <Link 
                                to='/' 
                                className='text-sm font-medium hover:text-cyan-600 transition-colors'
                            >
                                Home
                            </Link>
                            <Link 
                                to='/my-enrollments' 
                                className='text-xs font-medium hover:text-cyan-600 transition-colors'
                            >
                                Enrollments
                            </Link>
                            <Link 
                                to='/my-profile' 
                                className='text-xs font-medium hover:text-blue-600 transition-colors'
                            >
                                Profile
                            </Link>
                        </>
                    )}
                </div>
                {user ? (
                    <UserButton afterSignOutUrl="/" />
                ) : (
                    <button 
                        onClick={() => openSignIn()} 
                        className='p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors'
                    >
                        <img src={assets.user_icon} alt="User" className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
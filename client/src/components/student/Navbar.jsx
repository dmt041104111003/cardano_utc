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
        <div className="flex items-center justify-between px-5 sm:px-10 md:px-14 lg:px-36 border-b border-blue-100/50 py-4 shadow-md bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white sticky top-0 z-50 backdrop-blur-sm transition-all duration-300">
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
                                onClick={() => {window.scrollTo(0, 0); navigate('/');}}
                                className={`text-sm font-medium transition-all duration-300 relative ${location.pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-cyan-600'} ${location.pathname === '/' ? 'after:content-[""] after:absolute after:w-full after:h-0.5 after:bg-blue-600 after:bottom-[-8px] after:left-0 after:rounded-full' : ''}`}
                            >
                                Home
                            </Link>
                            <button 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    becomeEducator();
                                }} 
                                className={`text-sm font-medium transition-all duration-300 relative ${isEducator ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`}
                            >
                                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                            </button>
                            <button 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    navigate('/courses');
                                }}
                                className={`text-sm font-medium transition-all duration-300 relative ${location.pathname === '/courses' ? 'text-blue-600 font-semibold after:content-[""] after:absolute after:w-full after:h-0.5 after:bg-blue-600 after:bottom-[-8px] after:left-0 after:rounded-full' : 'text-gray-600 hover:text-green-600'}`}
                            >
                                Courses
                            </button>
                            
                      
                            <Link 
                                to='/my-enrollments' 
                                onClick={() => window.scrollTo(0, 0)}
                                className={`text-sm font-medium transition-all duration-300 relative ${location.pathname === '/my-enrollments' ? 'text-blue-600 font-semibold after:content-[""] after:absolute after:w-full after:h-0.5 after:bg-blue-600 after:bottom-[-8px] after:left-0 after:rounded-full' : 'text-gray-600 hover:text-cyan-600'}`}
                            >
                                My Enrollments
                            </Link>
                            <Link 
                                to='/my-profile' 
                                onClick={() => window.scrollTo(0, 0)}
                                className={`text-sm font-medium transition-all duration-300 relative ${location.pathname === '/my-profile' ? 'text-blue-600 font-semibold after:content-[""] after:absolute after:w-full after:h-0.5 after:bg-blue-600 after:bottom-[-8px] after:left-0 after:rounded-full' : 'text-gray-600 hover:text-blue-600'}`}
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
                        className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg'
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
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    navigate('/courses');
                                }}
                                className={`text-xs font-medium transition-all duration-300 relative ${location.pathname === '/courses' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`}
                            >
                                Courses
                            </button>
                            <button 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    becomeEducator();
                                }} 
                                className={`text-xs font-medium transition-all duration-300 relative ${isEducator ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`}
                            >
                                {isEducator ? 'Educator' : 'Become Edu'}
                            </button>
                            <Link 
                                to='/' 
                                className={`text-xs font-medium transition-all duration-300 relative ${location.pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-cyan-600'}`}
                            >
                                Home
                            </Link>
                            <Link 
                                to='/my-enrollments' 
                                className={`text-xs font-medium transition-all duration-300 relative ${location.pathname === '/my-enrollments' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-cyan-600'}`}
                            >
                                Enrollments
                            </Link>
                            <Link 
                                to='/my-profile' 
                                className={`text-xs font-medium transition-all duration-300 relative ${location.pathname === '/my-profile' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
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
                        className='p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center'
                    >
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
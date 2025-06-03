import React, { useContext, useState } from 'react';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

            
            <div className='md:hidden flex items-center gap-4 text-gray-600'>
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
                
                
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>
            
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 right-0 left-0 bg-white shadow-lg z-50 border-t border-gray-100">
                    <div className="flex flex-col p-4 space-y-3">
                        {user && (
                            <>
                                <Link 
                                    to='/' 
                                    onClick={() => {
                                        window.scrollTo(0, 0); 
                                        navigate('/');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Home
                                </Link>
                                <button 
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        navigate('/courses');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 text-left rounded-md ${location.pathname === '/courses' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Courses
                                </button>
                                <button 
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        becomeEducator();
                                        setMobileMenuOpen(false);
                                    }} 
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 text-left rounded-md ${isEducator ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                                </button>
                                <Link 
                                    to='/my-enrollments' 
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md ${location.pathname === '/my-enrollments' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    My Enrollments
                                </Link>
                                <Link 
                                    to='/my-profile' 
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md ${location.pathname === '/my-profile' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    My Profile
                                </Link>
                            </>
                        )}
                        {!user && (
                            <button 
                                onClick={() => {
                                    openSignIn();
                                    setMobileMenuOpen(false);
                                }} 
                                className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg'
                            >
                                Create Account
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
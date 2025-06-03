import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { UserButton, useUser } from '@clerk/clerk-react';
import LMSCardanoLogo from '../common/LMSCardanoLogo';

function formatTime(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
function SidebarTimer({ isPremium, premiumExpiry, cooldownMs, fetchUserData }) {
  const [premiumLeft, setPremiumLeft] = useState(
    isPremium && premiumExpiry ? new Date(premiumExpiry) - Date.now() : 0
  );
  const [cooldownLeft, setCooldownLeft] = useState(cooldownMs);
  const [showPremium, setShowPremium] = useState(isPremium && premiumLeft > 0);

  useEffect(() => {
    if (isPremium && premiumExpiry) {
      setShowPremium(true);
      setPremiumLeft(new Date(premiumExpiry) - Date.now());
      const interval = setInterval(() => {
        const left = new Date(premiumExpiry) - Date.now();
        setPremiumLeft(left > 0 ? left : 0);
        if (left <= 0) {
          setShowPremium(false);
          if (typeof fetchUserData === 'function') fetchUserData();
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowPremium(false);
    }
  }, [isPremium, premiumExpiry, fetchUserData]);

  useEffect(() => {
    let interval;
    setCooldownLeft(cooldownMs);
    if ((!isPremium || !showPremium) && cooldownMs > 0) {
      interval = setInterval(() => {
        setCooldownLeft(t => {
          if (t <= 1000) {
            clearInterval(interval);
            if (typeof fetchUserData === 'function') fetchUserData();
            return 0;
          }
          return t - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPremium, showPremium, cooldownMs, fetchUserData]);

  if (showPremium && premiumLeft > 0) {
    return (
      <div className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg mb-3 text-center text-sm font-medium shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Premium: {formatTime(premiumLeft)}</span>
        </div>
      </div>
    );
  }
  if ((!isPremium || !showPremium) && cooldownLeft > 0) {
    return (
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg mb-3 text-center text-sm font-medium shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Wait {formatTime(cooldownLeft)}</span>
        </div>
      </div>
    );
  }
  if ((!isPremium || !showPremium) && cooldownLeft === 0) {
    return (
      <div className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg mb-3 text-center text-sm font-medium shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ready to create a course!</span>
        </div>
      </div>
    );
  }
  return null;
}

const Sidebar = ({ collapsed, setCollapsed }) => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const { userData, fetchUserData } = useContext(AppContext);
    const isPremium = userData?.isPremium;
    const premiumExpiry = userData?.premiumExpiry;
    const cooldownMs = userData?.cooldownMs || 0;
    
    const [scrollPosition, setScrollPosition] = useState(0);
    
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/educator', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Add Course', path: '/educator/add-course', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
        { name: 'Edit Course', path: '/educator/edit-course', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { name: 'My Courses', path: '/educator/my-courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Notification', path: '/educator/notification', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { name: 'Premium', path: '/educator/subscription', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { name: 'Violations', path: '/educator/violations', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    ];
    
    const handleExit = () => {
        navigate('/');
    };

    return (
        <div className={`h-screen bg-gradient-to-b from-white to-blue-50 shadow-md flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out border-r border-blue-100 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 bg-white border border-blue-200 rounded-full p-1.5 shadow-md z-30 hover:bg-blue-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-blue-600 transition-transform duration-300 ${collapsed ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <div className='px-4 py-4 border-b border-blue-100 mb-2'>
                <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
                    {collapsed ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-sm">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <LMSCardanoLogo onClick={() => navigate('/')} className="hover:opacity-90 transition-opacity cursor-pointer" />
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <div className='flex items-center justify-between mt-3 px-1'>
                        <div className="flex flex-col">
                            <p className='text-gray-900 font-medium text-sm'>
                                {user ? user.fullName : 'Educator'}
                            </p>
                            <p className='text-gray-500 text-xs'>Educator</p>
                        </div>
                        <UserButton />
                    </div>
                )}
            </div>

            <div className="px-3">
                <SidebarTimer 
                    key={cooldownMs} 
                    isPremium={isPremium} 
                    premiumExpiry={premiumExpiry} 
                    cooldownMs={cooldownMs} 
                    fetchUserData={fetchUserData} 
                />
            </div>
            
            <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 px-3 mb-2">
                    {!collapsed && 'MENU'}
                </div>
                {menuItems.map((item) => (
                    <NavLink
                        className={({ isActive }) => `flex items-center rounded-lg px-3 py-2.5 mb-1 gap-3 transition-colors
                        ${isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                        to={item.path} 
                        key={item.name} 
                        end={item.path === '/educator'}
                        onClick={() => window.scrollTo(0, 0)} 
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </NavLink>
                ))}
            </div>
            
            <div className="px-3 mt-2">
                <div className="text-xs font-medium text-gray-500 px-3 mb-2">
                    {!collapsed && 'HELP'}
                </div>

                
                <button 
                    onClick={handleExit}
                    className={`flex items-center rounded-lg px-3 py-2.5 gap-3 w-full transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600 mt-2`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!collapsed && <span className="text-sm font-medium">Exit to Home</span>}
                </button>
            </div>
            
            <div className="mt-auto mb-4 px-3">
                <div className="text-xs font-medium text-gray-500 px-3 mb-2">
                    {!collapsed && 'ACCOUNT'}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;

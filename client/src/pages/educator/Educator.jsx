import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/educator/Sidebar';
import Footer from '../../components/educator/Footer';
import BecomeEducator from '../../components/student/BecomeEducator';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const Educator = () => {
    const context = useContext(AppContext);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    return (
        <div className="relative min-h-screen w-screen">
            <div className="flex min-h-screen relative z-20">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}></div>
                
                {!context.isEducator ? (
                    <div className="flex-1 flex justify-start items-center pl-10">
                        <BecomeEducator />
                    </div>
                ) : (
                    <div className={`flex-1 p-4 transition-all duration-300`}>
                        <Outlet />
                    </div>
                )}
            </div>

            {!context.isEducator && (
                <img 
                    src={assets.background_educator}
                    alt="Background Educator" 
                    className="absolute inset-0 w-full h-full object-cover z-10"
                />
            )}

            <div className={`right-0 z-30 transition-all duration-300 ${context.isEducator ? 'border-t border-gray-300 ' : 'fixed bottom-0 '} ${sidebarCollapsed ? 'ml-16 w-[calc(100%-4rem)]' : 'ml-64 w-[calc(100%-16rem)]'}`}>
                <Footer collapsed={sidebarCollapsed} />
            </div>
        </div>
    );
};

export default Educator;

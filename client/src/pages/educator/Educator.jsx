/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/educator/Sidebar';
import Footer from '../../components/educator/Footer';
import BecomeEducator from '../../components/student/BecomeEducator';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import TermsModal from '../../components/educator/TermsModal';

const Educator = () => {
    const context = useContext(AppContext);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    
    return (
        <div className="relative min-h-screen w-screen">
            {/* Main Content */}
            <div className="flex min-h-screen relative z-20">
                {/* Sidebar */}
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                
                {/* Placeholder div to create space for fixed sidebar */}
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}></div>
                
                {/* Main content */}
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

            {/* Background Image (Only for non-educator users) */}
            {!context.isEducator && (
                <img 
                    src={assets.background_educator}
                    alt="Background Educator" 
                    className="absolute inset-0 w-full h-full object-cover z-10"
                />
            )}

            {/* Footer */}
            <div className={`right-0 z-30 transition-all duration-300 ${context.isEducator ? 'border-t border-gray-300 ' : 'fixed bottom-0 '} ${sidebarCollapsed ? 'ml-16 w-[calc(100%-4rem)]' : 'ml-64 w-[calc(100%-16rem)]'}`}>
                <Footer collapsed={sidebarCollapsed} />
            </div>
            
            {/* Modal Điều khoản - Tự động hiển thị nếu người dùng chưa đồng ý */}
            {context.isEducator && (
                <TermsModal 
                    isOpen={showTermsModal}
                    onClose={() => setShowTermsModal(false)}
                    onAgree={() => setShowTermsModal(false)}
                    autoShow={true}
                />
            )}
        </div>
    );
};

export default Educator;

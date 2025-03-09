/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/educator/Navbar';
import Sidebar from '../../components/educator/Sidebar';
import Footer from '../../components/educator/Footer';
import BecomeEducator from '../../components/student/BecomeEducator';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const Educator = () => {
    const context = useContext(AppContext);
    

    return (
        <div className="relative min-h-screen w-screen">
  
            {/* Navbar */}
            <div className={`z-30 w-full ${context.isEducator ? 'border-b border-gray-300' : 'fixed top-0 right-0'}`}>
                <Navbar />
            </div>

            {/* Main Content */}
            <div className="flex min-h-[calc(100vh-80px)] relative z-20">
                <Sidebar />
                {!context.isEducator ? (
                    <div className="flex-1 flex justify-start items-center pl-10">
                        <BecomeEducator />
                    </div>
                ) : (
                    <div className="flex-1 p-4">
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
            <div className={`right-0 z-30 w-full ${context.isEducator ? 'border-t border-gray-300 ' : 'fixed bottom-0 '}`}>
                <Footer />
            </div>
        </div>
    );
};

export default Educator;

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from '../../components/student/Hero';
import Companies from '../../components/student/Companies';
import CoursesSection from '../../components/student/CoursesSection';
// import TestimonialsSection from '../../components/student/TestimonialsSection';
import CallToAction from '../../components/student/CallToAction';
import Footer from '../../components/student/Footer';
import TransactionChecker from '../../components/student/TransactionChecker';
import SplashScreen from '../../components/common/SplashScreen';

const Home = () => {
    const [showSplash, setShowSplash] = useState(true);
    
    // Luôn hiển thị splash screen mỗi khi truy cập trang
    useEffect(() => {
        // Đặt showSplash thành true khi component mount
        setShowSplash(true);
        
        // Scroll lên đầu trang
        window.scrollTo(0, 0);
        
        // Khóa cuộn trang khi splash screen hiển thị
        document.body.style.overflow = 'hidden';
    }, []);

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen onComplete={() => {
                    setShowSplash(false);
                    // Khôi phục cuộn trang khi splash screen đóng
                    document.body.style.overflow = 'auto';
                }} />}
            </AnimatePresence>
            
            <div className='flex flex-col items-center space-y-7 text-center'>
                <Hero />
                <Companies />
                <CoursesSection />
                <TransactionChecker />
                {/* <TestimonialsSection /> */}
                <CallToAction />
                <Footer />
            </div>
        </>
    );
}

export default Home;

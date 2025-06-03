import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from '../../components/student/Hero';
import CoursesSection from '../../components/student/CoursesSection';
import CallToAction from '../../components/student/CallToAction';
import Footer from '../../components/student/Footer';
import TransactionChecker from '../../components/student/TransactionChecker';
import SplashScreen from '../../components/common/SplashScreen';

const Home = () => {
    const [showSplash, setShowSplash] = useState(true);
    
    useEffect(() => {
        setShowSplash(true);
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
    }, []);

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen onComplete={() => {
                    setShowSplash(false);
                    document.body.style.overflow = 'auto';
                }} />}
            </AnimatePresence>
            
            <div className='flex flex-col items-center space-y-7 text-center'>
                <Hero />
                <CoursesSection />
                <TransactionChecker />
                <CallToAction />
                <Footer />
            </div>
        </>
    );
}

export default Home;

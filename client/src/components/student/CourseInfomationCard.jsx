/* eslint-disable react/prop-types */
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const shakeAnimation = `
@keyframes shake {
    0% { transform: translateX(0) scale(1); }
    25% { transform: translateX(-2px) rotate(-1deg) scale(1.1); }
    50% { transform: translateX(2px) rotate(1deg) scale(1); }
    75% { transform: translateX(-2px) rotate(-1deg) scale(1.1); }
    100% { transform: translateX(0) scale(1); }
}
.shake {
    animation: shake 0.8s infinite;
    display: inline-block;
    transform-origin: center;
}`;

const CourseInformationCard = ({courseData, playerData, isAlreadyEnrolled, rating, duration, lecture, openPaymentPage, courseId}) => {
    const { currency, backendUrl, getToken } = useContext(AppContext);
    const [timeLeft, setTimeLeft] = useState('');
    const [policyId, setPolicyId] = useState('');
    const [adaToUsd, setAdaToUsd] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchNFTInfo = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/nft/info/${courseData._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data.success) {
                    setPolicyId(data.policyId);
                }
            } catch (error) {
                console.error("Error fetching NFT info:", error);
            }
        };

        if (courseData._id) {
            fetchNFTInfo();
        }
    }, [courseData._id]);

    useEffect(() => {
        // Add the animation styles to the document
        const styleSheet = document.createElement("style");
        styleSheet.textContent = shakeAnimation;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    useEffect(() => {
        const updateExchangeRate = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
                const data = await response.json();
                setAdaToUsd(data.cardano.usd);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            }
        };

        updateExchangeRate();
        const interval = setInterval(updateExchangeRate, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const calculateTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return '';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) timeString += `${days} days `;
        if (hours > 0) timeString += `${hours} h `;
        if (minutes > 0) timeString += `${minutes} m `;
        if (seconds >= 0) timeString += `${seconds} s`;

        return timeString.trim();
    };

    useEffect(() => {
        let timer;
        if (courseData?.discount > 0 && courseData?.discountEndTime) {
            // Update immediately
            setTimeLeft(calculateTimeLeft(courseData.discountEndTime));
            
            // Then update every second
            timer = setInterval(() => {
                const time = calculateTimeLeft(courseData.discountEndTime);
                setTimeLeft(time);
                
                // Clear interval if time is up
                if (!time) {
                    clearInterval(timer);
                }
            }, 1000);
        }

        // Cleanup on unmount
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [courseData]);

    const handleEnrollCourse = () => {
        if (isAlreadyEnrolled) {
            return toast.warn('Already Enrolled')
        }
        if (courseData.isPaused) {
            return toast.error('Khóa học này đã tạm dừng và không thể mua')
        } 
        window.scrollTo(0, 0);
        navigate(`/payment/${courseId}`);
    }        

    return (
        <div className={`max-w-course-card ${openPaymentPage ? '' : 'mx-auto'} z-10 shadow-lg rounded-lg overflow-hidden bg-white min-w-[300px] sm:min-w-[420px] border border-gray-100 hover:shadow-xl transition-shadow duration-300`}>
        
        <div className="relative">
            {
                playerData ?
                    <YouTube videoId={playerData.videoId} opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            autoplay: 0,
                            controls: 1,
                            playsinline: 1,
                            mute: 1
                        }
                    }} iframeClassName='w-full aspect-video' />
                    :
                    <div className="overflow-hidden">
                        <img 
                            src={courseData.courseThumbnail} 
                            alt={courseData.courseTitle} 
                            className="w-full aspect-video object-cover transition-transform duration-500 hover:scale-105" 
                        />
                        {courseData.discount > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-3 rounded-full text-sm font-bold shadow-md">
                                {courseData.discount}% OFF
                            </div>
                        )}
                    </div>
            }
        </div>
        <div className='p-6'>
            <h2 className='font-bold text-gray-800 text-2xl md:text-3xl mb-4 leading-tight'>{courseData.courseTitle}</h2>
            
            <div className='flex flex-col gap-4 mb-5 border-b border-gray-200 pb-5'>
                <div className='flex flex-wrap items-center gap-2'>
                    <span className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full flex items-center shadow-sm ${courseData.creatorAddress ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 bg-white opacity-80`}></span>
                        {courseData.creatorAddress ? 'On-Chain Course' : 'Off-Chain Course'}
                    </span>
                    {courseData.creatorAddress && (
                        <span className='text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-sm font-semibold'>Blockchain Verified</span>
                    )}
                </div>
                
                <div className='space-y-3 bg-gray-50 p-4 rounded-lg'>
                    <div className='flex flex-col md:flex-row md:items-center gap-2'>
                        <span className='text-sm font-medium text-gray-600'>Course ID:</span>
                        <span className='text-sm font-mono bg-white px-3 py-1 rounded border border-gray-200 text-gray-700 flex-1'>{courseData._id}</span>
                    </div>
                    
                    {courseData.creatorAddress && (
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm font-medium text-gray-600'>Creator Address:</span>
                            <div className='flex flex-col gap-2'>
                                <div className='text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 text-gray-700 break-all'>
                                    {courseData.creatorAddress}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(courseData.creatorAddress);
                                        toast.success('Creator Address copied to clipboard');
                                    }}
                                    className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors border border-blue-600 flex items-center justify-center gap-2'
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Address
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {policyId && (
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm font-medium text-gray-600'>Policy ID:</span>
                            <div className='flex flex-col gap-2'>
                                <div className='text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 text-gray-700 break-all'>
                                    {policyId}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(policyId);
                                        toast.success('Policy ID copied to clipboard');
                                    }}
                                    className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors border border-blue-600 flex items-center justify-center gap-2'
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Policy ID
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-3 mb-4 bg-blue-50 p-3 rounded-lg'>
                <div className='flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm'>
                    <img src={assets.star} alt="star icon" className='w-4 h-4' />
                    <p className="font-medium text-amber-500">{rating}</p>
                </div>
                <p className="text-blue-700 text-sm">({courseData.courseRatings?.length || 0} ratings)</p>
                <div className='h-4 w-px bg-blue-200'></div>
                <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-blue-700 text-sm font-medium">{courseData.enrolledStudents?.length || 0} students enrolled</p>
                </div>
            </div>

            {courseData.discount > 0 && courseData.discountEndTime && timeLeft && (
                <div className='flex items-center gap-2 bg-red-50 p-3 rounded-lg mb-4 animate-pulse'>
                    <img className='w-5 h-5 shake' src={assets.time_left_clock_icon} alt="time left clock icon" />
                    <p className='text-red-600'><span className='font-bold'>{timeLeft}</span> left at this price!</p>
                </div>
            )}

            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-5'>
                <div className='flex flex-wrap gap-4 items-center'>
                    <div className='bg-white p-3 rounded-lg shadow-sm flex-1'>
                        <p className='text-gray-500 text-xs uppercase font-medium mb-1'>Current Price</p>
                        <div className='flex items-end gap-2'>
                            <p className='text-blue-700 md:text-4xl text-2xl font-bold'>
                                {(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)} <span className="text-sm font-semibold">ADA</span>
                            </p>
                            {courseData.discount > 0 && (
                                <span className='bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mb-1.5'>
                                    SAVE {courseData.discount}%
                                </span>
                            )}
                        </div>
                        {adaToUsd > 0 && (
                            <p className='text-sm text-gray-500 mt-1'>
                                ≈ ${((courseData.coursePrice - courseData.discount * courseData.coursePrice / 100) * adaToUsd).toFixed(2)} USD
                            </p>
                        )}
                    </div>
                    
                    {courseData.discount > 0 && (
                        <div className='bg-white/70 p-3 rounded-lg'>
                            <p className='text-gray-500 text-xs uppercase font-medium mb-1'>Original Price</p>
                            <p className='text-gray-400 md:text-2xl text-xl font-medium line-through'>
                                {courseData.coursePrice} <span className="text-sm">ADA</span>
                            </p>
                            {adaToUsd > 0 && (
                                <p className='text-sm text-gray-400 line-through mt-1'>
                                    ≈ ${(courseData.coursePrice * adaToUsd).toFixed(2)} USD
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-4 mb-5 bg-gray-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm'>
                    <img src={assets.time_clock_icon} alt="clock icon" className="w-5 h-5" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Duration</p>
                        <p className="text-sm text-gray-700 font-medium">{duration}</p>
                    </div>
                </div>
                
                <div className='flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm'>
                    <img src={assets.lesson_icon} alt="lessons icon" className="w-5 h-5" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Lessons</p>
                        <p className="text-sm text-gray-700 font-medium">{lecture} lessons</p>
                    </div>
                </div>
                
                {courseData.tests?.length > 0 && (
                    <div className='flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Tests</p>
                            <p className="text-sm text-gray-700 font-medium">{courseData.tests?.length || 0} tests</p>
                        </div>
                    </div>
                )}
            </div>

            {openPaymentPage ? (
                <button 
                    disabled={isAlreadyEnrolled || courseData.isPaused} 
                    onClick={isAlreadyEnrolled ? null : handleEnrollCourse} 
                    className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-5 ${isAlreadyEnrolled || courseData.isPaused ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl'}`}
                >
                    {isAlreadyEnrolled ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Already Enrolled
                        </>
                    ) : courseData.isPaused ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Course Paused
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Enroll Now
                        </>
                    )}
                </button>
            ) : null }
            

            <div className='pt-6'>
                {
                    !openPaymentPage && <>
                    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-5'>
                        <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Course Description
                        </h3>

                        <div className='text-sm md:text-base text-gray-700 prose max-w-none'
                            dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
                        />
                    </div>
                    </>
                }

                <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-5'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Course Details
                    </h3>
                    
                    <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                            <div className='bg-blue-100 p-2 rounded-full'>
                                <img src={assets.lesson_icon} alt="lessons" className='w-5 h-5'/>
                            </div>
                            <span className='text-gray-700 font-medium'>{courseData.courseContent?.length || 0} chapters with {lecture} lectures</span>
                        </div>
                        
                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                            <div className='bg-blue-100 p-2 rounded-full'>
                                <img src={assets.time_clock_icon} alt="duration" className='w-5 h-5'/>
                            </div>
                            <span className='text-gray-700 font-medium'>Total duration: {duration}</span>
                        </div>
                        
                        {courseData.tests?.length > 0 && (
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <div className='bg-blue-100 p-2 rounded-full'>
                                    <img src={assets.test_icon} alt="tests" className='w-5 h-5'/>
                                </div>
                                <span className='text-gray-700 font-medium'>{courseData.tests.length} tests to assess your knowledge</span>
                            </div>
                        )}
                        
                        {courseData.isUpdated && courseData.lastUpdated && (
                            <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                                <div className='bg-green-100 p-2 rounded-full'>
                                    <img src={assets.time_clock_icon} alt="updated" className='w-5 h-5'/>
                                </div>
                                <span className='text-green-700 font-medium'>Updated: {new Date(courseData.lastUpdated).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-5 shadow-md text-white'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-white p-2 rounded-full shadow-md'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className='text-sm font-medium text-blue-100'>Course Creator</p>
                            <p className='text-lg font-bold'>{courseData.educator?.name || 'Anonymous'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>
    )
}
export default CourseInformationCard
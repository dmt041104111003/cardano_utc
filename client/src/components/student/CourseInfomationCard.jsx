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

const CourseInformationCard = ({courseData, playerData,isAlreadyEnrolled,rating,duration,lecture,openPaymentPage,courseId}) => {
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
        scrollTo(0, 0);
        navigate(`/payment/${courseId}`);
    }        

    return (
        <div className={`max-w-course-card ${openPaymentPage ? '' : 'mx-auto'} z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]`}>
        {console.log(rating)}
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
                <img src={courseData.courseThumbnail} alt="" />
        }
        <div className='p-5'>
            <h2 className='font-semibold text-gray-800 text-3xl mb-3'>{courseData.courseTitle}</h2>
            <div className='flex flex-col gap-4 mb-4 border-b border-gray-200 pb-4'>
                <div className='flex items-center gap-2'>
                    <span className={`text-xs uppercase tracking-wider font-medium px-3 py-1 rounded-full flex items-center ${courseData.creatorAddress ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${courseData.creatorAddress ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {courseData.creatorAddress ? 'On-Chain Course' : 'Off-Chain Course'}
                    </span>
                    {courseData.creatorAddress && (
                        <span className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full'>Blockchain Verified</span>
                    )}
                </div>
                
                <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-500'>Course ID:</span>
                        <span className='text-sm font-mono text-gray-700'>{courseData._id}</span>
                    </div>
                    
                    {courseData.creatorAddress && (
                        <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-500'>Creator Address:</span>
                            <span className='text-sm font-mono text-gray-700'>{`${courseData.creatorAddress.slice(0, 20)}...`}</span>
                        </div>
                    )}
                    
                    {policyId && (
                        <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-500'>Policy ID:</span>
                            <span className='text-sm font-mono text-gray-700'>{`${policyId.slice(0, 20)}...`}</span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(policyId);
                                    toast.success('Policy ID copied to clipboard');
                                }}
                                className='text-blue-600 hover:text-blue-700 text-xs'
                            >
                                Copy
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex items-center space-x-2 mb-3'>
                <div className='flex items-center gap-1'>
                    <img src={assets.star} alt="star icon" className='w-3.5 h-3.5' />
                    <p>{rating}</p>
                </div>
                <p>({courseData.courseRatings?.length || 0} ratings)</p>
                <div className='h-4 w-px bg-gray-500/40'></div>
                <p>{courseData.enrolledStudents?.length || 0} students</p>
            </div>

            {courseData.discount > 0 && courseData.discountEndTime && timeLeft && (
                <div className='flex items-center gap-2'>
                    <img className='w-3.5 shake' src={assets.time_left_clock_icon} alt="time left clock icon" />
                    <p className='text-red-500'><span className='font-medium'>{timeLeft}</span> left at this price!</p>
                </div>
            )}

            <div className='flex gap-3 items-center pt-2'>
                <div>
                    <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>
                        {(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)} ADA
                    </p>
                    {adaToUsd > 0 && (
                        <p className='text-sm text-gray-500'>
                            ≈ ${((courseData.coursePrice - courseData.discount * courseData.coursePrice / 100) * adaToUsd).toFixed(2)} USD
                        </p>
                    )}
                </div>
                <div>
                    <p className='md:text-lg text-gray-500 line-through'>
                        {courseData.coursePrice} ADA
                    </p>
                    {adaToUsd > 0 && (
                        <p className='text-sm text-gray-500 line-through'>
                            ≈ ${(courseData.coursePrice * adaToUsd).toFixed(2)} USD
                        </p>
                    )}
                </div>
                <p className='md:text-lg text-gray-500'>
                    {courseData.discount}% off
                </p>
            </div>

            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
                <div className='flex items-center gap-1'>
                    <img src={assets.time_clock_icon} alt="clock icon" />
                    <p>{duration}</p>
                </div>
                <div className='h-4 w-px bg-gray-500/40'></div>
                <div className='flex items-center gap-1'>
                    <img src={assets.lesson_icon} alt="clock icon" />
                    <p>{lecture} lessons</p>
                </div>
            </div>

            {openPaymentPage ?(
                // <NavLink to={`/payment/${courseId}`}>
                //     <button disabled={isAlreadyEnrolled} onClick={isAlreadyEnrolled ? null : handleEnrollCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>
                //         {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                //     </button>
                    
                // </NavLink>
                <button disabled={isAlreadyEnrolled} onClick={isAlreadyEnrolled ? null : handleEnrollCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>
                {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                 </button>

            ): null }
            

            <div className='pt-6'>
                {
                    !openPaymentPage && <>
                    <p className='md:text-xl text-lg font-medium text-gray-800 mb-3'>
                    Information - course description:
                    </p>

                    <div className='text-sm md:text-default text-gray-600'
                        dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
                    />
                    </>
                }

                <div className='mt-4 space-y-2'>
                    <div className='flex items-center gap-2 text-gray-600'>
                        <img src={assets.lesson_icon} alt="lessons" className='w-4 h-4'/>
                        <span>{courseData.courseContent?.length || 0} chapters with {lecture} lectures</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                        <img src={assets.time_clock_icon} alt="duration" className='w-4 h-4'/>
                        <span>Total duration: {duration}</span>
                    </div>
                    {courseData.tests?.length > 0 && (
                        <div className='flex items-center gap-2 text-gray-600'>
                            <img src={assets.test_icon} alt="tests" className='w-4 h-4'/>
                            <span>{courseData.tests.length} tests to assess your knowledge</span>
                        </div>
                    )}
                </div>
            </div>
            <hr className='my-4 border-gray-200' />
            
            <p className='text-sm text-gray-600'>
                Course by <span className='text-blue-600 hover:underline cursor-pointer'>{courseData.educator?.name || 'Anonymous'}</span>
            </p>

        </div>

    </div>
    )
}
export default CourseInformationCard
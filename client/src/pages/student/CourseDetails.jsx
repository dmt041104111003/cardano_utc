import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import CourseInformationCard from '../../components/student/CourseInfomationCard';
import axios from 'axios';
import { toast } from 'react-toastify';


const CourseDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
    const [playerData, setPlayerData] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const { calculateRating, calculateChapterTime, calculateCourseDuration, 
           calculateNoOfLectures, userData, backendUrl, getToken } = useContext(AppContext);

    const calculateTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return '';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = '';
        if (days > 0) timeString += `${days} days `;
        if (hours > 0) timeString += `${Math.floor(hours)} hours `;
        if (minutes > 0) timeString += `${minutes} minutes`;

        return timeString.trim();
    };

    const fetchCourseData = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
            if (data.success) {
                setCourseData(data.courseData);
                if (data.courseData?.courseContent?.length > 0) {
                    setOpenSections({ 0: true });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
        console.log('Course data:', courseData);
    };

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    useEffect(() => {
        if (userData && courseData) {
            setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
        }

        if (courseData?.discount > 0 && courseData?.discountEndTime) {
            setTimeLeft(calculateTimeLeft(courseData.discountEndTime));
            
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(courseData.discountEndTime));
            }, 60000);

            return () => clearInterval(timer);
        }
    }, [userData, courseData]);

    const toggleSection = (index) => {
        setOpenSections((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (isLoading || !courseData) {
        return <Loading />;
    }

    return (
        <>
            <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
                <div className='absolute top-0 left-0 w-full h-section-height bg-gradient-to-b from-cyan-100/70'></div>
                
                <div className="z-10 w-full mb-6 md:hidden">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <a href="/" className="text-sm text-gray-700 hover:text-blue-600">Home</a>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" d="m1 9 4-4-4-4"/>
                                    </svg>
                                    <a href="/courses" className="text-sm text-gray-700 hover:text-blue-600">Courses</a>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" d="m1 9 4-4-4-4"/>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-500">{courseData.courseTitle}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className='z-10 text-gray-500 w-full md:w-2/3 '>
                    {timeLeft && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p className="font-bold">Discount ending soon!</p>
                            <p>Only {timeLeft} left to get {courseData.discount}% off</p>
                        </div>
                    )}

                    <h1 className="text-2xl font-bold text-black mb-4 md:hidden">{courseData.courseTitle}</h1>

                    <div className='border border-gray-300 overflow-hidden p-6 mb-6 '>
                        <h2 className='text-xl font-semibold text-black mb-4'>Course Description</h2>
                        
                        <div className='text-sm md:text-base text-gray-600 text-justify'
                            dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
                        />
                    </div>
                    <div className='border border-gray-300 overflow-hidden'>
                        <div className=' p-6 '>
                            <h2 className='text-xl font-semibold text-black mb-4'>Course Content</h2>
                            <div className='space-y-3'>
                                {courseData.courseContent.map((chapter, index) => (
                                    <div key={index} className='border border-gray-200 rounded-lg overflow-hidden'>
                                        <div 
                                            className='flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors'
                                            onClick={() => toggleSection(index)}
                                        >
                                            <div className='flex items-center gap-2'>
                                                <img 
                                                    className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                                                    src={assets.down_arrow_icon} 
                                                    alt="arrow icon" 
                                                    width={16}
                                                    height={16}
                                                />
                                                <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                                            </div>
                                            <p className='text-sm md:text-base'>
                                                {chapter.chapterContent.length} lessons • {calculateChapterTime(chapter)}
                                            </p>
                                        </div>

                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}
                                        >
                                            <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-200'>
                                                {chapter.chapterContent.map((lecture, i) => (
                                                    <li className='flex items-start gap-2 py-2' key={i}>
                                                        <img 
                                                            src={assets.play_icon} 
                                                            alt="play icon"
                                                            className='w-4 h-4 mt-1 flex-shrink-0' 
                                                        />
                                                        <div className='flex items-center justify-between w-full text-black text-xs md:text-sm'>
                                                            <p className='break-words flex-1'>{lecture.lectureTitle}</p>
                                                            <div className='flex gap-2 ml-2'>
                                                                {lecture.isPreviewFree && (
                                                                    <button
                                                                        onClick={() => setPlayerData({
                                                                            videoId: lecture.lectureUrl.split('/').pop()
                                                                        })}
                                                                        className='text-blue-500 hover:text-blue-700 cursor-pointer whitespace-nowrap'
                                                                    >
                                                                        Preview
                                                                    </button>
                                                                )}
                                                                <span className='whitespace-nowrap'>
                                                                    {humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className=' p-6 '>
                            <h2 className='text-xl font-semibold text-black mb-4'>Course Tests</h2>
                            {courseData.tests && courseData.tests.length > 0 ? (
                                <div className='space-y-4'>
                                    {courseData.tests.map((test, index) => (
                                        <div key={index} className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                            <h4 className='font-semibold text-lg mb-2'>
                                                {test.chapterNumber === 0 ? 'Final Test' : `Chapter ${test.chapterNumber} Test`}
                                            </h4>
                                            <div className='text-gray-600 space-y-1'>
                                                <p>Duration: {test.duration} minutes</p>
                                                <p>Passing Score: {test.passingScore}%</p>
                                                <p>Questions: {test.questions?.length || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-gray-500'>No tests available for this course</p>
                            )}
                        </div>
                        <div className=' p-6 '>
                            <h2 className='text-xl font-semibold text-black mb-4'>Course Information</h2>
                            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                <div className='flex flex-col gap-4'>
                                    
                                    
                                    <div>
                                        <p className='text-sm text-gray-600 font-medium'>Wallet Address:</p>
                                        <p className='text-sm break-all bg-gray-100 p-2 rounded mt-1 font-mono'>
                                            {courseData?.creatorAddress}
                                        </p>
                                    </div>
                                    
                                    {courseData?.txHash && (
                                        <div>
                                            <p className='text-sm text-gray-600 font-medium'>Blockchain Transaction:</p>
                                            <a 
                                                href={`https://preprod.cardanoscan.io/transaction/${courseData.txHash}`} 
                                                target='_blank' 
                                                rel='noopener noreferrer'
                                                className='text-sm text-blue-600 hover:text-blue-800 break-all bg-gray-100 p-2 rounded mt-1 block font-mono'
                                            >
                                                {courseData.txHash}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        

                    </div>
                    
                    <div className="w-full mb-6 mt-8">
                        <h2 className="text-xl font-semibold text-black mb-6">Instructors</h2>
                        
                        <div className="flex-1 mt-3 ">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                                <img 
                                    src={courseData.educator.imageUrl} 
                                    alt={courseData.educator.name}  
                                    className="w-full h-full object-cover"
                                    />

                                </div>
                                <div>
                                <h3 className="text-xl font-bold underline text-blue-600 cursor-pointer"
                                onClick={() => {
                                        
                                    window.scrollTo(0, 0);
                                  
                                    navigate(`/user/${courseData.educator._id}`)
                                }}
                                >{courseData.educator.name}</h3>
                                <p className="text-gray-600">Teaches over 500,000 students</p>
                                </div>
                            </div>
                        
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                <p className="text-sm text-gray-500">Instructor Rating</p>
                                <p className="font-bold">4.6</p>
                                </div>
                                <div>
                                <p className="text-sm text-gray-500">Reviews</p>
                                <p className="font-bold">104,942</p>
                                </div>
                                <div>
                                <p className="text-sm text-gray-500">Students</p>
                                <p className="font-bold">531,984</p>
                                </div>
                                <div>
                                <p className="text-sm text-gray-500">Courses</p>
                                <p className="font-bold">45</p>
                                </div>
                            </div>
                        
                            <div className="text-gray-700 space-y-3 text-justify">
                                <p>Hi. I'm Denis. I have a degree in engineering from the University for Applied Science Konstanz in Germany and discovered my love for programming there.</p>
                                <p>Currently, over 500,000 students learn from my courses. This gives me much energy to create new courses with the highest quality possible. I aim to make learning to code accessible for everyone, as I am convinced, that IT is THE FUTURE!</p>
                                <p>So join my courses and learn to create apps, games, websites, or any other type of application. The possibilities are limitless.</p>
                            </div>
                        </div>
                    </div>
                   
                </div>

                <div className='z-10 w-full md:w-1/3 md:sticky md:top-20'>
                    <CourseInformationCard 
                        courseData={courseData} 
                        playerData={playerData} 
                        isAlreadyEnrolled={isAlreadyEnrolled} 
                        rating={calculateRating(courseData)} 
                        duration={calculateCourseDuration(courseData)} 
                        lecture={calculateNoOfLectures(courseData)} 
                        openPaymentPage={true}
                        courseId={id}
                    />
                </div>
               
               
            </div>
            
            
            <Footer />
        </>
    );
};

export default CourseDetails;
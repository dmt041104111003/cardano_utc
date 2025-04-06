/* eslint-disable no-unused-vars */

import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useEffect, useState, useContext, use } from 'react';
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';

import CourseInformationCard from '../../components/student/CourseInfomationCard';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {

    const { id } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
    const [playerData, setPlayerData] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    
    const {  calculateRating, calculateChapterTime,
        calculateCourseDuration, calculateNoOfLectures, userData, backendUrl,
        getToken } = useContext(AppContext);

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
        if (hours > 0) timeString += `${hours} hours `;
        if (minutes > 0) timeString += `${minutes} minutes`;

        return timeString.trim();
    };

        
    const fetchCourseData = async () => {
        console.log("Course ID:", id);
        try {
            const { data } = await axios.get(backendUrl + '/api/course/' + id)
            if (data.success) {
                setCourseData(data.courseData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    
    

    useEffect(() => {
        fetchCourseData()
    }, [])

    useEffect(() => {
        if (userData && courseData) {
            setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
            console.log(isAlreadyEnrolled);
        }

        // Update time left
        if (courseData?.discount > 0 && courseData?.discountEndTime) {
            setTimeLeft(calculateTimeLeft(courseData.discountEndTime));
            
            // Update every minute
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(courseData.discountEndTime));
            }, 60000);

            return () => clearInterval(timer);
        }
    }, [userData, courseData])

    const toggleSection = (index) => {
        setOpenSections((prev) => (
            {
                ...prev,
                [index]: !prev[index]
            }
        ))
    }
    return courseData ? (
        <>
            <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
                <div className='absolute top-0 left-0 w-full h-section-height bg-gradient-to-b from-cyan-100/70'></div>
                
                <div className='max-w-xl z-10 text-gray-500'>
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <div className='mb-8'>
                            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Course Structure</h2>
                            <div className='space-y-3'>
                                {courseData.courseContent.map((chapter, index) => (
                                    <div key={index} className='border border-gray-200 rounded-lg overflow-hidden'>
                                        <div className='flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none'
                                            onClick={() => toggleSection(index)}>
                                            <div className='flex items-center gap-2'>
                                                <img className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                                                    src={assets.down_arrow_icon} alt="arrow icon" />
                                                <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                                            </div>
                                            <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                                        </div>


                                        <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                                            <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-200'>
                                                {chapter.chapterContent.map((lecture, i) => (
                                                    <li className='flex items-start gap-2 py-1' key={i}>
                                                        <img src={assets.play_icon} alt="play icon"
                                                            className='w-4 h-4 mt-1' />
                                                        <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                                            <p>{lecture.lectureTitle}</p>
                                                            <div className='flex gap-2'>
                                                                {lecture.isPreviewFree && <p
                                                                    onClick={() => setPlayerData({
                                                                        videoId: lecture.lectureUrl.split('/').pop()
                                                                    })}
                                                                    className='text-blue-500 cursor-pointer'>Preview</p>}
                                                                <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
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

                        <div className='mt-8'>
                            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Course Tests</h2>
                            {courseData.tests && courseData.tests.length > 0 ? (
                                <div className='space-y-4'>
                                    {courseData.tests.map((test, index) => (
                                        <div key={index} className='bg-white p-4 rounded-lg border border-gray-200'>
                                            <h4 className='font-semibold text-lg mb-2'>
                                                {test.chapterNumber === 0 ? 'Final Test' : `Chapter ${test.chapterNumber} Test`}
                                            </h4>
                                            <div className='text-gray-600'>
                                                <p>Duration: {test.duration} minutes</p>
                                                <p>Passing Score: {test.passingScore}%</p>
                                                <p>Number of Questions: {test.questions?.length || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-gray-500'>No tests available for this course</p>
                            )}
                        </div>

                        <div className='mt-8'>
                            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Course Creator</h2>
                            <div className='bg-white p-4 rounded-lg border border-gray-200'>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex items-center gap-2'>
                                        <div>
                                            <p className='font-medium'>{courseData?.creator?.name || 'Anonymous'}</p>
                                            <p className='text-sm text-gray-500'>Creator</p>
                                        </div>
                                    </div>
                                    <div className='mt-2'>
                                        <p className='text-sm text-gray-600 font-medium'>Wallet Address:</p>
                                        <p className='text-sm break-all bg-gray-50 p-2 rounded mt-1' title={courseData?.creatorAddress}>
                                            {courseData?.creatorAddress}
                                        </p>
                                    </div>
                                    <div className='mt-2'>
                                        <p className='text-sm text-gray-600 font-medium'>Transaction Hash:</p>
                                        <a 
                                            href={`https://preprod.cardanoscan.io/transaction/${courseData?.txHash}`} 
                                            target='_blank' 
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 break-all bg-gray-50 p-2 rounded mt-1 block'
                                        >
                                            {courseData?.txHash}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
            <Footer />
        </>

    ) : <Loading />
}

export default CourseDetails;

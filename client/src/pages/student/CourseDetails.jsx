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
    
    

    const {  calculateRating, calculateChapterTime,
        calculateCourseDuration, calculateNoOfLectures, userData, backendUrl,
        getToken } = useContext(AppContext);

        
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
            setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
            console.log(isAlreadyEnrolled)
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
                    <h1 className='md:text-course-deatails-heading-large
                text-course-deatails-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
                    <p className='pt-4 md:text-base text-sm'
                        dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

                    <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
                        <p>{calculateRating(courseData)}</p>
                        <div className='flex'>
                            {[...Array(5)].map((_, i) => <img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />)}
                        </div>
                        <p className='text-blue-600'>{courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'}</p>

                        <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
                    </div>

                    <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>

                    <div className='pt-8 text-gray-800'>
                        <h2 className='text-xl font-semibold'>Course Structure</h2>

                        <div className='pt-5'>
                            {courseData.courseContent.map((chapter, index) => (
                                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                                    <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'
                                        onClick={() => toggleSection(index)}>
                                        <div className='flex items-center gap-2'>
                                            <img className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                                                src={assets.down_arrow_icon} alt="arrow icon" />
                                            <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                                        </div>
                                        <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                                    </div>


                                    <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                                        <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
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

                    <div className='py-20 text-sm md:text-default'>
                        <h3 className='text-xl font-semibold text-gray-800 '>Course Description</h3>
                        <p className='pt-3 rich-text'
                            dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>

                    </div>
                </div>

                {/* Course Creator Info */}
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Course Creator</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* <img src={assets.user} alt="Creator" className="w-10 h-10 rounded-full" /> */}
                      <div>
                        <p className="font-medium">{courseData?.creator?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">Creator</p>
                      </div>
                    </div>
                    {/* Wallet Address */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">Wallet Address:</p>
                      <p className="text-sm break-all bg-gray-50 p-2 rounded mt-1" title={courseData?.creatorAddress}>
                        {courseData?.creatorAddress}
                      </p>
                    </div>
                    {/* Transaction Hash */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">Transaction Hash:</p>
                      <a 
                        href={`https://preprod.cardanoscan.io/transaction/${courseData?.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all bg-gray-50 p-2 rounded mt-1 block"
                      >
                        {courseData?.txHash}
                      </a>
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

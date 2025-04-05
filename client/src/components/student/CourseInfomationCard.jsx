/* eslint-disable react/prop-types */
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
const CourseInformationCard = ({courseData, playerData,isAlreadyEnrolled,rating,duration,lecture,openPaymentPage,courseId}) => {
    const { currency} = useContext(AppContext);
    
    
    

    const handleEnrollCourse = () => {
        if (isAlreadyEnrolled) {
            return toast.warn('Already Enrolled')
        } 
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
            <div className='flex items-center gap-2'>
                <img className='w-3.5' src={assets.time_left_clock_icon} alt="time left clock icon" />
                <p className='text-red-500'><span className='font-medium'>5 days</span> left at this price!</p>
            </div>

            <div className='flex gap-3 items-center pt-2'>
                <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>
                    {currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}
                </p>
                <p className='md:text-lg text-gray-500 line-through'>
                    {currency}{courseData.coursePrice}
                </p>
                <p className='md:text-lg text-gray-500'>
                    {courseData.discount}% off
                </p>
            </div>

            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
                <div className='flex items-center gap-1'>
                    <img src={assets.star} alt="star icon" />
                    <p>{rating}</p>
                </div>
                <div className='h-4 w-px bg-gray-500/40'>

                </div>
                <div className='flex items-center gap-1'>
                    <img src={assets.time_clock_icon} alt="clock icon" />
                    <p>{duration}</p>
                </div>
                <div className='h-4 w-px bg-gray-500/40'>

                </div>
                <div className='flex items-center gap-1'>
                    <img src={assets.lesson_icon} alt="clock icon" />
                    <p>{lecture} lessons</p>
                </div>
            </div>
            {openPaymentPage ?(
                <NavLink to={`/payment/${courseId}`}>
                    <button disabled={isAlreadyEnrolled} onClick={isAlreadyEnrolled ? null : handleEnrollCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>
                        {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                    </button>
                </NavLink>
            ): null }
            

            <div className='pt-6'>
                <p className='md:text-xl text-lg font-medium text-gray-800'>
                    What&apos;s in the course?
                </p>

                <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
                    <li>
                        Lifetime access with free updates.
                    </li>
                    <li>Step-by-step, hands-on project guidance.</li>
                    <li>Downloadable resources and source code.</li>
                    <li>Quizzes to test your knowledge.</li>
                    <li>Certificate of completion.</li>
                </ul>
            </div>

        </div>

    </div>
    )
}
export default CourseInformationCard
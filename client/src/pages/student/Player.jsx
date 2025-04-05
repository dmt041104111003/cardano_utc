/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
import Loading from '../../components/student/Loading';
import Certificate from '../../components/student/Certificate';
import axios from 'axios';
import { toast } from 'react-toastify';
const Player = () => {

    const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData,
        fetchUserEnrolledCourses
    } = useContext(AppContext)
    const { courseId } = useParams()
    const [courseData, setCourseData] = useState(null)
    const [openSections, setOpenSections] = useState({})
    const [playerData, setPlayerData] = useState(null)
    const [progressData, setProgressData] = useState(null)
    const [initialRating, setInitialRating] = useState(0)



    const navigate = useNavigate();

    const handleSetCompleted = () => {
        setPlayerData(prev => ({
            ...prev,
            isCompleted: true
        }));

        setCourseData(prev => {
            const updatedCourse = { ...prev };
            updatedCourse.courseContent[playerData.chapter - 1].chapterContent[playerData.lecture - 1].isCompleted = true;
            return updatedCourse;
        });
    };

    const getCourseData = () => {
        enrolledCourses.map((course) => {
            if (course._id === courseId) {
                setCourseData(course)
                course.courseRatings.map((item) => {
                    if (item.userId === userData._id) {
                        setInitialRating(item.rating)
                    }
                })
            }
        })
    }

    const toggleSection = (index) => {
        setOpenSections((prev) => (
            {
                ...prev,
                [index]: !prev[index]
            }
        ))
    };

    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseData()
        }
    }, [enrolledCourses])

    const markLectureAsCompleted = async (lectureId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
                { courseId, lectureId }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(data.message)
                getCourseProgress()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleTest = (test) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, start the test!'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/player/${courseId}/test/${test.testId}`)
            }
        })
    }

    const getCourseProgress = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
                { courseId }, { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                setProgressData(data.progressData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRate = async (rating) => {
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/user/add-rating',
                { courseId, rating }, { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success(data.message)
                fetchUserEnrolledCourses()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getCourseProgress()
    }, [])
    return courseData ? (
        <>
            <div className='p-4 sm:[-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>

                <div className='text-gray-800'>
                    <h2 className='text-xl font-semibold'>Course Structure</h2>
                    <div className='pt-5'>
                        {courseData && courseData.courseContent.map((chapter, index) => (
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

                                                <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ?
                                                    assets.blue_tick_icon : assets.play_icon} alt="icon" className='w-4 h-4 mt-1' />


                                                <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                                    <p>{lecture.lectureTitle}</p>
                                                    <div className='flex gap-2'>
                                                        {lecture.lectureUrl && <p
                                                            onClick={() => setPlayerData({
                                                                ...lecture, chapter: index + 1, lecture: i + 1
                                                            })}
                                                            className='text-blue-500 cursor-pointer'>Watch</p>}
                                                        <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        {courseData && courseData.tests && courseData.tests.length > 0 && (
                            <div className='border border-gray-300 bg-white mb-2 rounded'>
                                <div
                                    className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'
                                    onClick={() => toggleSection('test')}
                                >
                                    <div className='flex items-center gap-2'>
                                        <img
                                            className={`transform transition-transform ${openSections['test'] ? 'rotate-180' : ''}`}
                                            src={assets.down_arrow_icon}
                                            alt="arrow icon"
                                        />
                                        <p className='font-medium md:text-base text-sm'>Test</p>
                                    </div>
                                    <p className='text-sm md:text-default'>{courseData.tests.length} test(s)</p>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${openSections['test'] ? 'max-h-96' : 'max-h-0'}`}>
                                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                                        {courseData.tests.map((test, i) => (
                                            <li className='flex items-start gap-2 py-1' key={i}>
                                                <img src={assets.exam_icon} alt="play icon" className='w-4 h-4 mt-1' />
                                                <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                                    <p>{test.testTitle}</p>

                                                    <div className='flex gap-2'>
                                                        <p className='text-blue-500 cursor-pointer'
                                                            onClick={() => handleTest(test)}
                                                        >
                                                            Start Test
                                                        </p>
                                                        <p className='text-sm md:text-default'>{test.testDuration} min</p>
                                                    </div>

                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='flex items-center gap-2 py-3 mt-10'>
                        <h1 className='text-xl font-bold'>Rate this Course:</h1>
                        <Rating initialRating={initialRating} onRate={handleRate} />
                    </div>


                </div>

                <div className='md:mt-10'>
                    {playerData ? (
                        <div>

                            <YouTube videoId={playerData.lectureUrl.split('/').pop()} 
                                opts={{
                                    width: '100%',
                                    height: '100%',
                                    playerVars: {
                                        autoplay: 0,
                                        controls: 1,
                                        playsinline: 1,
                                        mute: 1
                                    }
                                }}
                                iframeClassName='w-full aspect-video' />
                            <div className='flex justify-between items-center mt-1'>
                                <p>
                                    {playerData.chapter}.{playerData.lecture}.{playerData.lectureTitle}
                                </p>
                                <button
                                    className={`${playerData?.isCompleted ? "text-gray-500 cursor-not-allowed" : "text-blue-600"}`}
                                    onClick={() => markLectureAsCompleted(playerData.lectureId)}
                                // disabled={playerData?.isCompleted}
                                >
                                    {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : "Mark Complete"}
                                </button>


                            </div>
                        </div>
                    )
                        :
                        <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
                    }
                    <Certificate />
                </div>

            </div>
            <Footer />
        </>
    ) : <Loading />
}

export default Player;

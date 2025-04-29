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
    const [showTest, setShowTest] = useState(false)
    const [testData, setTestData] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [timer, setTimer] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [testResult, setTestResult] = useState(null)
    const [completedTests, setCompletedTests] = useState({})

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

    const handleTest = async (test) => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.courseData) {
                const currentTest = data.courseData.tests.find(t => t.chapterNumber === test.chapterNumber);
                if (currentTest) {
                    // Check if test is already completed
                    if (completedTests[currentTest.testId]) {
                        toast.info('You have already passed this test!');
                        return;
                    }

                    // Get saved progress for this test
                    const savedProgress = progressData?.tests?.find(t => t.testId === currentTest.testId);

                    setTestData({
                        title: `Chapter ${currentTest.chapterNumber} Test`,
                        testId: currentTest.testId,
                        chapterNumber: currentTest.chapterNumber,
                        duration: currentTest.duration || 3,
                        questions: currentTest.questions.map(q => ({
                            text: q.questionText,
                            type: q.type,
                            options: q.options,
                            note: q.note
                        })) || [],
                        passingScore: currentTest.passingScore || 70,
                        type: currentTest.type || 'multiple_choice'
                    });

                    // Reset or load saved answers
                    setSelectedAnswers(savedProgress?.answers?.reduce((acc, ans) => {
                        acc[ans.questionIndex] = ans.selectedAnswers;
                        return acc;
                    }, {}) || {});

                    // Set time
                    const timeSpent = savedProgress?.timeSpent || 0;
                    const remainingTime = Math.max((currentTest.duration * 60) - timeSpent, 0);
                    setTimeLeft(remainingTime || (currentTest.duration * 60));

                    setShowTest(true);

                    // Start countdown
                    const countdown = setInterval(() => {
                        setTimeLeft(prev => {
                            if (prev <= 1) {
                                clearInterval(countdown);
                                handleSubmitTest();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                    setTimer(countdown);
                }
            }
        } catch (error) {
            console.error('Error fetching test:', error);
            toast.error('Error loading test information');
        }
    };

    const handleCloseTest = () => {
        if (timer) clearInterval(timer)
        setShowTest(false)
        setTestData(null)
        setTimeLeft(0)
    }

    const handleSubmitTest = async () => {
        if (timer) clearInterval(timer);
        
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.courseData) {
                const currentTest = data.courseData.tests.find(t => t.testId === testData.testId);
                
                if (currentTest) {
                    let correctAnswers = 0;
                    const answers = [];

                    currentTest.questions.forEach((question, qIndex) => {
                        const userAnswers = selectedAnswers[qIndex] || [];
                        const serverCorrectAnswers = question.correctAnswers;
                        
                        const convertedUserAnswers = userAnswers.map(answer => answer.toString());
                        const isCorrect = convertedUserAnswers.length === serverCorrectAnswers.length &&
                            convertedUserAnswers.every(answer => serverCorrectAnswers.includes(answer)) &&
                            serverCorrectAnswers.every(answer => convertedUserAnswers.includes(answer));
                        
                        if (isCorrect) correctAnswers++;

                        // Save answer details
                        answers.push({
                            questionIndex: qIndex,
                            selectedAnswers: convertedUserAnswers,
                            isCorrect
                        });
                    });

                    const totalQuestions = currentTest.questions.length;
                    const score = (correctAnswers / totalQuestions) * 100;
                    const passed = score >= currentTest.passingScore;

                    const result = {
                        score: Math.round(score),
                        correctAnswers,
                        totalQuestions,
                        passed
                    };

                    setTestResult(result);

                    // Calculate time spent
                    const timeSpent = (currentTest.duration * 60) - timeLeft;

                    Swal.fire({
                        title: result.passed ? 'Congratulations!' : 'Try Again!',
                        html: `
                            <div class="text-center">
                                <p class="text-xl font-bold mb-2">Score: ${result.score}%</p>
                                <p class="mb-2">Correct answers: ${result.correctAnswers}/${result.totalQuestions}</p>
                                <p class="text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}">
                                    ${result.passed ? 'You passed the test!' : 'You have not passed the test.'}
                                </p>
                                <p class="text-sm mt-2">Required score: ${currentTest.passingScore}%</p>
                            </div>
                        `,
                        icon: result.passed ? 'success' : 'error',
                        confirmButtonText: 'Close',
                        allowOutsideClick: false
                    }).then(async () => {
                        setShowTest(false);
                        setTestData(null);
                        setTimeLeft(0);

                        try {
                            const token = await getToken();
                            const { data } = await axios.post(
                                `${backendUrl}/api/user/update-course-progress`,
                                {
                                    courseId,
                                    lectureId: testData.testId,
                                    test: {
                                        passed: result.passed,
                                        score: result.score,
                                        answers: answers,
                                        timeSpent: timeSpent
                                    }
                                },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (data.success) {
                                toast.success('Test results saved successfully');
                                getCourseProgress(); // Refresh progress data
                                
                                // Update course data to reflect new status
                                setCourseData(prev => {
                                    const updatedCourse = { ...prev };
                                    const testIndex = updatedCourse.tests.findIndex(t => t.testId === testData.testId);
                                    if (testIndex !== -1) {
                                        updatedCourse.tests[testIndex].isCompleted = result.passed;
                                    }
                                    return updatedCourse;
                                });

                                // After successful submission, update completedTests state
                                if (result.passed) {
                                    setCompletedTests(prev => ({
                                        ...prev,
                                        [testData.testId]: true
                                    }));
                                }
                            }
                        } catch (error) {
                            console.error('Error saving test result:', error);
                            toast.error('Could not save test results');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error('An error occurred while submitting the test');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
                // Update local rating state
                setInitialRating(data.userRating)
                // Update course data with new ratings
                setCourseData(prevCourse => ({
                    ...prevCourse,
                    courseRatings: data.courseRatings
                }))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setSelectedAnswers(prev => {
            const newAnswers = { ...prev };
            if (!newAnswers[questionIndex]) {
                newAnswers[questionIndex] = [optionIndex];
            } else {
                const index = newAnswers[questionIndex].indexOf(optionIndex);
                if (index === -1) {
                    // Add the option if not already selected
                    newAnswers[questionIndex] = [...newAnswers[questionIndex], optionIndex];
                } else {
                    // Remove the option if already selected
                    newAnswers[questionIndex] = newAnswers[questionIndex].filter(idx => idx !== optionIndex);
                }
            }
            return newAnswers;
        });
    };

    useEffect(() => {
        getCourseProgress()
    }, [])

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [timer])

    // Add this useEffect to update completed tests when progressData changes
    useEffect(() => {
        if (progressData && progressData.tests) {
            const completed = {};
            progressData.tests.forEach(test => {
                if (test.passed) {
                    completed[test.testId] = true;
                }
            });
            setCompletedTests(completed);
        }
    }, [progressData]);

    if (!courseData) return <Loading />

    return (
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
                                        <p className='font-medium md:text-base text-sm'>Tests</p>
                                    </div>
                                    <p className='text-sm md:text-default'>{courseData.tests.length} test(s)</p>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${openSections['test'] ? 'max-h-96' : 'max-h-0'}`}>
                                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                                        {courseData.tests.map((test, i) => {
                                            const isCompleted = completedTests[test.testId];
                                            const savedTest = progressData?.tests?.find(t => t.testId === test.testId);
                                            return (
                                                <li className='flex items-start gap-2 py-1' key={i}>
                                                    <img 
                                                        src={isCompleted ? assets.check_circle : assets.exam_icon} 
                                                        alt="test icon" 
                                                        className='w-4 h-4 mt-1' 
                                                    />
                                                    <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                                                        <div>
                                                            <p>{test.testTitle || `Chapter ${test.chapterNumber} Test`}</p>
                                                            {savedTest && !savedTest.passed && (
                                                                <p className='text-sm text-gray-500'>Previous score: {savedTest.score}%</p>
                                                            )}
                                                        </div>
                                                        <div className='flex gap-2'>
                                                            {isCompleted ? (
                                                                <span className='text-green-500 flex items-center gap-1'>
                                                                    <img src={assets.check_circle} alt="completed" className='w-4 h-4' />
                                                                    Passed
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    className='text-blue-500 hover:text-blue-700'
                                                                    onClick={() => handleTest(test)}
                                                                >
                                                                    {savedTest ? 'Retry Test' : 'Start Test'}
                                                                </button>
                                                            )}
                                                            <p>{test.duration || 3} min</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
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

            {/* Test Modal */}
            {showTest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={handleCloseTest}
                            className="absolute top-4 left-4 bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
                        >
                            Back
                        </button>

                        <div className="text-center mb-8 pt-4">
                            <h2 className="text-2xl font-bold mb-2">{testData?.title || 'Bài kiểm tra'}</h2>
                            <div className="flex justify-center gap-4 text-gray-500 mb-2">
                                <p>Mã bài: {testData?.testId}</p>
                                <p>Chương: {testData?.chapterNumber}</p>
                            </div>
                            <div className="text-xl font-semibold text-red-600">
                                Time remaining: {formatTime(timeLeft)}
                            </div>
                            <div className="text-gray-600 mt-2">
                                <p>Test type: {testData?.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}</p>
                                <p>Điểm đạt yêu cầu: {testData?.passingScore}%</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {testData.questions.map((question, qIndex) => (
                                <div key={qIndex} className="mb-6">
                                    <p className="font-semibold mb-2">{qIndex + 1}. {question.text}</p>
                                    <div className="space-y-2">
                                        {question.options.map((option, oIndex) => (
                                            <div key={oIndex} 
                                                className={`p-2 border rounded cursor-pointer hover:bg-gray-100 
                                                    ${selectedAnswers[qIndex]?.includes(oIndex) ? 'bg-blue-100 border-blue-500' : ''}`}
                                                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                    {question.note && (
                                        <p className="text-sm text-gray-600 mt-1">{question.note}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={handleSubmitTest}
                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-semibold"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Player;

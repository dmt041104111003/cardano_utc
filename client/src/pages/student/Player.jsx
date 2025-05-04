/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppContext } from '../../context/AppContext';
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
  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [showTest, setShowTest] = useState(false);
  const [testData, setTestData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const courseDataCache = useRef(null);

  // Fetch course data from enrolled courses
  const getCourseData = () => {
    const course = enrolledCourses.find(course => course._id === courseId);
    if (course) {
      setCourseData(course);
      courseDataCache.current = course;
      const userRating = course.courseRatings.find(item => item.userId === userData._id);
      setInitialRating(userRating ? userRating.rating : 0);
    }
  };

  // Toggle chapter/test section visibility
  const toggleSection = (index) => {
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Fetch course progress
  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message || 'Failed to fetch progress');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching progress');
    }
  };

  // Mark lecture as completed
  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
        setCourseData(prev => {
          const updatedCourse = { ...prev };
          const lecture = updatedCourse.courseContent
            .flatMap(ch => ch.chapterContent)
            .find(l => l.lectureId === lectureId);
          if (lecture) lecture.isCompleted = true;
          return updatedCourse;
        });
      } else {
        toast.error(data.message || 'Failed to mark lecture as completed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error marking lecture as completed');
    }
  };

  // Handle test initiation
  const handleTest = async (test) => {
    try {
      const token = await getToken();
      const course = courseDataCache.current || (await axios.get(
        `${backendUrl}/api/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )).data.courseData;

      if (!course) {
        toast.error('Course data not found');
        return;
      }

      const currentTest = course.tests.find(t => t.testId === test.testId && t.chapterNumber === test.chapterNumber);
      if (!currentTest) {
        toast.error('Test not found');
        return;
      }

      const isTestCompleted = progressData?.tests?.some(
        t => t.testId === currentTest.testId && t.passed
      );

      if (isTestCompleted) {
        toast.info('You have already passed this test!');
        return;
      }

      const savedProgress = progressData?.tests?.find(t => t.testId === currentTest.testId);
      const remainingTime = savedProgress
        ? Math.max((currentTest.duration * 60) - savedProgress.timeSpent, 0)
        : currentTest.duration * 60;

      setTestData({
        title: currentTest.testTitle || `Chapter ${currentTest.chapterNumber} Test`,
        testId: currentTest.testId,
        chapterNumber: currentTest.chapterNumber,
        duration: currentTest.duration || 3,
        questions: currentTest.questions.map(q => ({
          text: q.questionText,
          type: q.type,
          options: q.options || [],
          note: q.note || '',
          essayAnswer: q.essayAnswer || '',
        })),
        passingScore: currentTest.passingScore || 70,
        type: currentTest.type || 'multiple_choice',
      });

      setSelectedAnswers(savedProgress?.answers?.reduce((acc, ans) => {
        acc[ans.questionIndex] = ans.selectedAnswers;
        return acc;
      }, {}) || {});

      setTimeLeft(remainingTime);
      setShowTest(true);

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
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error(error.response?.data?.message || 'Error loading test');
    }
  };

  // Close test modal
  const handleCloseTest = () => {
    if (timer) clearInterval(timer);
    setShowTest(false);
    setTestData(null);
    setTimeLeft(0);
    setSelectedAnswers({});
    setTestResult(null);
    setTimer(null);
  };

  // Submit test answers
  const handleSubmitTest = async () => {
    if (timer) clearInterval(timer);

    try {
      const token = await getToken();
      const course = courseDataCache.current || (await axios.get(
        `${backendUrl}/api/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )).data.courseData;

      if (!course) {
        toast.error('Course data not found');
        return;
      }

      const currentTest = course.tests.find(t => t.testId === testData.testId);
      if (!currentTest) {
        toast.error('Test not found');
        return;
      }

      let correctAnswers = 0;
      const answers = [];

      currentTest.questions.forEach((question, qIndex) => {
        const userAnswers = selectedAnswers[qIndex] || (question.type === 'essay' ? '' : []);
        let isCorrect = false;

        if (question.type === 'multiple_choice') {
          const serverCorrectAnswers = question.correctAnswers || [];
          const userAnswersArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers];
          const sortedUserAnswers = [...userAnswersArray].map(String).sort();
          const sortedServerAnswers = [...serverCorrectAnswers].map(String).sort();

          isCorrect = sortedUserAnswers.length === sortedServerAnswers.length &&
            sortedUserAnswers.every((ans, idx) => ans === sortedServerAnswers[idx]);

          if (isCorrect) correctAnswers++;
          answers.push({
            questionIndex: qIndex,
            selectedAnswers: sortedUserAnswers,
            isCorrect,
          });
        } else if (question.type === 'essay') {
          // For essay questions, store the answer without grading
          answers.push({
            questionIndex: qIndex,
            selectedAnswers: userAnswers,
            isCorrect: false, // Essay answers are not auto-graded
          });
        }
      });

      const totalQuestions = currentTest.questions.filter(q => q.type === 'multiple_choice').length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const passed = score >= currentTest.passingScore;

      const result = {
        score: Math.round(score),
        correctAnswers,
        totalQuestions,
        passed,
      };

      setTestResult(result);

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
        allowOutsideClick: false,
      }).then(async () => {
        handleCloseTest();

        if (result.passed) {
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
                  answers,
                  timeSpent,
                },
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
              toast.success('Test results saved successfully');
              getCourseProgress();
              setCourseData(prev => {
                const updatedCourse = { ...prev };
                const testIndex = updatedCourse.tests.findIndex(t => t.testId === testData.testId);
                if (testIndex !== -1) {
                  updatedCourse.tests[testIndex].isCompleted = true;
                }
                return updatedCourse;
              });
            } else {
              toast.error(data.message || 'Failed to save test results');
            }
          } catch (error) {
            console.error('Error saving test result:', error);
            toast.error(error.response?.data?.message || 'Could not save test results');
          }
        } else {
          toast.info('Test result not saved as you did not pass the test');
        }
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error(error.response?.data?.message || 'Error submitting test');
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle course rating
  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setInitialRating(data.userRating);
        setCourseData(prev => ({
          ...prev,
          courseRatings: data.courseRatings,
        }));
      } else {
        toast.error(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting rating');
    }
  };

  // Handle answer selection for multiple-choice and essay questions
  const handleAnswerSelect = (questionIndex, optionIndex, value) => {
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      const question = testData.questions[questionIndex];

      if (question.type === 'multiple_choice') {
        if (!newAnswers[questionIndex]) {
          newAnswers[questionIndex] = [optionIndex];
        } else {
          const index = newAnswers[questionIndex].indexOf(optionIndex);
          if (index === -1) {
            newAnswers[questionIndex] = [...newAnswers[questionIndex], optionIndex];
          } else {
            newAnswers[questionIndex] = newAnswers[questionIndex].filter(idx => idx !== optionIndex);
          }
        }
      } else if (question.type === 'essay') {
        newAnswers[questionIndex] = value;
      }

      return newAnswers;
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses]);

  // Fetch progress on mount
  useEffect(() => {
    getCourseProgress();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  if (!courseData) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-10">
          <div className="text-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-2"></div>
              Course Structure
            </h2>
            <div className="pt-2">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-200 bg-white mb-3 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none bg-gradient-to-r from-blue-50 to-indigo-50"
                    onClick={() => toggleSection(index)}
                    role="button"
                    aria-expanded={openSections[index]}
                    aria-controls={`chapter-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-blue-600 transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <p className="font-semibold text-gray-800">{chapter.chapterTitle}</p>
                    </div>
                    <div className="text-sm text-gray-600 bg-white bg-opacity-60 px-2.5 py-1 rounded-full">
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </div>
                  </div>

                  <div
                    id={`chapter-${index}`}
                    className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[500px]' : 'max-h-0'}`}
                  >
                    <ul className="py-3 px-4 text-gray-700 border-t border-gray-200 divide-y divide-gray-100">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          className="flex items-center gap-3 py-2.5 hover:bg-gray-50 px-2 rounded-md transition-colors"
                          key={i}
                        >
                          {progressData?.lectureCompleted.includes(lecture.lectureId) ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-500 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-500 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <div className="flex items-center justify-between w-full">
                            <p className="text-sm font-medium">{lecture.lectureTitle}</p>
                            <div className="flex items-center gap-3">
                              {lecture.lectureUrl && (
                                <button
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded transition-colors"
                                >
                                  Watch
                                </button>
                              )}
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
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
              {courseData.tests && courseData.tests.length > 0 && (
                <div className="border border-gray-200 bg-white mb-3 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none bg-gradient-to-r from-indigo-50 to-purple-50"
                    onClick={() => toggleSection('test')}
                    role="button"
                    aria-expanded={openSections['test']}
                    aria-controls="test-section"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-indigo-600 transform transition-transform ${openSections['test'] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="font-semibold text-gray-800">Tests</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-white bg-opacity-60 px-2.5 py-1 rounded-full">
                      {courseData.tests.length} test(s)
                    </div>
                  </div>

                  <div
                    id="test-section"
                    className={`overflow-hidden transition-all duration-300 ${openSections['test'] ? 'max-h-[500px]' : 'max-h-0'}`}
                  >
                    <ul className="py-3 px-4 text-gray-700 border-t border-gray-200 divide-y divide-gray-100">
                      {courseData.tests.map((test, i) => {
                        const savedTest = progressData?.tests?.find(t => t.testId === test.testId);
                        const isPassed = savedTest?.passed || false;

                        return (
                          <li
                            className="flex items-center gap-3 py-2.5 hover:bg-gray-50 px-2 rounded-md transition-colors"
                            key={i}
                          >
                            {isPassed ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-500 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-indigo-500 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                              </svg>
                            )}
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="text-sm font-medium">
                                  {test.testTitle || `Chapter ${test.chapterNumber} Test`}
                                </p>
                                {savedTest && !savedTest.passed && (
                                  <p className="text-xs text-gray-500 mt-1">Previous score: {savedTest.score}%</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isPassed ? (
                                  <span className="text-xs font-medium text-white bg-green-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Passed
                                  </span>
                                ) : (
                                  <button
                                    className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded transition-colors"
                                    onClick={() => handleTest(test)}
                                  >
                                    {savedTest ? 'Retry Test' : 'Start Test'}
                                  </button>
                                )}
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {test.duration || 3} min
                                </span>
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

            <div className="flex items-center gap-2 py-3 mt-10">
              <h1 className="text-xl font-bold">Rate this Course:</h1>
              <Rating initialRating={initialRating} onRate={handleRate} />
            </div>
          </div>

          <div className="md:mt-10">
            {playerData ? (
              <div>
                <YouTube
                  videoId={playerData.lectureUrl.split('/').pop()}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                      playsinline: 1,
                      mute: 0,
                    },
                  }}
                  iframeClassName="w-full aspect-video"
                />
                <div className="flex justify-between items-center mt-1">
                  <p>
                    {playerData.chapter}.{playerData.lecture}. {playerData.lectureTitle}
                  </p>
                  <button
                    className={`${
                      progressData?.lectureCompleted.includes(playerData.lectureId)
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    onClick={() => markLectureAsCompleted(playerData.lectureId)}
                    disabled={progressData?.lectureCompleted.includes(playerData.lectureId)}
                  >
                    {progressData?.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ) : (
              <img src={courseData.courseThumbnail} alt="Course Thumbnail" className="w-full aspect-video object-cover" />
            )}
            <Certificate />
          </div>
        </div>
      </div>

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
              <h2 className="text-2xl font-bold mb-2">{testData?.title || 'Test'}</h2>
              <div className="flex justify-center gap-4 text-gray-500 mb-2">
                <p>Test ID: {testData?.testId}</p>
                <p>Chapter: {testData?.chapterNumber}</p>
              </div>
              <div className="text-xl font-semibold text-red-600">
                Time remaining: {formatTime(timeLeft)}
              </div>
              <div className="text-gray-600 mt-2">
                <p>Test type: {testData?.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}</p>
                <p>Passing score: {testData?.passingScore}%</p>
              </div>
            </div>

            <div className="space-y-6">
              {testData.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className={`mb-6 ${!selectedAnswers[qIndex] && selectedAnswers[qIndex] !== '' ? 'border-l-4 border-red-500 pl-4' : ''}`}
                >
                  <p className="font-semibold mb-2">
                    {qIndex + 1}. {question.text}
                    {!selectedAnswers[qIndex] && selectedAnswers[qIndex] !== '' && (
                      <span className="text-red-500 text-sm ml-2">(Unanswered)</span>
                    )}
                  </p>
                  {question.type === 'multiple_choice' ? (
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                            selectedAnswers[qIndex]?.includes(oIndex) ? 'bg-blue-100 border-blue-500' : ''
                          }`}
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                          role="checkbox"
                          aria-checked={selectedAnswers[qIndex]?.includes(oIndex)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleAnswerSelect(qIndex, oIndex);
                              e.preventDefault();
                            }
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      value={selectedAnswers[qIndex] || ''}
                      onChange={(e) => handleAnswerSelect(qIndex, null, e.target.value)}
                      placeholder="Enter your answer here"
                    />
                  )}
                  {question.note && (
                    <p className="text-sm text-gray-600 mt-1 italic">{question.note}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleSubmitTest}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default Player;
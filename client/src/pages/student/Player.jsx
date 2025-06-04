import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppContext } from '../../context/AppContext';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Rating from '../../components/student/Rating';
import Loading from '../../components/student/Loading';
import Certificate from '../../components/student/Certificate';
import axios from 'axios';
import { toast } from 'react-toastify';
import TestManager from './TestManager.jsx';

let globalIsBlocked = false;

const Player = () => {
  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    currentWallet,
    wallet,
  } = useContext(AppContext);
  const { courseId } = useParams();

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exitAttempted, setExitAttempted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [studentId, setStudentId] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const testContainerRef = useRef(null);
  const courseDataCache = useRef(null);

  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [violationImage, setViolationImage] = useState(null);
  const [violationReason, setViolationReason] = useState("");
  const [showViolationImage, setShowViolationImage] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cocoModelRef = useRef(null);
  const lastFaceTimeRef = useRef(Date.now());

  const getCourseData = () => {
    const course = enrolledCourses.find(course => course._id === courseId);
    if (course) {
      setCourseData(course);
      courseDataCache.current = course;
      const userRating = course.courseRatings.find(item => item.userId === userData._id);
      setInitialRating(userRating ? userRating.rating : 0);
    }
  };

  const toggleSection = (index) => {
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

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

  const requestFullscreen = () => {
    const elem = testContainerRef.current || document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };



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

      Swal.fire({
        title: 'Start Test',
        html: `
          <div class="text-left mb-4">
            <p class="mb-2"><strong>Test:</strong> ${currentTest.testTitle || `Chapter ${currentTest.chapterNumber} Test`}</p>
            <p class="mb-2"><strong>Duration:</strong> ${currentTest.duration} minutes</p>
            <p class="mb-2"><strong>Questions:</strong> ${currentTest.questions.length}</p>
            <p class="mb-2"><strong>Passing Score:</strong> ${currentTest.passingScore}%</p>
            <p class="mb-4"><strong>Test Code:</strong> ${currentTest.testId}</p>
            <div class="bg-yellow-50 p-3 rounded text-yellow-800 text-sm">
              <p class="font-bold mb-1">Important Security Notice:</p>
              <ul class="list-disc pl-5 space-y-1">
                <li>This test will run in fullscreen mode</li>
                <li>Exiting fullscreen will result in test failure</li>
                <li>Switching tabs or windows is not allowed</li>
                <li>Time limit will be strictly enforced</li>
              </ul>
            </div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Start Test',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          startTest(currentTest);
        }
      });
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error(error.response?.data?.message || 'Error loading test');
    }
  };

  const startTest = (currentTest) => {
    violationReportedForTestRef.current = false;
    
    const savedProgress = progressData?.tests?.find(t => t.testId === currentTest.testId);
    const remainingTime = savedProgress
      ? Math.max((currentTest.duration * 60) - savedProgress.timeSpent, 0)
      : currentTest.duration * 60;

    setTestData({
      title: currentTest.testTitle || `Chapter ${currentTest.chapterNumber} Test`,
      testId: currentTest.testId,
      chapterNumber: currentTest.chapterNumber,
      duration: currentTest.duration,
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
    setCurrentQuestionIndex(0);
    setExitAttempted(false);

    setTimeout(() => {
      requestFullscreen();
      toast.info('Test started in fullscreen mode. Do not exit fullscreen or switch tabs.', {
        autoClose: 5000,
        position: 'top-center'
      });
    }, 100);

    document.addEventListener('visibilitychange', handleVisibilityChange);

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
  };

  const handleBeforeUnload = (e) => {
    if (showTest) {
      e.preventDefault();
      e.returnValue = '';
      setExitAttempted(true);
      handleTestFailure("FAILED: You exited full screen so the test was canceled.");
      return '';
    }
  };

  const lastViolationTimeRef = useRef({});
  const reportedViolationsRef = useRef(new Set());
  const activeViolationsRef = useRef(new Set());
  const violationReportedForTestRef = useRef(false);
  const VIOLATION_COOLDOWN = 30000;
  const VIOLATION_PRIORITY = {
    "phone_detected": 5, 
    "fullscreen_exit": 4,  
    "tab_switch": 3,      
    "face_not_detected": 2, 
    "looking_away": 1,    
    "other": 0     
  };
  const clearViolation = (violationType) => {
    if (activeViolationsRef.current.has(violationType)) {
      activeViolationsRef.current.delete(violationType);
    }
  };
  
  const captureViolationImage = async (reason, violationType) => {
    if (!videoRef.current) return;
    let actualViolationType = violationType;
    
    if (!actualViolationType) {
      const violationTypeMap = {
        "No Face Detected": "face_not_detected",
        "No face detected": "face_not_detected",
        "Don't look at the screen": "looking_away",
        "Not looking at the screen": "looking_away",
        "Detect Phone Use": "phone_detected",
        "Phone usage detected": "phone_detected",
        "Exit Full Screen": "fullscreen_exit",
        "Exited full screen mode": "fullscreen_exit",
        "Switch Tab or Minimize Window": "tab_switch"
      };
      
      actualViolationType = violationTypeMap[reason] || "other";
    }
    
    activeViolationsRef.current.add(actualViolationType);

    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[actualViolationType] || 0;
    const minuteTimestamp = Math.floor(now / 60000) * 60000;
    const violationKey = `${actualViolationType}_${minuteTimestamp}`;
    if (reportedViolationsRef.current.has(violationKey)) {
      return;
    }
    if (now - lastTime < VIOLATION_COOLDOWN) {
      return;
    }
    lastViolationTimeRef.current[actualViolationType] = now;
    reportedViolationsRef.current.add(violationKey);
    if (reportedViolationsRef.current.size > 50) {
      const entries = Array.from(reportedViolationsRef.current);
      entries.slice(0, 10).forEach(entry => reportedViolationsRef.current.delete(entry));
    }
    const activeViolations = Array.from(activeViolationsRef.current);
    activeViolations.sort((a, b) => (VIOLATION_PRIORITY[b] || 0) - (VIOLATION_PRIORITY[a] || 0));
    let displayReasons = [];
    for (const vType of activeViolations) {
      if (vType === "phone_detected") {
        displayReasons.push("Phone usage detected");
      } else if (vType === "face_not_detected") {
        displayReasons.push("No face detected");
      } else if (vType === "looking_away") {
        displayReasons.push("Not looking at the screen");
      } else if (vType === "fullscreen_exit") {
        displayReasons.push("Exited full screen mode");
      } else if (vType === "tab_switch") {
        displayReasons.push("Switched tab or minimized window");
      }
    }
    if (displayReasons.length === 0) {
      displayReasons.push(reason);
    }
    const displayReason = displayReasons.join(", ");
    
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
      
      const timestamp = new Date().toLocaleString();
      const imgData = tempCanvas.toDataURL("image/png");
      
      setViolationImage(imgData);
      setViolationReason(`${displayReason} - ${timestamp}`);
      setShowViolationImage(true);
      
      localStorage.setItem("violationImage", imgData);
      localStorage.setItem("violationReason", displayReason);
      localStorage.setItem("violationTime", timestamp);
      
      console.log(`Violation captured: ${reason} at ${timestamp}`);
      
      const studentId = userData?._id;
      const testId = testData?.testId;
      
      if (studentId && courseId && testId) {
        try {
          let walletAddress = "";
          
          try {
            if (wallet) {
              const addresses = await wallet.getUsedAddresses();
              if (addresses && addresses.length > 0) {
                walletAddress = addresses[0];
                console.log('Got wallet address from wallet:', walletAddress);
              }
            }
            else if (currentWallet) {
              const addresses = await currentWallet.getUsedAddresses();
              if (addresses && addresses.length > 0) {
                walletAddress = addresses[0];
                console.log('Got wallet address from currentWallet:', walletAddress);
              }
            }
            else if (userData?.walletAddress) {
              walletAddress = userData.walletAddress;
              console.log('Got wallet address from userData:', walletAddress);
            }
            
            if (!walletAddress) {
              console.log('No wallet address found, using empty string');
            }
          } catch (error) {
            console.error('Error getting wallet address:', error);
          }
          const highestPriorityType = activeViolations.length > 0 ? activeViolations[0] : actualViolationType;
          const combinedMessage = `Test violations: ${displayReason}`;
          let educatorId = "";
          if (courseData && courseData.educator) {
            educatorId = courseData.educator;
          }
          
          const violationData = {
            studentId,
            courseId,
            testId,
            violationType: highestPriorityType, 
            message: combinedMessage, 
            allViolations: Array.from(activeViolationsRef.current), 
            imageData: imgData,
            walletAddress,
            educatorId
          };
          if (violationReportedForTestRef.current) {
            return;
          }          
          try {
            const response = await axios.post(
              `${backendUrl}/api/violation/report`,
              violationData,
              { 
                headers: { 
                  'Content-Type': 'application/json'
                } 
              }
            );
            
            if (response.data.success) {
              violationReportedForTestRef.current = true;
              try {
                const progressToken = await getToken();
                const progressResponse = await axios.post(
                  `${backendUrl}/api/user/update-course-progress`,
                  {
                    courseId,
                    lectureId: testId || `violation_${new Date().getTime()}`,
                    violation: {
                      type: actualViolationType,
                      message: displayReason,
                      timestamp: new Date(),
                      imageData: imgData
                    },
                  },
                  { headers: { Authorization: `Bearer ${progressToken}` } }
                );
                
                if (progressResponse.data.success) {
                  console.log('Course progress updated with violation data');
                } else {
                  console.error('Failed to update course progress with violation:', progressResponse.data.message);
                }
              } catch (progressError) {
                console.error('Error updating course progress with violation:', progressError);
              }
            } else {
              console.error("API returned error:", response.data);
            }
          } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('minted as an NFT')) {
              console.log('This violation has been minted as NFT and cannot be updated');
              violationReportedForTestRef.current = true;
            } else {
              console.error("Error saving violation to database:", error.response?.data || error.message || error);
            }
          }
        } catch (error) {
          console.error("Error saving violation to database:", error.response?.data || error.message || error);
        }
      } else {
        console.warn("Missing required data for saving violation to database");
      }
    } catch (error) {
      console.error("Error capturing violation image:", error);
    }
  };
  
  const handleTestFailure = (message, reason) => {
    if (timer) clearInterval(timer);
    
    if (reason) {
      captureViolationImage(reason);
    }
    
    Swal.fire({
      title: 'Test Failed',
      text: message,
      icon: 'error',
      confirmButtonText: 'Close',
      allowOutsideClick: false,
    }).then(() => {
      handleCloseTest();
    });
  };

  const handleCloseTest = () => {
    if (timer) clearInterval(timer);
    
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    setShowTest(false);
    setTestData(null);
    setTimeLeft(0);
    setSelectedAnswers({});
    setTestResult(null);
    setTimer(null);
    setCurrentQuestionIndex(0);
    setExitAttempted(false);
    setIsFullscreen(false);
  };

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
          answers.push({
            questionIndex: qIndex,
            selectedAnswers: userAnswers,
            isCorrect: false, 
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

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && showTest && !exitAttempted) {
      setExitAttempted(true);
      handleTestFailure("FAILED: You switched tabs or minimized the window! Test terminated.", "Chuyển tab hoặc thu nhỏ cửa sổ");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData?.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

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
  const getUserId = () => {
    try {
      if (userData && userData._id) {
        return userData._id;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  
  const checkViolationStatus = async () => {
    try {
      if (!courseId) return;
      const userId = getUserId();
      
      if (!userId) {
        return;
      }
      setStudentId(userId);
      const token = await getToken();
      if (!token) {
        return;
      }
      const response = await axios.get(
        `${backendUrl}/api/violation/count?studentId=${userId}&courseId=${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const { count, isBlocked: blocked } = response.data;
        const isBlockedBoolean = blocked === true || blocked === "true";
        globalIsBlocked = isBlockedBoolean;
        setViolationCount(count);
        setIsBlocked(isBlockedBoolean);
        setTimeout(() => {
          console.log(`Current isBlocked state after update: ${isBlocked} (global: ${globalIsBlocked})`);
        }, 100);
      }
    } catch (error) {
      console.error('Error checking violation status:', error);
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized error, checking CourseProgress for violation data');
        
        try {
          if (progressData && progressData.violations) {
            const { count, isBlocked: blocked } = progressData.violations;
            console.log(`Found violations in CourseProgress: count=${count}, isBlocked=${blocked}`);
            
            const isBlockedBoolean = blocked === true || blocked === "true";
            globalIsBlocked = isBlockedBoolean;
            setViolationCount(count || 0);
            setIsBlocked(isBlockedBoolean);
            
            console.log(`Set isBlocked from CourseProgress: ${isBlockedBoolean} (global: ${globalIsBlocked})`);
          }
        } catch (progressError) {
          console.error('Error checking CourseProgress for violations:', progressError);
        }
      }
    }
  };

  useEffect(() => {
    if (courseId && studentId) {
      checkViolationStatus();
      const intervalId = setInterval(checkViolationStatus, 10000); 
      
      return () => clearInterval(intervalId);
    }
  }, [courseId, studentId]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
  }, []);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timer]);

  const initializeAIMonitoring = useCallback(async () => {
    try {
      await loadScripts([
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.20.0/dist/tf.min.js',
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd'
      ]);

      if (window.FaceMesh) {
        faceMeshRef.current = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshRef.current.onResults((results) => {
          if (!canvasRef.current) return;
          
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          if (results.multiFaceLandmarks.length > 0) {
            lastFaceTimeRef.current = Date.now();
            setIsFaceDetected(true);
            
            clearViolation("face_not_detected");

            const landmarks = results.multiFaceLandmarks[0];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const noseTip = landmarks[1];

            const dx = rightEye.x - leftEye.x;
            const dy = rightEye.y - leftEye.y;
            const yaw = Math.atan2(dy, dx) * (180 / Math.PI);

            const pitch = (noseTip.y - leftEye.y) * 100;

            if (Math.abs(yaw) > 25 || pitch > 15 || pitch < -15) {
              setIsLookingAway(true);
              captureViolationImage("Don't look at the screen", "looking_away");
              if (showTest && !exitAttempted && (Math.abs(yaw) > 40 || pitch > 25 || pitch < -25)) {
                setExitAttempted(true);
                handleTestFailure("FAILED: You are not looking at the screen! Test terminated.", "Not looking at the screen", "looking_away");
              }
            } else {
              setIsLookingAway(false);
              clearViolation("looking_away");
            }
          } else {
            if (Date.now() - lastFaceTimeRef.current > 1000) {
              setIsFaceDetected(false);
              captureViolationImage("No face detected", "face_not_detected");
              
              if (showTest && !exitAttempted && Date.now() - lastFaceTimeRef.current > 3000) {
                setExitAttempted(true);
                handleTestFailure("FAILED: No face detected! Test terminated.", "No face detected", "face_not_detected");
              }
            }
          }
        });
      }

      if (window.cocoSsd) {
        cocoModelRef.current = await window.cocoSsd.load();
      }

      if (window.Camera && videoRef.current) {
        cameraRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }

            if (cocoModelRef.current && videoRef.current && canvasRef.current) {
              const predictions = await cocoModelRef.current.detect(videoRef.current);
              const ctx = canvasRef.current.getContext('2d');
              
              const phoneDetections = predictions.filter(pred => 
                pred.class === "cell phone" && pred.score > 0.4
              );
              
              if (phoneDetections.length > 0) {
                phoneDetections.forEach(pred => {
                  ctx.strokeStyle = "red";
                  ctx.lineWidth = 3;
                  ctx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);
                  ctx.font = "16px Arial";
                  ctx.fillStyle = "red";
                  ctx.fillText("PHONE DETECTED!", pred.bbox[0], pred.bbox[1] - 8);
                });
                
                setIsPhoneDetected(true);
                
                captureViolationImage("Detect phone usage", "phone_detected");
                
                if (showTest && !exitAttempted) {
                  setExitAttempted(true);
                  handleTestFailure("FAILED: Cell phone detected! Test terminated immediately.", "Phone usage detected", "phone_detected");
                }
              } else {
                if (isPhoneDetected) {
                  setIsPhoneDetected(false);
                  clearViolation("phone_detected");
                }
              }
            }
          },
          width: 320,
          height: 240
        });
        
        cameraRef.current.start();
      }
    } catch (error) {
      toast.error("Failed to initialize camera monitoring. Please ensure camera access is allowed.");
    }
  }, [showTest, exitAttempted]);

  const loadScripts = async (urls) => {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    try {
      for (const url of urls) {
        await loadScript(url);
      }
    } catch (error) {
      console.error("Error loading scripts:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (showTest && !exitAttempted) {
      initializeAIMonitoring();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [showTest, exitAttempted, initializeAIMonitoring]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showTest && !exitAttempted) {
        e.preventDefault();
        setExitAttempted(true);
        handleTestFailure("FAILED: You pressed the ESC key! Test terminated.");
      }
    };
    
    if (showTest) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTest, exitAttempted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && showTest) {
        captureViolationImage("Switch tabs or minimize windows", "tab_switch");
        
        if (!exitAttempted) {
          setExitAttempted(true);
          handleTestFailure(
            "FAILED: You switched tabs or minimized the window! Test terminated.", 
            "Chuyển tab hoặc thu nhỏ cửa sổ", 
            "tab_switch"
          );
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showTest, exitAttempted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement || 
                                  document.webkitFullscreenElement || 
                                  document.msFullscreenElement;
      
      setIsFullscreen(!!isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && showTest) {
        captureViolationImage("Exit full screen mode", "fullscreen_exit");
        
        if (!exitAttempted) {
          setExitAttempted(true);
          handleTestFailure("FAILED: You exited full screen mode! Test terminated.", "Exited full screen mode", "fullscreen_exit");
        }
      }
    };
    
    if (showTest) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [showTest, exitAttempted]);

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
                                      className="h-3.5 w-3.5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
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
                                  (isBlocked === true || globalIsBlocked === true) ? (
                                    <button
                                      className="text-xs font-medium text-white bg-gray-500 cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                                      disabled
                                    >
                                      Blocked ({violationCount} violations)
                                    </button>
                                  ) : (
                                    <button
                                      className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded transition-colors"
                                      onClick={async () => {
                                        try {
                                          toast.info('Checking violation status...');
                                          const token = await getToken();
                                          const userId = getUserId();
                                          
                                          if (!userId || !courseId) {
                                            toast.error('Missing user ID or course ID');
                                            return;
                                          }
                                          
                                          try {
                                            const response = await axios.get(
                                              `${backendUrl}/api/violation/count?studentId=${userId}&courseId=${courseId}`,
                                              { headers: { Authorization: `Bearer ${token}` } }
                                            );
                                            
                                            if (response.data.success) {
                                              const { count, isBlocked: blocked } = response.data;
                                              
                                              if (blocked === true || blocked === "true") {
                                                toast.error(`You are blocked from taking tests due to ${count} violation(s)`);
                                                return;
                                              }
                                            }
                                          } catch (apiError) {
                                            
                                            if (progressData && progressData.violations && progressData.violations.isBlocked) {
                                              toast.error(`You are blocked from taking tests due to ${progressData.violations.count || 'multiple'} violation(s)`);
                                              return;
                                            }
                                          }
                                          
                                          handleTest(test);
                                        } catch (error) {
                                          toast.error('An error occurred while checking violation status');
                                        }
                                      }}
                                    >
                                      {savedTest ? 'Retry Test' : 'Start Test'}
                                    </button>
                                  )
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

      {showViolationImage && violationImage && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border-2 border-red-500 overflow-hidden w-64">
          <div className="bg-red-500 text-white p-2 flex justify-between items-center">
            <h3 className="text-sm font-bold">Violation photo</h3>
            <button 
              onClick={() => setShowViolationImage(false)}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-2">
            <img 
              src={violationImage} 
              alt="Violation Evidence" 
              className="w-full h-auto border border-gray-300 rounded"
            />
            <p className="mt-2 text-xs text-red-600">{violationReason}</p>
          </div>
        </div>
      )}
      
      {showTest && testData && (
        <TestManager
          testData={testData}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          timer={timer}
          setTimer={setTimer}
          selectedAnswers={selectedAnswers}
          setSelectedAnswers={setSelectedAnswers}
          testResult={testResult}
          setTestResult={setTestResult}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          exitAttempted={exitAttempted}
          setExitAttempted={setExitAttempted}
          handleNextQuestion={handleNextQuestion}
          handlePreviousQuestion={handlePreviousQuestion}
          handleSubmitTest={handleSubmitTest}
          handleTestFailure={handleTestFailure}
          testContainerRef={testContainerRef}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isFaceDetected={isFaceDetected}
          handleCloseTest={handleCloseTest}
          handleAnswerSelect={handleAnswerSelect}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};

export default Player;
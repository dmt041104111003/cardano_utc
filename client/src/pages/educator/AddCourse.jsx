/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import * as XLSX from 'xlsx';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useWallet } from '@meshsdk/react';

// Component cho Popup
const Popup = ({ title, onClose, children }) => (
  <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
    <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
      <h2 className='text-lg font-semibold mb-4'>{title}</h2>
      {children}
      <img src={assets.cross_icon} alt="" onClick={onClose} className='absolute top-4 right-4 w-4 cursor-pointer' />
    </div>
  </div>
);

// Component cho Question
const Question = ({ question, index, onDelete }) => (
  <div className='bg-gray-50 p-4 mb-2 rounded'>
    <div className='flex justify-between items-center'>
      <span className='font-medium'>Question {index + 1} ({question.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'})</span>
      <div>
        <button onClick={() => onDelete(index)} className='text-red-500'>Delete</button>
      </div>
    </div>
    <p className='mt-2'>{question.questionText}</p>
    {question.type === 'multiple_choice' ? (
      <div className='ml-4 mt-2'>
        {question.options.map((option, i) => (
          <div 
            key={i}
            className={question.correctAnswers.includes(i) ? 'text-green-600' : ''}
          >
            {String.fromCharCode(65 + i)}. {option}
          </div>
        ))}
        <p className='mt-2 text-sm text-gray-600'>
          Correct Answers: {question.correctAnswers.map(index => String.fromCharCode(65 + index)).join(', ')}
        </p>
        {question.note && (
          <p className='mt-1 text-sm text-gray-600 italic'>
            Note: <span className='text-red-500'>{question.note}</span>
          </p>
        )}
      </div>
    ) : (
      <div className='ml-4 mt-2 text-gray-600'>
        <p>Sample Answer: {question.essayAnswer}</p>
      </div>
    )}
  </div>
);

// Component cho Test
const Test = ({ test, onDelete, testNumber }) => {
  const [testSettings, setTestSettings] = useState({
    duration: test.duration,
    passingScore: test.passingScore
  });

  useEffect(() => {
    // Cập nhật testSettings khi test thay đổi
    setTestSettings({
      duration: test.duration,
      passingScore: test.passingScore
    });
  }, [test.duration, test.passingScore]);

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    type: 'multiple_choice',
    options: ['', ''], 
    correctAnswers: [], 
    essayAnswer: '',
    note: ''
  });

  const [autoAddNote, setAutoAddNote] = useState(true);

  const handleAddQuestion = () => {
    const questionToAdd = {
      ...currentQuestion,
      ...(currentQuestion.type === 'multiple_choice' 
        ? { essayAnswer: undefined } 
        : { options: undefined, correctAnswers: undefined }
      )
    };

    const updatedTest = {
      ...test,
      questions: [...test.questions, questionToAdd]
    };
    onDelete(test.testId, undefined, updatedTest);
    setCurrentQuestion({
      questionText: '',
      type: 'multiple_choice',
      options: ['', ''], 
      correctAnswers: [],
      essayAnswer: '',
      note: ''
    });
  };

  const handleCorrectAnswerChange = (index, isChecked) => {
    setCurrentQuestion(prev => {
      const newCorrectAnswers = isChecked 
        ? [...prev.correctAnswers, index]
        : prev.correctAnswers.filter(i => i !== index);
      
      return {
        ...prev,
        correctAnswers: newCorrectAnswers,
        // Xóa note nếu chỉ còn 1 đáp án đúng
        note: newCorrectAnswers.length <= 1 ? '' : (
          autoAddNote 
            ? 'This question requires selecting multiple correct answers'
            : prev.note
        )
      };
    });
  };

  const handleAddOption = () => {
    if (currentQuestion.options.length < 10) { 
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    if (currentQuestion.options.length > 2) { 
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, index) => index !== indexToRemove),
        correctAnswers: prev.correctAnswers
          .filter(index => index !== indexToRemove) 
          .map(index => index > indexToRemove ? index - 1 : index) 
      }));
    }
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...test.questions];
    newQuestions.splice(index, 1);
    const updatedTest = {
      ...test,
      questions: newQuestions
    };
    onDelete(test.testId, undefined, updatedTest);
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow mb-4'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h3 className='font-semibold'>
            {test.chapterNumber === 0 ? `Final Test ${testNumber}` : `Chapter ${test.chapterNumber} Test ${testNumber}`}
          </h3>
          <p className='text-gray-600'>
            Duration: {testSettings.duration} minutes - Passing Score: {testSettings.passingScore}%
          </p>
        </div>
        <button 
          onClick={() => onDelete(test.testId)}
          className='text-red-500'
        >
          <img src={assets.cross_icon} alt="" className='w-4 h-4' />
        </button>
      </div>

      <div className='space-y-4'>
        {test.questions.map((question, index) => (
          <Question 
            key={index} 
            question={question} 
            index={index} 
            onDelete={() => handleDeleteQuestion(index)} 
          />
        ))}

        <div className='bg-gray-50 p-4 rounded'>
          <div className='space-y-4'>
            <div>
              <label className='block mb-1'>Question Type</label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ 
                  ...currentQuestion, 
                  type: e.target.value,
                  options: e.target.value === 'multiple_choice' ? ['', ''] : undefined,
                  correctAnswers: [],
                  essayAnswer: ''
                })}
                className='w-full border rounded p-2'
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            <div>
              <label className='block mb-1'>Question</label>
              <input
                type='text'
                value={currentQuestion.questionText}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                className='w-full border rounded p-2'
                placeholder='Enter question'
              />
            </div>

            {currentQuestion.type === 'multiple_choice' ? (
              <>
                <div>
                  <label className='block mb-1'>Options</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className='flex items-center mb-2'>
                      <span className='mr-2'>{String.fromCharCode(65 + index)}.</span>
                      <input
                        type='text'
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className='flex-1 border rounded p-2'
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      <input
                        type='checkbox'
                        checked={currentQuestion.correctAnswers.includes(index)}
                        onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                        className='ml-2 w-5 h-5'
                        disabled={!option}
                      />
                      {currentQuestion.options.length > 2 && (
                        <button 
                          onClick={() => handleRemoveOption(index)}
                          className='ml-2 text-red-500 hover:text-red-700'
                        >
                          <img src={assets.cross_icon} alt="" className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  ))}
                  {currentQuestion.options.length < 10 && (
                    <button
                      type='button'
                      onClick={handleAddOption}
                      className='mt-2 text-blue-500 hover:text-blue-700'
                    >
                      + Add Option {String.fromCharCode(65 + currentQuestion.options.length)}
                    </button>
                  )}
                  <p className='text-sm text-gray-600 mt-1'>Check the boxes next to correct answers</p>
                  
                  {/* Checkbox để bật/tắt tự động thêm note - chỉ enable khi có nhiều đáp án đúng */}
                  <div className='flex items-center mt-2'>
                    <input
                      type='checkbox'
                      checked={autoAddNote}
                      onChange={(e) => {
                        setAutoAddNote(e.target.checked);
                        if (!e.target.checked) {
                          setCurrentQuestion(prev => ({
                            ...prev,
                            note: ''
                          }));
                        } else if (currentQuestion.correctAnswers.length > 1) {
                          setCurrentQuestion(prev => ({
                            ...prev,
                            note: 'This question requires selecting multiple correct answers'
                          }));
                        }
                      }}
                      className='mr-2'
                      disabled={currentQuestion.correctAnswers.length <= 1}
                    />
                    <label className={`text-sm ${currentQuestion.correctAnswers.length <= 1 ? 'text-gray-400' : 'text-gray-600'}`}>
                      Auto add note for multiple correct answers
                    </label>
                  </div>

                  {/* Input để nhập/sửa note - chỉ enable khi có nhiều đáp án đúng */}
                  <div className='mt-2'>
                    <label className={`block mb-1 text-sm ${currentQuestion.correctAnswers.length <= 1 ? 'text-gray-400' : 'text-gray-600'}`}>
                      Note (optional)
                    </label>
                    <input
                      type='text'
                      value={currentQuestion.note}
                      onChange={(e) => setCurrentQuestion(prev => ({
                        ...prev,
                        note: e.target.value
                      }))}
                      className={`w-full border rounded p-2 ${currentQuestion.correctAnswers.length <= 1 ? 'bg-gray-100' : 'text-red-500'}`}
                      placeholder='Add a note for this question'
                      disabled={currentQuestion.correctAnswers.length <= 1}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className='block mb-1'>Sample Answer</label>
                <textarea
                  value={currentQuestion.essayAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, essayAnswer: e.target.value })}
                  className='w-full border rounded p-2'
                  rows={4}
                  placeholder='Enter a sample answer'
                />
              </div>
            )}

            <button
              type='button'
              onClick={handleAddQuestion}
              disabled={
                !currentQuestion.questionText || 
                (currentQuestion.type === 'multiple_choice' && 
                  (!currentQuestion.options.some(opt => opt) || !currentQuestion.correctAnswers.length)
                ) ||
                (currentQuestion.type === 'essay' && !currentQuestion.essayAnswer)
              }
              className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400'
            >
              + Add Question
            </button>
          </div>
        </div>
      </div>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <label className='block mb-1'>Duration (minutes)</label>
          <input
            type='number'
            value={testSettings.duration}
            onChange={(e) => {
              const newDuration = parseInt(e.target.value);
              setTestSettings(prev => ({ ...prev, duration: newDuration }));
              onDelete(test.testId, undefined, { ...test, duration: newDuration });
            }}
            className='w-full border rounded p-2'
            min={1}
          />
        </div>
        <div>
          <label className='block mb-1'>Passing Score (%)</label>
          <input
            type='number'
            value={testSettings.passingScore}
            onChange={(e) => {
              const newScore = parseInt(e.target.value);
              if (newScore > 100) {
                toast.error('Vui lòng chọn bé hơn 100%');
                return;
              }
              setTestSettings(prev => ({ ...prev, passingScore: newScore }));
              onDelete(test.testId, undefined, { ...test, passingScore: newScore });
            }}
            className='w-full border rounded p-2'
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
};

// Component cho Chapter
const Chapter = ({ chapter, index, handleChapter, handleLecture }) => (
  <div className='bg-white border rounded-lg mb-4'>
    <div className='flex justify-between items-center p-4 border-b'>
      <div className='flex items-center'>
        <img onClick={() => handleChapter('toggle', chapter.chapterId)}
          className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
          src={assets.dropdown_icon} alt="dropdown icon" width={14} />
        <span className='font-semibold'>
          {index + 1}. {chapter.chapterTitle}
        </span>
      </div>
      <span>{chapter.chapterContent.length} Lectures</span>
      <img onClick={() => handleChapter('remove', chapter.chapterId)}
        src={assets.cross_icon} alt="" className='cursor-pointer' />
    </div>
    {!chapter.collapsed && (
      <div className='p-4'>
        {chapter.chapterContent.map((lecture, lectureIndex) => (
          <div className='flex justify-between items-center mb-2' key={lectureIndex}>
            <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">Link</a> - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
            <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} />
          </div>
        ))}
        <div className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2' onClick={() => handleLecture('add', chapter.chapterId)}>
          + Add Lecture
        </div>
      </div>
    )}
  </div>
);

const AddCourse = () => {

  const { backendUrl, getToken, userData, fetchUserData } = useContext(AppContext)
  const { connected, wallet } = useWallet();

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountEndTime, setDiscountEndTime] = useState('');
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [tests, setTests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [currentTest, setCurrentTest] = useState({
    testId: '',
    chapterNumber: 0,
    duration: '',
    passingScore: ''
  });
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(userData?.cooldownMs || 0);
  const [canCreate, setCanCreate] = useState(userData?.canCreateCourse);

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      setShowChapterPopup(true);
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const handleAddTest = () => {
    if (!currentTest.duration) {
      toast.error('Please enter test duration');
      return;
    }
    if (currentTest.passingScore === undefined ) {
      toast.error('Please enter passing score');
      return;
    }
    if (parseInt(currentTest.passingScore) > 100) {
      toast.error('Passing score cannot exceed 100%');
      return;
    }

    const newTest = {
      testId: uniqid(),
      chapterNumber: currentTest.chapterNumber,
      duration: parseInt(currentTest.duration),
      passingScore: parseInt(currentTest.passingScore),
      questions: []
    };
    setTests([...tests, newTest]);
    
    // Reset form
    setCurrentTest({
      chapterNumber: 0,
      duration: '',
      passingScore: ''
    });
  };

  const handleDeleteTest = (testId, questionIndex, updatedTest) => {
    if (updatedTest) {
      // Update test
      setTests(tests.map(t => t.testId === testId ? updatedTest : t));
    } else {
      // Delete test
      setTests(tests.filter(t => t.testId !== testId));
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0
              ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
              : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate || !userData?.canCreateCourse) {
      // Do not show a hardcoded error, let the backend error message be shown if the request fails
      return;
    }

    if (!courseTitle) {
      toast.error('Vui lòng nhập course title ít nhất 5 ký tự');
      return;
    }

    // Validate chapters
    if (chapters.length === 0) {
      toast.error('Please create at least 1 chapter');
      return;
    }

    // Validate lectures in each chapter
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].chapterContent.length === 0) {
        toast.error(`Chapter ${i + 1} need at least 1 lecture`);
        return;
      }
    }

    // Validate tests
    for (let test of tests) {
      if (!test.passingScore || test.passingScore < 0 || test.passingScore > 100) {
        toast.error(`Test ${test.chapterNumber === 0 ? 'Final' : 'Chapter ' + test.chapterNumber} need passing score from 0-100%`);
        return;
      }
      if (!test.duration || test.duration <= 0) {
        toast.error(`Test ${test.chapterNumber === 0 ? 'Final' : 'Chapter ' + test.chapterNumber} need longer duration 0`);
        return;
      }
    }

    // Validate wallet or PayPal email
    if (!connected && !paypalEmail) {
      toast.error('You must connect your wallet or enter your PayPal email!');
      return;
    }

    try {
      if (courseTitle.trim().length < 5) {
        toast.error('Please enter course title at least 5 characters');
        return;
      }
      if (!image) {
        toast.error('Thumbnail Not Selected');
        return;
      }
      if (discount > 0 && !discountEndTime) {
        toast.error('Please select discount end time');
        return;
      }

      const token = await getToken();
      const courseId = uniqid();

      // Nếu đã connect ví thì sẽ mint, bất kể có PayPal email hay không
      if (connected && wallet) {
        // --- MINT + LƯU CSDL ---
        // Get wallet data
        const addresses = await wallet.getUsedAddresses();
        if (!addresses || addresses.length === 0) {
          toast.error('No wallet addresses found');
          return;
        }
        const address = addresses[0];

        const utxos = await wallet.getUtxos();
        if (!utxos || utxos.length === 0) {
          toast.error('No UTXOs found in wallet. Please add some ADA to your wallet.');
          return;
        }

        const collateral = await wallet.getCollateral();
        if (!collateral || collateral.length === 0) {
          toast.error('No collateral found in wallet. Please add collateral.');
          return;
        }

        // Create course data for blockchain
        const courseData = {
          courseId,
          courseTitle,
          courseDescription: quillRef.current.root.innerHTML,
          coursePrice: Number(coursePrice || 0),
          discount: Number(discount || 0),
          discountEndTime: discount > 0 ? discountEndTime : null,
          courseContent: chapters,
          tests: tests,
          creatorId: address,
          createdAt: new Date().toISOString(),
          paypalEmail,
          paymentMethods: {
            ada: true, // Luôn true khi có wallet
            stripe: !!paypalEmail,
            paypal: !!paypalEmail
          }
        };

        // Get unsigned transaction
        const { data: txData } = await axios.post(
          `${backendUrl}/api/blockchain/create-course-tx`,
          {
            courseData,
            utxos,
            collateral,
            address
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'wallet-address': address
            } 
          }
        );

        if (!txData || !txData.success) {
          toast.error(txData?.message || 'Failed to create transaction');
          return;
        }

        // Sign transaction with wallet
        const signedTx = await wallet.signTx(txData.unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        if (!txHash) {
          toast.error('Failed to submit transaction');
          return;
        }

        // Create form data for database
        const formData = new FormData();
        formData.append('courseData', JSON.stringify({
          ...courseData,
          creatorAddress: address,
          txHash,
          paypalEmail
        }));
        formData.append('image', image);

        try {
          const { data } = await axios.post(
            `${backendUrl}/api/educator/add-course`,
            formData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'wallet-address': address
              } 
            }
          );

          if (data.success) {
            toast.success('Course created and minted successfully!');
            setCourseTitle('');
            setCoursePrice(0);
            setDiscount(0);
            setImage(null);
            setChapters([]);
            quillRef.current.root.innerHTML = "";
            if (fetchUserData) await fetchUserData();
          } else {
            toast.error(data.message);
          }
        } catch (dbError) {
          toast.error(dbError.response?.data?.message || dbError.message);
        }
        return;
      }

      // --- CHỈ LƯU CSDL (KHÔNG MINT) ---
      if (!connected && paypalEmail) {
        const courseData = {
          courseId,
          courseTitle,
          courseDescription: quillRef.current.root.innerHTML,
          coursePrice: Number(coursePrice || 0),
          discount: Number(discount || 0),
          discountEndTime: discount > 0 ? discountEndTime : null,
          courseContent: chapters,
          tests: tests,
          creatorId: paypalEmail,
          createdAt: new Date().toISOString(),
          paypalEmail,
          paymentMethods: {
            ada: false,
            stripe: true,
            paypal: true
          }
        };
        const formData = new FormData();
        formData.append('courseData', JSON.stringify(courseData));
        formData.append('image', image);
        const { data } = await axios.post(
          `${backendUrl}/api/educator/add-course`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success('Course created successfully (no mint)!');
          setCourseTitle('');
          setCoursePrice(0);
          setDiscount(0);
          setImage(null);
          setChapters([]);
          quillRef.current.root.innerHTML = "";
          if (fetchUserData) await fetchUserData();
        } else {
          toast.error(data.message);
        }
        return;
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getUsedAddresses().then(addresses => {
        if (addresses && addresses.length > 0) {
          setWalletAddress(addresses[0]);
        }
      });
    } else {
      setWalletAddress('');
    }
  }, [connected, wallet]);

  useEffect(() => {
    setCooldownLeft(userData?.cooldownMs || 0);
    setCanCreate(userData?.canCreateCourse);
  }, [userData]);

  useEffect(() => {
    let interval;
    if (cooldownLeft > 0) {
      interval = setInterval(() => {
        setCooldownLeft(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            setCanCreate(true); // Khi hết cooldown, cho phép tạo course ngay
            if (typeof fetchUserData === 'function') fetchUserData(); // vẫn sync với server nếu muốn
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownLeft, fetchUserData]);

  const preventMinus = (e) => {
    if (e.key === '-') {
      e.preventDefault();
    }
  };
  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          />
          {!connected && (
            <p className="text-red-500 text-xs italic mt-1">
              Please connect your wallet to create a course
            </p>
          )}
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input 
            onChange={e => setCourseTitle(e.target.value)}
            value={courseTitle} 
            type="text" 
            placeholder='Enter course title' 
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
            required 
            onInvalid={e => e.target.setCustomValidity('Please enter a course title')}
            onInput={e => e.target.setCustomValidity('')}
          />
          {courseTitle === '' && <p className="text-red-500 text-xs mt-1">Course title is required</p>}
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>
        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price (ADA)</p>
            <input 
              onKeyDown={preventMinus}
              onChange={e => setCoursePrice(e.target.value)} 
              value={coursePrice} 
              type="number" 
              min="0"
              step="0.01"
              placeholder='0' 
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              onInvalid={e => e.target.setCustomValidity('Please enter a valid price (0 or greater)')}
              onInput={e => e.target.setCustomValidity('')}
            />
            {coursePrice < 0 && <p className="text-red-500 text-xs mt-1">Price cannot be negative</p>}
          </div>
          <div className='flex flex-col gap-1'>
            <p>Discount (%)</p>
            <input 
              onKeyDown={preventMinus}
              onChange={e => setDiscount(e.target.value)} 
              value={discount} 
              type="number" 
              min="0"
              max="100"
              placeholder='0' 
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              onInvalid={e => e.target.setCustomValidity('Please enter a valid discount (0-100%)')}
              onInput={e => e.target.setCustomValidity('')}
            />
            {discount < 0 && <p className="text-red-500 text-xs mt-1">Discount cannot be negative</p>}
            {discount > 100 && <p className="text-red-500 text-xs mt-1">Discount cannot exceed 100%</p>}
          </div>
          {discount > 0 && (
            <div className='flex flex-col gap-1'>
              <p>Discount End Time</p>
              <input 
                onChange={e => setDiscountEndTime(e.target.value)}
                value={discountEndTime}
                type="datetime-local"
                className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
                required
                onInvalid={e => e.target.setCustomValidity('Please select when the discount ends')}
                onInput={e => e.target.setCustomValidity('')}
              />
              {!discountEndTime && discount > 0 && <p className="text-red-500 text-xs mt-1">Required when discount is applied</p>}
            </div>
          )}
          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
              <input 
                type="file" 
                id='thumbnailImage' 
                onChange={e => setImage(e.target.files[0])} 
                accept="image/*" 
                hidden 
                required
              />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : null} alt="" />
            </label>
            {!image && <p className="text-red-500 text-xs">Course thumbnail is required</p>}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <span>PayPal Email</span>
            <span className="text-sm font-normal text-gray-500">(optional if wallet is connected)</span>
          </label>
          <div className="relative">
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              value={paypalEmail}
              onChange={e => {
                setPaypalEmail(e.target.value);
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (e.target.value && !emailRegex.test(e.target.value)) {
                  e.target.setCustomValidity('Please enter a valid email address');
                } else {
                  e.target.setCustomValidity('');
                }
              }}
              onBlur={e => {
                if (!connected && !e.target.value) {
                  e.target.classList.add('border-red-500');
                } else {
                  e.target.classList.remove('border-red-500');
                }
              }}
              placeholder="example@paypal.com"
              required={!connected}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {connected 
              ? "Optional: Add PayPal email to also receive payments via PayPal" 
              : "Required: Enter PayPal email to receive payments"}
          </p>
        </div>
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <Chapter key={chapterIndex} chapter={chapter} index={chapterIndex} handleChapter={handleChapter} handleLecture={handleLecture} />
          ))}
          <div className='flex justify-center items-center bg-blue-100 mb-5 p-2 rounded-lg cursor-pointer' onClick={() => handleChapter('add')}>
            + Add Chapter
          </div>
          {tests.map((test) => {
            // Tính số thứ tự cho test cùng loại
            const sameTypeTests = tests.filter(t => t.chapterNumber === test.chapterNumber);
            const testNumber = sameTypeTests.findIndex(t => t.testId === test.testId) + 1;
            
            return (
              <Test 
                key={test.testId} 
                test={test} 
                onDelete={handleDeleteTest}
                testNumber={testNumber}
              />
            );
          })}
          <div className='bg-white p-4 rounded-lg shadow mb-4'>
            <div className='space-y-4'>
              <div>
                <label className='block mb-1'>Test Type</label>
                <select
                  value={currentTest.chapterNumber}
                  onChange={(e) => setCurrentTest({ ...currentTest, chapterNumber: parseInt(e.target.value) })}
                  className='w-full border rounded p-2'
                >
                  <option value={0}>Final Test</option>
                  {chapters.map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Chapter {index + 1} Test
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block mb-1'>Duration (minutes)</label>
                <input
                onKeyDown={preventMinus}
                  type='number'
                  value={currentTest.duration}
                  onChange={(e) => setCurrentTest({ ...currentTest, duration: e.target.value })}
                  className='w-full border rounded p-2'
                  min={1}
                />
              </div>

              <div>
                <label className='block mb-1'>Passing Score (%)</label>
                <input
                onKeyDown={preventMinus}
                  type='number'
                  value={currentTest.passingScore}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 100) {
                      toast.error('Passing score cannot exceed 100%');
                      return;
                    }
                    setCurrentTest({ ...currentTest, passingScore: value || 0 });
                  }}
                  className='w-full border rounded p-2'
                  placeholder='0'
                  max="100"
                />
              </div>

              <button 
                type='button'
                onClick={handleAddTest}
                className='w-full bg-red-100 p-2 rounded-lg hover:bg-red-200'
              >
                + Add Test
              </button>
            </div>
          </div>
        </div>

        {showPopup && (
          <Popup title="Add Lecture" onClose={() => setShowPopup(false)}>
            <div className="mb-2">
              <p>Lecture Title</p>
              <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} />
            </div>

            <div className="mb-2">
              <p>Lecture URL</p>
              <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureUrl} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>Is Preview Free?</p>
              <input type="checkbox" className="mt-1 scale-125" checked={lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })} />
            </div>
            <button onClick={addLecture} type='button' className='w-full bg-blue-400 text-white px-4 py-2 rounded'>Add</button>
          </Popup>
        )}
        {showChapterPopup && (
          <Popup title="Add Chapter" onClose={() => setShowChapterPopup(false)}>
            <div className="mb-2">
              <p>Chapter Title</p>
              <input 
                type="text" 
                className="mt-1 block w-full border rounded py-1 px-2" 
                value={newChapterTitle} 
                onChange={(e) => setNewChapterTitle(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => {
                if (!newChapterTitle.trim()) {
                  toast.error('Vui lòng nhập tên chapter');
                  return;
                }
                const newChapter = {
                  chapterId: uniqid(),
                  chapterTitle: newChapterTitle,
                  chapterContent: [],
                  collapsed: false,
                  chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
                };
                setChapters([...chapters, newChapter]);
                setNewChapterTitle('');
                setShowChapterPopup(false);
              }} 
              type='button' 
              className='w-full bg-blue-400 text-white px-4 py-2 rounded'
            >
              Add Chapter
            </button>
          </Popup>
        )}
        <button
          type='submit'
          className={`bg-black text-white w-max py-2.5 px-8 rounded my-4 ${!canCreate || !userData?.canCreateCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canCreate || !userData?.canCreateCourse}
        >ADD</button>
        {!canCreate && cooldownLeft > 0 && (
          <div className="mt-2 text-yellow-700 text-sm font-semibold">
            Wait {Math.floor(cooldownLeft / 60000)}:{((cooldownLeft % 60000) / 1000).toFixed(0).padStart(2, '0')} to create a new course
          </div>
        )}
      </form>
    </div>
  );
};

export default AddCourse;

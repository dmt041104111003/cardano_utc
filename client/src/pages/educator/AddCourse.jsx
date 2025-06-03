import React, { useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { toast } from "react-toastify";
import axios from "axios";
import { useWallet } from "@meshsdk/react";
import { AppContext } from "../../context/AppContext";

const Popup = ({ title, onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
      <button onClick={onClose} className="absolute top-4 right-4 w-4 cursor-pointer">
        <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

const Question = ({ question, index, onDelete }) => (
  <div className="bg-gray-50 p-4 mb-2 rounded">
    <div className="flex justify-between items-center">
      <span className="font-medium">Question {index + 1} ({question.type === "multiple_choice" ? "Multiple Choice" : "Essay"})</span>
      <button onClick={() => onDelete(index)} className="text-red-500 hover:text-red-700">Delete</button>
    </div>
    <p className="mt-2">{question.questionText}</p>
    {question.type === "multiple_choice" ? (
      <div className="ml-4 mt-2">
        {question.options.map((option, i) => (
          <div key={i} className={question.correctAnswers.includes(i) ? "text-green-600" : ""}>{String.fromCharCode(65 + i)}. {option}</div>
        ))}
        <p className="mt-2 text-sm text-gray-600">Correct Answers: {question.correctAnswers.map((idx) => String.fromCharCode(65 + idx)).join(", ")}</p>
        {question.note && <p className="mt-1 text-sm text-gray-600 italic">Note: <span className="text-red-500">{question.note}</span></p>}
      </div>
    ) : (
      <div className="ml-4 mt-2 text-gray-600"><p>Sample Answer: {question.essayAnswer}</p></div>
    )}
  </div>
);

const Test = ({ test, onDelete, testNumber }) => {
  const [testSettings, setTestSettings] = useState({ duration: test.duration, passingScore: test.passingScore });
  const [currentQuestion, setCurrentQuestion] = useState({ questionText: "", type: "multiple_choice", options: ["", ""], correctAnswers: [], essayAnswer: "", note: "" });
  const [autoAddNote, setAutoAddNote] = useState(true);

  useEffect(() => setTestSettings({ duration: test.duration, passingScore: test.passingScore }), [test.duration, test.passingScore]);

  const handleAddQuestion = () => {
    const questionToAdd = { ...currentQuestion, ...(currentQuestion.type === "multiple_choice" ? { essayAnswer: undefined } : { options: undefined, correctAnswers: undefined }) };
    onDelete(test.testId, undefined, { ...test, questions: [...test.questions, questionToAdd] });
    setCurrentQuestion({ questionText: "", type: "multiple_choice", options: ["", ""], correctAnswers: [], essayAnswer: "", note: "" });
  };

  const handleCorrectAnswerChange = (index, isChecked) => {
    setCurrentQuestion((prev) => {
      const newCorrectAnswers = isChecked ? [...prev.correctAnswers, index] : prev.correctAnswers.filter((i) => i !== index);
      return { ...prev, correctAnswers: newCorrectAnswers, note: newCorrectAnswers.length <= 1 ? "" : autoAddNote ? "This question requires selecting multiple correct answers" : prev.note };
    });
  };

  const handleAddOption = () => currentQuestion.options.length < 10 && setCurrentQuestion((prev) => ({ ...prev, options: [...prev.options, ""] }));

  const handleRemoveOption = (indexToRemove) => {
    if (currentQuestion.options.length > 2) setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove),
      correctAnswers: prev.correctAnswers.filter((index) => index !== indexToRemove).map((index) => (index > indexToRemove ? index - 1 : index)),
    }));
  };

  const handleDeleteQuestion = (index) => onDelete(test.testId, undefined, { ...test, questions: test.questions.filter((_, i) => i !== index) });

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">{test.chapterNumber === 0 ? `Final Test ${testNumber}` : `Chapter ${test.chapterNumber} Test ${testNumber}`}</h3>
          <p className="text-gray-600">Duration: {testSettings.duration} minutes - Passing Score: {testSettings.passingScore}%</p>
        </div>
        <button onClick={() => onDelete(test.testId)} className="text-red-500 hover:text-red-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        {test.questions.map((question, index) => <Question key={index} question={question} index={index} onDelete={() => handleDeleteQuestion(index)} />)}
        <div className="bg-gray-50 p-4 rounded">
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Question Type</label>
              <select value={currentQuestion.type} onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value, options: e.target.value === "multiple_choice" ? ["", ""] : undefined, correctAnswers: [], essayAnswer: "" })} className="w-full border rounded p-2">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="essay">Essay</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Question</label>
              <input type="text" value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} className="w-full border rounded p-2" placeholder="Enter question" />
            </div>
            {currentQuestion.type === "multiple_choice" ? (
              <>
                <div>
                  <label className="block mb-1">Options</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                      <input type="text" value={option} onChange={(e) => { const newOptions = [...currentQuestion.options]; newOptions[index] = e.target.value; setCurrentQuestion({ ...currentQuestion, options: newOptions }); }} className="flex-1 border rounded p-2" placeholder={`Option ${String.fromCharCode(65 + index)}`} />
                      <input type="checkbox" checked={currentQuestion.correctAnswers.includes(index)} onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)} className="ml-2 w-5 h-5" disabled={!option} />
                      {currentQuestion.options.length > 2 && <button onClick={() => handleRemoveOption(index)} className="ml-2 text-red-500 hover:text-red-700"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                    </div>
                  ))}
                  {currentQuestion.options.length < 10 && <button type="button" onClick={handleAddOption} className="mt-2 text-blue-500 hover:text-blue-700">+ Add Option {String.fromCharCode(65 + currentQuestion.options.length)}</button>}
                  <p className="text-sm text-gray-600 mt-1">Check the boxes next to correct answers</p>
                  <div className="flex items-center mt-2">
                    <input type="checkbox" checked={autoAddNote} onChange={(e) => { setAutoAddNote(e.target.checked); setCurrentQuestion((prev) => ({ ...prev, note: e.target.checked && currentQuestion.correctAnswers.length > 1 ? "This question requires selecting multiple correct answers" : "" })); }} className="mr-2" disabled={currentQuestion.correctAnswers.length <= 1} />
                    <label className={`text-sm ${currentQuestion.correctAnswers.length <= 1 ? "text-gray-400" : "text-gray-600"}`}>Auto add note for multiple correct answers</label>
                  </div>
                  <div className="mt-2">
                    <label className={`block mb-1 text-sm ${currentQuestion.correctAnswers.length <= 1 ? "text-gray-400" : "text-gray-600"}`}>Note (optional)</label>
                    <input type="text" value={currentQuestion.note} onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, note: e.target.value }))} className={`w-full border rounded p-2 ${currentQuestion.correctAnswers.length <= 1 ? "bg-gray-100" : "text-red-500"}`} placeholder="Add a note for this question" disabled={currentQuestion.correctAnswers.length <= 1} />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block mb-1">Sample Answer</label>
                <textarea value={currentQuestion.essayAnswer} onChange={(e) => setCurrentQuestion({ ...currentQuestion, essayAnswer: e.target.value })} className="w-full border rounded p-2" rows={4} placeholder="Enter a sample answer" />
              </div>
            )}
            <button type="button" onClick={handleAddQuestion} disabled={!currentQuestion.questionText || (currentQuestion.type === "multiple_choice" && (!currentQuestion.options.some((opt) => opt) || !currentQuestion.correctAnswers.length)) || (currentQuestion.type === "essay" && !currentQuestion.essayAnswer)} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400">+ Add Question</button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex-1">
          <label className="block mb-1">Duration (minutes)</label>
          <input type="number" value={testSettings.duration} onChange={(e) => { const newDuration = parseInt(e.target.value); setTestSettings((prev) => ({ ...prev, duration: newDuration })); onDelete(test.testId, undefined, { ...test, duration: newDuration }); }} className="w-full border rounded p-2" min={1} />
        </div>
        <div className="flex-1">
          <label className="block mb-1">Passing Score (%)</label>
          <input type="number" value={testSettings.passingScore} onChange={(e) => { const newScore = parseInt(e.target.value); if (newScore > 100) { toast.error("Passing score cannot exceed 100%"); return; } setTestSettings((prev) => ({ ...prev, passingScore: newScore })); onDelete(test.testId, undefined, { ...test, passingScore: newScore }); }} className="w-full border rounded p-2" min={0} max={100} />
        </div>
      </div>
    </div>
  );
};

const Chapter = ({ chapter, index, handleChapter, handleLecture }) => (
  <div className="bg-white border rounded-lg mb-4">
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center">
        <button onClick={() => handleChapter("toggle", chapter.chapterId)} className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <span className="font-semibold">{index + 1}. {chapter.chapterTitle}</span>
      </div>
      <span>{chapter.chapterContent.length} Lectures</span>
      <button onClick={() => handleChapter("remove", chapter.chapterId)} className="text-red-500 hover:text-red-700">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    {!chapter.collapsed && (
      <div className="p-4">
        {chapter.chapterContent.map((lecture, lectureIndex) => (
          <div className="flex justify-between items-center mb-2" key={lectureIndex}>
            <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - <a href={lecture.lectureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">Link</a> - {lecture.isPreviewFree ? "Free Preview" : "Paid"}</span>
            <button onClick={() => handleLecture("remove", chapter.chapterId, lectureIndex)} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <div className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2" onClick={() => handleLecture("add", chapter.chapterId)}>+ Add Lecture</div>
      </div>
    )}
  </div>
);

const AddCourse = () => {
  const { backendUrl, getToken, userData, fetchUserData } = useContext(AppContext);
  const { connected, wallet } = useWallet();
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountEndTime, setDiscountEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [tests, setTests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [currentTest, setCurrentTest] = useState({ testId: "", chapterNumber: 0, duration: "", passingScore: "" });
  const [lectureDetails, setLectureDetails] = useState({ lectureTitle: "", lectureDuration: "", lectureUrl: "", isPreviewFree: false });
  const [walletAddress, setWalletAddress] = useState("");
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(userData?.cooldownMs || 0);
  const [canCreate, setCanCreate] = useState(userData?.canCreateCourse);

  const handleChapter = (action, chapterId) => {
    if (action === "add") setShowChapterPopup(true);
    else if (action === "remove") setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    else if (action === "toggle") setChapters(chapters.map((chapter) => chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter));
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") { setCurrentChapterId(chapterId); setShowPopup(true); }
    else if (action === "remove") setChapters(chapters.map((chapter) => chapter.chapterId === chapterId ? { ...chapter, chapterContent: chapter.chapterContent.filter((_, idx) => idx !== lectureIndex) } : chapter));
  };

  const handleAddTest = () => {
    const duration = parseInt(currentTest.duration);
    const passingScore = parseInt(currentTest.passingScore);
    if (!duration) return toast.error("Please enter test duration");
    if (passingScore === undefined) return toast.error("Please enter passing score");
    if (passingScore > 100) return toast.error("Passing score cannot exceed 100%");
    setTests([...tests, { testId: uniqid(), chapterNumber: currentTest.chapterNumber, duration, passingScore, questions: [] }]);
    setCurrentTest({ chapterNumber: 0, duration: "", passingScore: "" });
  };

  const handleDeleteTest = (testId, questionIndex, updatedTest) => updatedTest ? setTests(tests.map((t) => t.testId === testId ? updatedTest : t)) : setTests(tests.filter((t) => t.testId !== testId));

  const addLecture = () => {
    const videoId = lectureDetails.lectureUrl.trim();
    const formattedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    setChapters(chapters.map((chapter) => chapter.chapterId === currentChapterId ? { ...chapter, chapterContent: [...chapter.chapterContent, { ...lectureDetails, lectureUrl: formattedUrl, lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1, lectureId: uniqid() }] } : chapter));
    setShowPopup(false);
    setLectureDetails({ lectureTitle: "", lectureDuration: "", lectureUrl: "", isPreviewFree: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate || !userData?.canCreateCourse) return;
    if (courseTitle.trim().length < 5) return toast.error("Course title must be at least 5 characters");
    if (chapters.length === 0) return toast.error("Please create at least 1 chapter");
    if (chapters.some((chapter) => chapter.chapterContent.length === 0)) return toast.error("Each chapter must have at least 1 lecture");
    if (!image) return toast.error("Thumbnail not selected");
    if (discount > 0 && !discountEndTime) return toast.error("Please select discount end time");
    if (!connected && !paypalEmail) return toast.error("You must connect your wallet or enter your PayPal email");
    for (let test of tests) {
      if (!test.passingScore || test.passingScore < 0 || test.passingScore > 100) return toast.error(`Test ${test.chapterNumber === 0 ? "Final" : "Chapter " + test.chapterNumber} needs passing score from 0-100%`);
      if (!test.duration || test.duration <= 0) return toast.error(`Test ${test.chapterNumber === 0 ? "Final" : "Chapter " + test.chapterNumber} needs duration greater than 0`);
    }
    try {
      const token = await getToken();
      const courseId = uniqid();
      const courseData = { courseId, courseTitle, courseDescription: quillRef.current.root.innerHTML, coursePrice: Number(coursePrice || 0), discount: Number(discount || 0), discountEndTime: discount > 0 ? discountEndTime : null, courseContent: chapters, tests, createdAt: new Date().toISOString(), paypalEmail };
      if (connected && wallet) {
        const addresses = await wallet.getUsedAddresses();
        if (!addresses?.length) return toast.error("No wallet addresses found");
        const address = addresses[0];
        const utxos = await wallet.getUtxos();
        if (!utxos?.length) return toast.error("No UTXOs found in wallet. Please add some ADA to your wallet");
        const collateral = await wallet.getCollateral();
        if (!collateral?.length) return toast.error("No collateral found in wallet. Please add collateral");
        const { data: txData } = await axios.post(`${backendUrl}/api/blockchain/create-course-tx`, { courseData: { ...courseData, creatorId: address }, utxos, collateral, address }, { headers: { Authorization: `Bearer ${token}`, "wallet-address": address } });
        if (!txData?.success) return toast.error(txData?.message || "Failed to create transaction");
        const signedTx = await wallet.signTx(txData.unsignedTx);
        const txHash = await wallet.submitTx(signedTx);
        if (!txHash) return toast.error("Failed to submit transaction");
        const formData = new FormData();
        formData.append("courseData", JSON.stringify({ ...courseData, creatorAddress: address, txHash }));
        formData.append("image", image);
        const { data } = await axios.post(`${backendUrl}/api/educator/add-course`, formData, { headers: { Authorization: `Bearer ${token}`, "wallet-address": address } });
        if (data.success) { toast.success("Course created and minted successfully!"); resetForm(); if (fetchUserData) await fetchUserData(); } else toast.error(data.message);
      } else if (!connected && paypalEmail) {
        const formData = new FormData();
        formData.append("courseData", JSON.stringify({ ...courseData, creatorId: paypalEmail }));
        formData.append("image", image);
        const { data } = await axios.post(`${backendUrl}/api/educator/add-course`, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) { toast.success("Course created successfully (no mint)!"); resetForm(); if (fetchUserData) await fetchUserData(); } else toast.error(data.message);
      }
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  };

  const resetForm = () => {
    setCourseTitle("");
    setCoursePrice("");
    setDiscount("");
    setDiscountEndTime("");
    setImage(null);
    setChapters([]);
    setTests([]);
    quillRef.current.root.innerHTML = "";
  };

  useEffect(() => { if (!quillRef.current && editorRef.current) quillRef.current = new Quill(editorRef.current, { theme: "snow" }); }, []);
  useEffect(() => { if (connected && wallet) wallet.getUsedAddresses().then((addresses) => { if (addresses?.length) setWalletAddress(addresses[0]); }); else setWalletAddress(""); }, [connected, wallet]);
  useEffect(() => { setCooldownLeft(userData?.cooldownMs || 0); setCanCreate(userData?.canCreateCourse); }, [userData]);
  useEffect(() => {
    let interval;
    if (cooldownLeft > 0) {
      interval = setInterval(() => {
        setCooldownLeft((prev) => {
          if (prev <= 1000) { clearInterval(interval); setCanCreate(true); if (fetchUserData) fetchUserData(); return 0; }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownLeft, fetchUserData]);

  const preventMinus = (e) => { if (e.key === "-") e.preventDefault(); };

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Course</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
            Course Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
              <input type="text" value={walletAddress} readOnly className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" />
              {!connected && <p className="text-red-500 text-xs mt-1">Please connect your wallet to create a course</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Course Title</label>
              <input onChange={(e) => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder="Enter course title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" required />
              {courseTitle === "" && <p className="text-red-500 text-xs mt-1">Course title is required</p>}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden"><div ref={editorRef}></div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Course Price (ADA)</label>
              <input onKeyDown={preventMinus} onChange={(e) => setCoursePrice(e.target.value)} value={coursePrice} type="number" min="0" step="0.01" placeholder="0" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" />
              {coursePrice < 0 && <p className="text-red-500 text-xs mt-1">Price cannot be negative</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input onKeyDown={preventMinus} onChange={(e) => setDiscount(e.target.value)} value={discount} type="number" min="0" max="100" placeholder="0" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" />
              {discount < 0 && <p className="text-red-500 text-xs mt-1">Discount cannot be negative</p>}
              {discount > 100 && <p className="text-red-500 text-xs mt-1">Discount cannot exceed 100%</p>}
            </div>
          </div>
          {discount > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount End Time</label>
              <input onChange={(e) => setDiscountEndTime(e.target.value)} value={discountEndTime} type="datetime-local" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" required />
              {!discountEndTime && discount > 0 && <p className="text-red-500 text-xs mt-1">Required when discount is applied</p>}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <label htmlFor="thumbnailImage" className="cursor-pointer">
                  <input type="file" id="thumbnailImage" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="sr-only" required />
                  <div className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-md transition-all shadow-sm hover:shadow-md">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Choose Image
                  </div>
                </label>
              </div>
              <div className="h-20 w-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {image ? <img className="h-full w-full object-cover" src={URL.createObjectURL(image)} alt="Thumbnail" /> : (
                  <div className="text-center p-2">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-1 text-xs text-gray-500">Preview</p>
                  </div>
                )}
              </div>
            </div>
            {!image && <p className="text-red-500 text-xs mt-2 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Course thumbnail is required</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2"><span>PayPal Email</span><span className="text-sm font-normal text-gray-500">(optional if wallet is connected)</span></label>
            <div className="relative">
              <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={paypalEmail} onChange={(e) => { setPaypalEmail(e.target.value); const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (e.target.value && !emailRegex.test(e.target.value)) e.target.setCustomValidity("Please enter a valid email address"); else e.target.setCustomValidity(""); }} onBlur={(e) => { if (!connected && !e.target.value) e.target.classList.add("border-red-500"); else e.target.classList.remove("border-red-500"); }} placeholder="example@paypal.com" required={!connected} />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{connected ? "Optional: Add PayPal email to also receive payments via PayPal" : "Required: Enter PayPal email to receive payments"}</p>
          </div>
          <div>
            {chapters.map((chapter, chapterIndex) => <Chapter key={chapterIndex} chapter={chapter} index={chapterIndex} handleChapter={handleChapter} handleLecture={handleLecture} />)}
            <div className="flex justify-center items-center bg-blue-100 mb-5 p-2 rounded-lg cursor-pointer" onClick={() => handleChapter("add")}>+ Add Chapter</div>
            {tests.map((test) => { const sameTypeTests = tests.filter((t) => t.chapterNumber === test.chapterNumber); const testNumber = sameTypeTests.findIndex((t) => t.testId === test.testId) + 1; return <Test key={test.testId} test={test} onDelete={handleDeleteTest} testNumber={testNumber} />; })}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Test Type</label>
                  <select value={currentTest.chapterNumber} onChange={(e) => setCurrentTest({ ...currentTest, chapterNumber: parseInt(e.target.value) })} className="w-full border rounded p-2">
                    <option value={0}>Final Test</option>
                    {chapters.map((_, index) => <option key={index + 1} value={index + 1}>Chapter {index + 1} Test</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Duration (minutes)</label>
                  <input onKeyDown={preventMinus} type="number" value={currentTest.duration} onChange={(e) => setCurrentTest({ ...currentTest, duration: e.target.value })} className="w-full border rounded p-2" min={1} />
                </div>
                <div>
                  <label className="block mb-1">Passing Score (%)</label>
                  <input onKeyDown={preventMinus} type="number" value={currentTest.passingScore} onChange={(e) => { const value = parseInt(e.target.value); if (value > 100) { toast.error("Passing score cannot exceed 100%"); return; } setCurrentTest({ ...currentTest, passingScore: value || 0 }); }} className="w-full border rounded p-2" placeholder="0" max="100" />
                </div>
                <button type="button" onClick={handleAddTest} className="w-full bg-red-100 p-2 rounded-lg hover:bg-red-200">+ Add Test</button>
              </div>
            </div>
          </div>
          <button type="submit" className={`inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm ${!canCreate || !userData?.canCreateCourse ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!canCreate || !userData?.canCreateCourse}>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ADD COURSE
          </button>
          {!canCreate && cooldownLeft > 0 && (
            <div className="mt-2 text-yellow-700 text-sm font-semibold bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <svg className="w-5 h-5 inline-block mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              Wait {Math.floor(cooldownLeft / 60000)}:{((cooldownLeft % 60000) / 1000).toFixed(0).padStart(2, "0")} to create a new course
            </div>
          )}
        </form>
      </div>
      {showPopup && (
        <Popup title="Add Lecture" onClose={() => setShowPopup(false)}>
          <div className="mb-2">
            <p>Lecture Title</p>
            <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} />
          </div>
          <div className="mb-2">
            <p>YouTube Video URL</p>
            <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureUrl} onChange={(e) => { let videoId = e.target.value.trim(); if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) { const watchMatch = videoId.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/); if (watchMatch?.[1]) videoId = watchMatch[1]; const shortMatch = videoId.match(/(?:youtu\.be\/)([\w-]+)/); if (shortMatch?.[1]) videoId = shortMatch[1]; const embedMatch = videoId.match(/(?:youtube\.com\/embed\/)([\w-]+)/); if (embedMatch?.[1]) videoId = embedMatch[1]; } setLectureDetails({ ...lectureDetails, lectureUrl: videoId }); }} placeholder="YouTube Video URL" />
          </div>
          <div className="mb-2">
            <p>Is Preview Free?</p>
            <input type="checkbox" className="mt-1 scale-125" checked={lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })} />
          </div>
          <button onClick={addLecture} type="button" className="w-full bg-blue-400 text-white px-4 py-2 rounded">Add</button>
        </Popup>
      )}
      {showChapterPopup && (
        <Popup title="Add Chapter" onClose={() => setShowChapterPopup(false)}>
          <div className="mb-2">
            <p>Chapter Title</p>
            <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} />
          </div>
          <button onClick={() => { if (!newChapterTitle.trim()) return toast.error("Please enter chapter title"); setChapters([...chapters, { chapterId: uniqid(), chapterTitle: newChapterTitle, chapterContent: [], collapsed: false, chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1 }]); setNewChapterTitle(""); setShowChapterPopup(false); }} type="button" className="w-full bg-blue-400 text-white px-4 py-2 rounded">Add Chapter</button>
        </Popup>
      )}
    </div>
  );
};

export default AddCourse;
// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import { AppContext } from "../../context/AppContext";
// import Timer from "../../components/student/Timer";
// import QuestionList from "../../components/student/QuestionList";
// import QuestionDetail from "../../components/student/QuestionDetail";
// import Swal from "sweetalert2";




// const TestPage = () => {
//     const { courseId, testId } = useParams();
//     const { allCourses } = useContext(AppContext);

//     const [test, setTest] = useState(null);
//     const [answers, setAnswers] = useState({});
//     const [submitted, setSubmitted] = useState(false);
//     const [score, setScore] = useState(0);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [timeUp, setTimeUp] = useState(false);
//     const [warningCount, setWarningCount] = useState(0);
//     const firstLoad = useRef(true);

//     const handleNext = () => {
//         if (currentQuestion < test.questions.length - 1) {
//             setCurrentQuestion(prev => prev + 1);
//         }
//     };
    
//     const handlePrev = () => {
//         if (currentQuestion > 0) {
//             setCurrentQuestion(prev => prev - 1);
//         }
//     };
    

//     // Tìm bài kiểm tra từ danh sách khóa học bằng useMemo để tối ưu
//     const foundTest = useMemo(() => {
//         if (allCourses.length === 0) return null;
//         const course = allCourses.find(c => c._id === courseId);
//         return course?.tests.find(t => t.testId === testId) || null;
//     }, [allCourses, courseId, testId]);

//     useEffect(() => {
//         setTest(foundTest);
//     }, [foundTest]);

//     // Lắng nghe sự kiện rời khỏi màn hình
//     useEffect(() => {
//         const handleVisibilityChange = () => {
//             if (document.hidden && !firstLoad.current && test) {
//                 triggerWarning();
//             }
//         };

//         window.addEventListener("visibilitychange", handleVisibilityChange);

//         const timer = setTimeout(() => {
//             firstLoad.current = false;
//         }, 1500);

//         return () => {
//             clearTimeout(timer);
//             window.removeEventListener("visibilitychange", handleVisibilityChange);
//         };
//     }, [test]);

//     // Hàm tính điểm, được tối ưu với useCallback
//     const calculateScore = useCallback((currentAnswers = answers) => {
//         if (!test?.questions) return 0;
//         return test.questions.reduce((score, question, index) => {
//             return (currentAnswers[index] || "") === question.answer ? score + 1 : score;
//         }, 0);
//     }, [test, answers]);
    

//     // Xử lý khi nộp bài
//     const handleSubmit = () => {
//         if (submitted || timeUp || !test?.questions) return;
    
//         // Kiểm tra số lượng câu trả lời
//         const answeredCount = Object.keys(answers).length;
//         const totalQuestions = test.questions.length;
    
//         if (answeredCount < totalQuestions) {
//             Swal.fire({
//                 title: "Chưa hoàn thành!",
//                 text: `Bạn mới trả lời ${answeredCount}/${totalQuestions} câu. Hãy hoàn thành tất cả câu hỏi trước khi nộp.`,
//                 icon: "warning",
//                 confirmButtonText: "OK",
//             });
//             return;
//         }
    
//         // Xác nhận nộp bài
//         Swal.fire({
//             title: "Bạn có chắc muốn nộp bài?",
//             text: "Bạn sẽ không thể thay đổi câu trả lời sau khi nộp!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Có, nộp bài!",
//             cancelButtonText: "Hủy"
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 const finalScore = calculateScore();
//                 setScore(finalScore);
//                 setSubmitted(true);
    
//                 Swal.fire({
//                     title: "Đã nộp bài!",
//                     text: `Bạn đã hoàn thành bài kiểm tra. Điểm số của bạn: ${finalScore} / ${totalQuestions}`,
//                     icon: "success"
//                 });
//             }
//         });
//     };
    

//     // Cảnh báo khi rời khỏi trang
//     const triggerWarning = () => {
//         if (submitted || timeUp || warningCount >= 3 || !test || !test.questions) return;
    
//         setWarningCount(prevCount => {
//             const newCount = prevCount + 1;
    
//             Swal.fire({
//                 title: newCount >= 3 ? "Bạn đã vi phạm quá nhiều lần!" : "Cảnh báo!",
//                 text: newCount >= 3 
//                     ? "Bài kiểm tra của bạn sẽ bị tự động nộp." 
//                     : `Bạn vừa rời khỏi trang làm bài! (${newCount}/3 cảnh báo)`,
//                 icon: newCount >= 3 ? "error" : "warning",
//                 confirmButtonText: "Tôi hiểu"
//             });
    
//             if (newCount >= 3) {
//                 setAnswers(prevAnswers => {
//                     const finalScore = calculateScore(prevAnswers);  
//                     setScore(finalScore);
//                     setSubmitted(true);
//                     setTimeUp(true);
    
//                     Swal.fire({
//                         title: "Vi phạm!",
//                         text: `Bài kiểm tra đã tự động nộp. Điểm của bạn: ${finalScore} / ${test.questions.length}`,
//                         icon: "info"
//                     });
    
//                     return prevAnswers; 
//                 });
//             }
//             return newCount;
//         });
//     };
    
    

//     if (!test) return <p className="text-red-500 text-center mt-10">Test không tồn tại hoặc đang tải...</p>;

//     // Xử lý chọn đáp án
//     const handleSelect = (questionIndex, option) => {
//         setAnswers(prev => ({
//             ...prev,
//             [questionIndex]: option 
//         }));
//     };

//     // Khi hết giờ
//     const handleTimeUp = () => {
//         if (!submitted) {
//             const finalScore = calculateScore();
//             setScore(finalScore);
//             setSubmitted(true);
//             setTimeUp(true);

//             Swal.fire({
//                 title: "Hết giờ!",
//                 text: `Bài kiểm tra đã tự động nộp. Điểm của bạn: ${finalScore} / ${test.questions.length}`,
//                 icon: "info"
//             });
//         }
//     };

//     return (
//         <div className="w-full mx-auto p-6 bg-white">
//             <div className="flex items-center">
//                 {submitted && (
//                     <div className="text-lg font-bold text-gray-800">
//                         Điểm của bạn: {score} / {test.questions.length}
//                     </div>
//                 )}

//                 <button
//                     className="ml-auto bg-red-600 text-white px-4 py-2 text-base rounded hover:bg-blue-700 w-auto"
//                     onClick={handleSubmit}
//                     disabled={submitted}
//                 >
//                     {submitted ? "Đã nộp bài" : "Nộp bài"}
//                 </button>
//             </div>

//             <h1 className="text-2xl font-bold text-gray-800 mb-4">{test.title}</h1>

//             <Timer duration={test.testDuration*60} onTimeUp={handleTimeUp} submitted={submitted} />

//             <div className="grid grid-cols-4 gap-4 mt-4">
//                 <div className="col-span-1">
//                     <QuestionList
//                         questions={test.questions}
//                         currentQuestion={currentQuestion}
//                         onSelectQuestion={setCurrentQuestion}
//                         answers={answers}
//                     />
//                 </div>
//                 <div className="col-span-3">
//                 <QuestionDetail
//                     question={test.questions[currentQuestion]}
//                     questionIndex={currentQuestion}
//                     selectedAnswer={answers[currentQuestion]}
//                     onSelect={handleSelect}
//                     onNext={handleNext}
//                     onPrev={handlePrev}
//                     totalQuestions={test.questions.length}
//                 />

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TestPage;

// /* eslint-disable no-unused-vars */
// import React, { useState } from "react";

// const questions = [
//   {
//     id: 1,
//     question: "Cardano là gì?",
//     options: ["Một loại tiền điện tử", "Một hệ điều hành", "Một loại trình duyệt", "Một phần mềm chỉnh sửa ảnh"],
//     answer: "Một loại tiền điện tử"
//   },
//   {
//     id: 2,
//     question: "Ngôn ngữ lập trình smart contract của Cardano là gì?",
//     options: ["Solidity", "Haskell", "Rust", "Python"],
//     answer: "Haskell"
//   }
// ];

// const Quiz = () => {
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [score, setScore] = useState(0);

//   const handleSelectOption = (option) => {
//     setSelectedOption(option);
//   };

//   const handleSubmit = () => {
//     if (selectedOption === questions[currentQuestion].answer) {
//       setScore(score + 1);
//     }
//     setShowAnswer(true);
//   };

//   const handleNextQuestion = () => {
//     setShowAnswer(false);
//     setSelectedOption(null);
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     } else {
//       alert(`Bạn đã hoàn thành bài kiểm tra! Điểm của bạn: ${score}/${questions.length}`);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
//       <h1 className="text-xl font-bold text-gray-900 mb-4">📝 Câu hỏi {currentQuestion + 1}</h1>
//       <p className="text-lg font-semibold mb-3">{questions[currentQuestion].question}</p>

//       <div className="space-y-2">
//         {questions[currentQuestion].options.map((option, index) => (
//           <button
//             key={index}
//             className={`w-full p-2 rounded-lg border ${
//               selectedOption === option
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-100 hover:bg-gray-200"
//             }`}
//             onClick={() => handleSelectOption(option)}
//             disabled={showAnswer}
//           >
//             {option}
//           </button>
//         ))}
//       </div>

//       {showAnswer && (
//         <p className={`mt-4 text-lg font-bold ${selectedOption === questions[currentQuestion].answer ? "text-green-600" : "text-red-600"}`}>
//           {selectedOption === questions[currentQuestion].answer ? "✅ Chính xác!" : "❌ Sai rồi!"}
//         </p>
//       )}

//       <div className="mt-4 flex justify-between">
//         {!showAnswer ? (
//           <button
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//             onClick={handleSubmit}
//             disabled={!selectedOption}
//           >
//             Xác nhận
//           </button>
//         ) : (
//           <button
//             className="bg-green-500 text-white px-4 py-2 rounded-lg"
//             onClick={handleNextQuestion}
//           >
//             {currentQuestion < questions.length - 1 ? "Tiếp theo" : "Hoàn thành"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Quiz;

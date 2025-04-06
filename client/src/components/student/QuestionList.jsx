// /* eslint-disable react/prop-types */
// /* eslint-disable no-unused-vars */
// import React from "react";

// const QuestionList = ({ questions, currentQuestion, onSelectQuestion, answers }) => {
//     return (
//         <div className="p-4 border rounded-md shadow-md bg-white">
//             <h3 className="text-lg font-semibold mb-2">Danh sách câu hỏi</h3>
//             <div className="flex flex-wrap gap-2">
//                 {questions.map((_, index) => {
//                     const isAnswered = answers[index] !== undefined; 
//                     return (
//                         <button
//                             key={index}
//                             onClick={() => onSelectQuestion(index)}
//                             className={`w-10 h-10 flex items-center justify-center rounded transition duration-300 
//                                 ${currentQuestion === index ? 'bg-blue-500 text-white' : 
//                                 isAnswered ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
//                         >
//                             {index + 1}
//                         </button>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };


// export default QuestionList;

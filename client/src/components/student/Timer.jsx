// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";

// // eslint-disable-next-line react/prop-types
// const Timer = ({ duration, onTimeUp,submitted }) => {
//     const [timeLeft, setTimeLeft] = useState(duration);

//     useEffect(() => {

//         if (submitted) {
//             setTimeLeft(0); 
//             return;
//         }
//         if (timeLeft <= 0) {
//             onTimeUp();
//             return;
//         }
//         const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//         return () => clearTimeout(timer);
//     }, [timeLeft]);

//     return (
//         <div className="p-4 bg-red-100 text-red-700 font-bold rounded-md text-center">
//             {timeLeft > 0 
//                 ? `Thời gian còn lại: ${Math.floor(timeLeft / 60)} phút ${timeLeft % 60} giây` 
//                 : "Đã hết thời gian!"}
//         </div>
//     );
// };

// export default Timer;

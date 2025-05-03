// // eslint-disable-next-line no-unused-vars
// import React, { useRef, useEffect, useState } from "react";
// import { useUser } from "@clerk/clerk-react";
// import { useReactToPrint } from "react-to-print";
// import { QRCodeCanvas } from "qrcode.react";
// import certificateBackground from "../../assets/certificate.jpg";

// const CertificateDetail = () => {
//   const { user } = useUser();
//   const certificateRef = useRef();
//   const canvasRef = useRef(null);
//   const [generatedImage, setGeneratedImage] = useState(null);

//   const certificate = {
//     courseName: "Khóa học Blockchain cơ bản",
//     issuer: "Học viện Công nghệ Blockchain",
//     dateIssued: "05/03/2025",
//     blockchain: "Cardano",
//     transactionHash: "0xabc123456789def",
//   };

//   useEffect(() => {
//     const drawCanvas = async () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       const img = new Image();
//       img.src = certificateBackground;

//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0, img.width, img.height);

//         // Gradient chữ
//         const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//         gradient.addColorStop(0, "gold");
//         gradient.addColorStop(1, "orange");

//         ctx.font = "bold 50px Arial"; // Chữ to hơn
//         ctx.fillStyle = gradient;
//         ctx.textAlign = "center";

//         ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
//         ctx.shadowBlur = 5;
//         ctx.shadowOffsetX = 3;
//         ctx.shadowOffsetY = 3;

//         // Vẽ thông tin chứng chỉ
//         ctx.fillText(user?.fullName || "Người dùng", img.width / 2, img.height * 0.4);
//         ctx.fillText(`Khóa học: ${certificate.courseName}`, img.width / 2, img.height * 0.5);
//         ctx.fillText(`Ngày cấp: ${certificate.dateIssued}`, img.width / 2, img.height * 0.6);

//         setGeneratedImage(canvas.toDataURL("image/png"));
//       };
//     };

//     drawCanvas();
//   }, [user]);

//   const handlePrint = useReactToPrint({
//     content: () => certificateRef.current,
//   });

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-white mt-1 text-center">
//       <h1 className="text-4xl font-semibold mb-6">Chứng chỉ khóa học</h1>

//       <div className="flex flex-col md:flex-col lg:flex-row items-center justify-center gap-10">

      
//         <div ref={certificateRef} className="flex-1 max-w-2xl md:w-[80%] lg:w-[70%]">
//           {generatedImage ? (
//             <img src={generatedImage} alt="Generated Certificate" className="w-full rounded-lg shadow-lg" />
//           ) : (
//             <p className="text-lg">Đang tạo chứng chỉ...</p>
//           )}
//         </div>

     
//         <div className="bg-gray-100 p-8 rounded-lg shadow-lg flex flex-col items-center justify-between h-full w-full md:w-[80%] lg:w-96">
//           <QRCodeCanvas value={certificate.transactionHash} size={200} />

//           <p className="text-gray-600 mt-4 text-lg font-semibold">Quét mã QR để xác thực</p>

//           <div className="mt-4 text-gray-700 text-lg text-center">
//             <p><strong>Khóa học:</strong> {certificate.courseName}</p>
//             <p><strong>Ngày cấp:</strong> {certificate.dateIssued}</p>
//             <p><strong>Nền tảng:</strong> {certificate.blockchain}</p>
//           </div>

//           <button onClick={handlePrint} className="mt-8 px-5 py-3 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700">
//             Tải chứng chỉ PDF
//           </button>
//         </div>
//       </div>

//       <canvas ref={canvasRef} className="hidden"></canvas>
//     </div>
//   );
// };

// export default CertificateDetail;

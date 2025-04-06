
// /* eslint-disable react/prop-types */
// /* eslint-disable no-unused-vars */
// import React, { useContext } from "react";
// import { CheckCircle } from "lucide-react";
// import Swal from "sweetalert2";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { AppContext } from "../../context/AppContext";



// const NotificationItem = ({ notification }) => {
//   const { currentWallet, setCurrentWallet,backendUrl ,getToken} = useContext(AppContext);
  


//   const handleMintNFT = async (notification) => {
//     if (!currentWallet) {
//       toast.error("Vui lòng kết nối ví Cardano");
//       return;
//     }

//     try {
//       const utxos = await currentWallet.getUtxos();
//       const changeAddress = await currentWallet.getChangeAddress();
//       const collateral = await currentWallet.getCollateral();
//       const getAddress =
//         "addr_test1qq9qnzug66mn9fte8y8ycqgpfgvn6mce7an5cxaasrlp5xawyrhptr6ulqh8c477ga2sj5zs8kxzyxykgkkn9xq54jwqj3h4kd";
        
//         // const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`,
//         //                         { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } }
//         //                     )
//       const resUnsignedTx = await axios.post(
//         // "http://localhost:5000/api/certificate/createUnsignedMintTx"
//         `${backendUrl}/api/certificate/createUnsignedMintTx`,
//         {
//           userId: "user_2uUqcoMkh3OK5jya7Ruim9aBjrt",
//           courseId: "67d99981329f67f8a2c7b061",
//           mintUserId: "user_2uUqcoMkh3OK5jya7Ruim9aBjrt",
//           utxos,
//           changeAddress,
//           collateral,
//           getAddress,
//         }
//       );

//       if (!resUnsignedTx.data.success) {
//         toast.error("Mint thất bại!");
//         return;
//       }

      
//       const { unsignedTx, ipfsHash } = resUnsignedTx.data;

    
//       const signedTx = await currentWallet.signTx(unsignedTx);
//       const txHash = await currentWallet.submitTx(signedTx);
     
//       await axios.post("http://localhost:5000/api/certificate/createNewCertificate", {
//         userId: "user_2tTofTcfUwdhQobMMlOF5jxKMTc",
//         courseId: "67d5983aaa0b762cbea5a0b4",
//         mintUserId: "user_2tPDBXycuETBko4KgiOzEff3Gjq",
//         transactionHash: txHash,
//         ipfsHash,
//       });

//       toast.success("Chứng chỉ đã được mint thành công transactionhash: "+ txHash);
//     } catch (error) {
//       console.error("Lỗi khi mint NFT:", error);
//       toast.error("Lỗi khi kết nối server!");
//     }
//   };
//   const handleAccept = (notification) => {
//     Swal.fire({
//       title: "Bạn có chắc muốn duyệt chứng chỉ này?",
//       text: "Bạn sẽ không thể thay đổi sau khi duyệt",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Có, duyệt!",
//       cancelButtonText: "Hủy",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         alert("Duyệt chứng chỉ!");
//         handleMintNFT(notification);
//       }
//     });
//   };

//   return (
//     <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md">
//       <div>
//         <p className="text-lg font-semibold">{notification.course}</p>
//         <p className="text-gray-600">Người yêu cầu: {notification.requester}</p>
//         <p className="text-gray-500 text-sm">Ngày: {notification.date}</p>
//       </div>
//       <div className="flex gap-3">
//         <button
//           onClick={() => handleAccept(notification)}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex items-center gap-1"
//         >
//           <CheckCircle size={16} /> Chấp nhận
//         </button>
//       </div>
//     </li>
//   );
// };

// export default NotificationItem;

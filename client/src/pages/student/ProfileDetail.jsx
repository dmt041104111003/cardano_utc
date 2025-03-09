/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useWallet, CardanoWallet } from "@meshsdk/react";

const ProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { connected, wallet, connect,setPersist } = useWallet(); 
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  
  
 
  async function getAssets() {
    if (wallet) {
      setLoading(true);
      setError(null);
      try {
        const lovelace = await wallet.getLovelace();;
        const _assets = parseFloat(lovelace)/1000000;
        if (_assets.length === 0) {
          setError("Không có tài sản nào trong ví.");
        }
        setAssets(_assets);
      } catch (err) {
        setError("Lỗi khi tải tài sản từ ví.");
      }
      setLoading(false);
    }
  }

  const completedCredits = [
    { id: 1, subject: "Lập trình Java", credits: 3, completionDate: "01/01/2025" },
    { id: 2, subject: "Cơ sở dữ liệu", credits: 2, completionDate: "15/02/2025" },
    { id: 3, subject: "Kỹ thuật phần mềm", credits: 3, completionDate: "28/02/2025" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      {/* Thông tin cá nhân */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.imageUrl || "https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user?.fullName || "Người dùng"}</h2>
            <p className="text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || "Email không có"}
            </p>
          </div>
        </div>
        <CardanoWallet isDark={true} persist={true} onConnected={getAssets}/>
      </div>
      
      {connected && (
        <>
        <h3 className="text-xl font-semibold mb-4 mt-4 ">Tài sản trong ví</h3>
        <div className="mt-4">
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {assets && (
            <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
              <code className="language-js">{JSON.stringify(assets, null, 2)} ada</code> 
            </pre>
          ) }
        </div>
        </>
       
      )}

      {/* Danh sách khóa học đã hoàn thành */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Khóa học đã hoàn thành</h3>
        <table className="w-full border-collapse border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Khóa học</th>
              <th className="border px-4 py-2">Ngày hoàn thành</th>
              <th className="border px-4 py-2">Chứng chỉ</th>
            </tr>
          </thead>
          <tbody>
            {completedCredits.map((credit) => (
              <tr key={credit.id} className="text-center">
                <td className="border px-4 py-2">{credit.subject}</td>
                <td className="border px-4 py-2">{credit.completionDate}</td>
                <td
                  className="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/certificate-detail")}
                >
                  Xem chi tiết
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfilePage;

/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import uniqid from 'uniqid';
import { FaGraduationCap, FaBook, FaClock, FaWallet, FaEnvelope, FaUser, FaChartLine, FaSave, FaEdit, FaCoins, FaIdCard } from "react-icons/fa";

// Popup component for confirmation dialogs
const Popup = ({ title, onClose, children }) => (
  <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
    <div className='bg-white text-gray-700 p-6 rounded-lg shadow-xl relative w-full max-w-md'>
      <h2 className='text-xl font-semibold mb-4'>{title}</h2>
      {children}
      <button 
        onClick={onClose} 
        className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
      >
        &times;
      </button>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user } = useUser();
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // Profile information states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState('');
  const [cccd, setCccd] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileId, setProfileId] = useState('');

  const {
    enrolledCourses,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
    calculateCourseDuration,
    currentWallet,
    setCurrentWallet,
    connected, 
    wallet,
    fetchUserData,
  } = useContext(AppContext);
  
  const { connected: walletConnected, wallet: userWallet } = useWallet();
  const [progressArray, setProgressArray] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (connected && wallet) {
      setCurrentWallet(wallet);
    }
  }, [connected, setCurrentWallet]);
  
  // Load user profile data
  useEffect(() => {
    if (userData) {
      setBio(userData.bio || '');
      setSkills(userData.skills || []);
      setEducation(userData.education || '');
      setPaypalEmail(userData.paypalEmail || '');
      // Load other profile data if available
    }
  }, [userData]);
  
  // Get wallet address when connected
  useEffect(() => {
    if (walletConnected && userWallet) {
      userWallet.getUsedAddresses().then(addresses => {
        if (addresses && addresses.length > 0) {
          setWalletAddress(addresses[0]);
        }
      });
    } else {
      setWalletAddress('');
    }
  }, [walletConnected, userWallet]);

  useEffect(() => {
    if (currentWallet) {
      getAssets();
    }
  }, [currentWallet]);

  async function getAssets() {
    if (!currentWallet) return;
    setLoading(true);
    setError(null);
    try {
      const lovelace = await currentWallet.getLovelace();
      const _assets = parseFloat(lovelace) / 1000000;
      if (_assets === 0) setError("No assets in wallet.");
      setAssets(_assets);
    } catch (err) {
      setError("Error loading assets from wallet.");
    }
    setLoading(false);
  }

  // Fetch profile data when component loads
  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
      fetchProfileData();
    }
  }, [userData]);
  
  // State để lưu URL ảnh từ database
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  // Function to fetch profile data from database
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Get user ID from Clerk
      const userId = user?.id;
      if (!userId) {
        console.log('User ID not available yet');
        return;
      }
      
      // First try to get profile by user ID - sử dụng endpoint mới không yêu cầu xác thực
      try {
        console.log('Fetching profile for user ID:', userId);
        const { data } = await axios.get(
          `${backendUrl}/api/profile/user/${userId}`
        );
        
        if (data.success && data.profile) {
          // Update state with profile data from database
          const profile = data.profile;
          setCccd(profile.cccd || '');
          if (profile.bio) setBio(profile.bio);
          if (profile.skills && Array.isArray(profile.skills)) setSkills(profile.skills);
          if (profile.education) setEducation(profile.education);
          
          // Lấy ảnh từ database nếu có
          if (profile.imageUrl) {
            console.log('Profile image URL from database:', profile.imageUrl);
            // Lưu URL ảnh vào state để hiển thị
            setProfileImageUrl(profile.imageUrl);
          }
          
          // Log thông tin IPFS hash nếu có (dùng cho metadata NFT)
          if (profile.imageHash) {
            console.log('Profile image IPFS hash from database:', profile.imageHash);
          }
          
          // Lưu thông tin profile ID để sử dụng sau này
          if (profile._id) {
            setProfileId(profile._id);
          }
          
          console.log('Profile loaded from database:', profile);
        }
      } catch (error) {
        console.log('No profile found for current user, this is normal for new users');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Don't show error toast to avoid confusing the user if they don't have a profile yet
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: enrolledCourses.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Save profile information with NFT minting
  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      
      if (!profileImage) {
        toast.error('Profile image is required');
        setSaveLoading(false);
        return;
      }
      
      if (!cccd.trim()) {
        toast.error('Please enter your ID card number');
        setSaveLoading(false);
        return;
      }
      
      // Validate wallet or PayPal email
      if (!walletConnected && !paypalEmail) {
        toast.error('You must connect your wallet or enter your PayPal email!');
        setSaveLoading(false);
        return;
      }
      
      const token = await getToken();
      const profileId = uniqid();
      
      // Create profile data object - chỉ lưu thông tin cần thiết
      const profileData = {
        profileId,
        cccd, // Lưu số CCCD
        updatedAt: new Date().toISOString()
      };
      
      // If wallet is connected, mint NFT
      if (walletConnected && userWallet) {
        setMintLoading(true);
        
        // Get wallet data
        const addresses = await userWallet.getUsedAddresses();
        if (!addresses || addresses.length === 0) {
          toast.error('No wallet addresses found');
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        const address = addresses[0];
        
        const utxos = await userWallet.getUtxos();
        if (!utxos || utxos.length === 0) {
          toast.error('No UTXOs found in wallet. Please add some ADA to your wallet.');
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        const collateral = await userWallet.getCollateral();
        if (!collateral || collateral.length === 0) {
          toast.error('No collateral found in wallet. Please add collateral.');
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        // Chỉ lưu 3 thông tin cần thiết nhưng đảm bảo đúng cấu trúc yêu cầu của server
        const profileData2 = {
          courseId: profileId, // Yêu cầu của server
          courseTitle: user?.fullName || "Profile NFT",
          courseDescription: "CCCD: " + cccd,
          coursePrice: 0,
          discount: 0,
          creatorId: address,
          createdAt: new Date().toISOString(),
          // 3 thông tin chính cần lưu
          cccd: cccd, // Số CCCD
          walletAddress: address, // Địa chỉ ví
          isProfile: true // Đánh dấu đây là hồ sơ
          // imageUrl sẽ được thêm sau khi upload ảnh
        };
        
        // Lấy UTxO mới nhất trước khi tạo giao dịch để tránh lỗi UTxO đã được sử dụng
        const freshUtxos = await userWallet.getUtxos();
        if (!freshUtxos || freshUtxos.length === 0) {
          toast.error('No UTXOs found in wallet. Please add some ADA to your wallet.');
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        // Lấy collateral mới nhất
        const freshCollateral = await userWallet.getCollateral();
        if (!freshCollateral || freshCollateral.length === 0) {
          toast.error('No collateral found in wallet. Please add collateral.');
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        // Get unsigned transaction - sử dụng API mới với UTxO mới nhất
        const { data: txData } = await axios.post(
          `${backendUrl}/api/profile/create-profile-tx`,
          {
            profileData: profileData2,
            utxos: freshUtxos,        // Sử dụng UTxO mới nhất
            collateral: freshCollateral, // Sử dụng collateral mới nhất
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
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        // Sign transaction with wallet - thêm xử lý lỗi
        let signedTx, txHash;
        try {
          console.log('Signing transaction...');
          signedTx = await userWallet.signTx(txData.unsignedTx);
          console.log('Transaction signed successfully');
          
          console.log('Submitting transaction...');
          txHash = await userWallet.submitTx(signedTx);
          console.log('Transaction submitted successfully:', txHash);
          
          if (!txHash) {
            toast.error('Failed to submit transaction');
            setSaveLoading(false);
            setMintLoading(false);
            return;
          }
        } catch (walletError) {
          console.error('Wallet error:', walletError);
          toast.error(`Blockchain transaction failed: ${walletError.message || 'Unknown error'}`);
          setSaveLoading(false);
          setMintLoading(false);
          return;
        }
        
        console.log('Transaction data from server:', JSON.stringify(txData, null, 2));
        
        const transactionHash = txHash;
        console.log('Transaction hash:', transactionHash);
        
        const assetName = typeof txData.assetName === 'string' ? txData.assetName : '';
        
        const formData = new FormData();
        formData.append('profileData', JSON.stringify({
          cccd: cccd, // ID Card number
          walletAddress: address, // Wallet address
          profileId: profileId, // Profile ID
          txHash: txHash, // Blockchain transaction hash
          assetName: assetName // Asset name from transaction
        }));
        formData.append('profileImage', profileImage);
        
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/profile/create-profile-nft`,
            formData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'wallet-address': address
              } 
            }
          );
          
          if (data.success) {
            toast.success('Profile updated and NFT minted successfully!');
            
            setIsEditing(false);
            setShowSavePopup(false);
            if (fetchUserData) await fetchUserData();
          } else {
            toast.error(data.message);
          }
        } catch (dbError) {
          toast.error(dbError.response?.data?.message || dbError.message);
        }
      } else if (!walletConnected && paypalEmail) {
        // Just save profile without minting - using same format as AddCourse
        const profileAsCourseFallback = {
          courseId: profileId,
          courseTitle: user?.fullName || "User Profile",
          courseDescription: bio,
          coursePrice: 0,
          discount: 0,
          discountEndTime: null,
          courseContent: [{
            chapterId: uniqid(),
            chapterTitle: "Skills",
            chapterOrder: 1, // Thêm chapterOrder để khắc phục lỗi xác thực
            chapterContent: skills.map((skill, index) => ({
              lectureId: uniqid(),
              lectureTitle: skill,
              lectureDuration: "0",
              isPreviewFree: true,
              lectureOrder: index + 1 // Thêm lectureOrder cho mỗi kỹ năng
            }))
          }],
          tests: [],
          creatorId: paypalEmail,
          createdAt: new Date().toISOString(),
          paypalEmail,
          paymentMethods: {
            ada: false,
            stripe: true,
            paypal: true
          },
          isProfile: true,
          education: education
        };
        
        const formData = new FormData();
        formData.append('courseData', JSON.stringify(profileAsCourseFallback));
        formData.append('image', profileImage);
        
        // Sử dụng API mới
        const { data } = await axios.post(
          `${backendUrl}/api/profile/update-profile`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.success) {
          toast.success('Profile updated successfully (no NFT minted)!');
          setIsEditing(false);
          setShowSavePopup(false);
          if (fetchUserData) await fetchUserData();
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error in profile update:', error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaveLoading(false);
      setMintLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-1.5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden relative">
            {/* Card Light Effects */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    {/* Ưu tiên sử dụng ảnh từ Clerk */}
                    <img
                      src={user?.imageUrl || profileImageUrl || "https://via.placeholder.com/100"}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.fullName || "User"}</h2>
                  <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start mb-2">
                    <FaEnvelope className="text-indigo-500" />
                    {user?.primaryEmailAddress?.emailAddress || "Email not available"}
                  </p>
                  {assets !== null && (
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 justify-center md:justify-start">
                      <FaWallet className="text-indigo-500" />
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-bold">
                        {assets} ADA
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                  >
                    {isEditing ? 'Cancel Editing' : 'Edit Identity'}
                    <FaEdit />
                  </button>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <CardanoWallet isDark={false} persist={true} onConnected={getAssets} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Edit Section */}
          {isEditing && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden relative p-6">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit Identity Information</h2>
              </div>
              
              <div className="space-y-6 relative z-10">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl || user?.imageUrl || "https://via.placeholder.com/100"} 
                      alt="Profile Preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
                    />
                    <div>
                      <button 
                        onClick={() => fileInputRef.current.click()} 
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
                      >
                        Choose Image
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: Square image, 500x500px or larger</p>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                {/* CCCD Field */}
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FaIdCard className="mr-2" /> ID Card Number
                  </label>
                  <input
                    type="text"
                    value={cccd}
                    onChange={(e) => setCccd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your ID card number"
                  />
                  <p className="text-xs text-gray-500 mt-1">This identity information will be stored in the NFT metadata</p>
                </div>
                
                <div>
                  <p className="text-gray-700 mb-4">Your identity certificate will be created with essential information: profile image, wallet address and ID card number.</p>
                </div>
                
                {/* Wallet Connection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Connection</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      {walletConnected 
                        ? `Connected: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` 
                        : 'Connect your wallet to mint an NFT of your profile'}
                    </p>
                    <div className="flex justify-center">
                      <CardanoWallet isDark={false} persist={true} />
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowSavePopup(true)} 
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                    disabled={saveLoading || mintLoading}
                  >
                    {saveLoading || mintLoading ? 'Processing...' : 'Save & Mint Identity Certificate'}
                    {!saveLoading && !mintLoading && <FaCoins />}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Save Confirmation Popup */}
          {showSavePopup && (
            <Popup title="Save Identity & Mint NFT" onClose={() => setShowSavePopup(false)}>
              <div className="mb-6">
                <p className="mb-4">
                  {walletConnected 
                    ? 'You are about to update your identity information and mint an NFT certificate on the Cardano blockchain. This will require a small transaction fee.' 
                    : 'You are about to update your identity information. No NFT certificate will be minted without a connected wallet.'}
                </p>
                {walletConnected && (
                  <div className="bg-indigo-50 p-3 rounded-md text-indigo-700 text-sm mb-4">
                    <p className="font-medium">Your wallet is connected and ready for minting!</p>
                    <p className="mt-1">Address: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</p>
                  </div>
                )}
                {!walletConnected && paypalEmail && (
                  <div className="bg-yellow-50 p-3 rounded-md text-yellow-700 text-sm mb-4">
                    <p>Using PayPal email: {paypalEmail}</p>
                    <p className="mt-1">Connect a wallet if you want to mint an NFT.</p>
                  </div>
                )}
                {!walletConnected && !paypalEmail && (
                  <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm mb-4">
                    <p>You need to either connect a wallet or provide a PayPal email.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowSavePopup(false)} 
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                  disabled={saveLoading || mintLoading || (!walletConnected && !paypalEmail)}
                >
                  {saveLoading || mintLoading ? 'Processing...' : (walletConnected ? 'Save & Mint Identity Certificate' : 'Save Identity')}
                  {!saveLoading && !mintLoading && (walletConnected ? <FaCoins /> : <FaSave />)}
                </button>
              </div>
            </Popup>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Courses Completed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-400/10 to-blue-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Courses Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.filter(progress => progress.lectureCompleted === progress.totalLectures).length}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">out of {enrolledCourses.length} enrolled</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-md">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            {/* Total Lectures */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-indigo-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Lectures Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">out of {progressArray.reduce((total, progress) => total + progress.totalLectures, 0)} total</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-md">
                  <FaBook className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-pink-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Overall Progress</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.length > 0 ? 
                      Math.round((progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0) / 
                      progressArray.reduce((total, progress) => total + progress.totalLectures, 0)) * 100) : 0}%
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">across all courses</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-md">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" 
                    style={{ width: `${progressArray.length > 0 ? 
                      Math.round((progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0) / 
                      progressArray.reduce((total, progress) => total + progress.totalLectures, 0)) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Courses Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <FaBook className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Courses Being Studied
                </h3>
              </div>
              
              {enrolledCourses.length > 0 ? (
                <div className="pb-4">
                  <Slider {...sliderSettings}>
                    {enrolledCourses.map((course, index) => (
                      <div key={course._id} className="p-3">
                        <div className="bg-white rounded-xl shadow-md border border-indigo-100/50 p-6 h-full hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-indigo-300/70 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-indigo-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <h4 className="font-bold text-gray-800 mb-3 line-clamp-2">{course.courseTitle}</h4>
                          
                          {progressArray[index] && (
                            <div className="mt-4">
                              <div className="flex justify-between mb-1 text-sm">
                                <span className="text-gray-600 font-medium">Progress</span>
                                <span className="text-indigo-600 font-medium">
                                  {Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                  style={{ width: `${Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <FaBook className="text-gray-400" />
                                {progressArray[index].lectureCompleted}/{progressArray[index].totalLectures} lectures completed
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You haven't enrolled in any courses yet. Explore our course catalog to find something that interests you!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
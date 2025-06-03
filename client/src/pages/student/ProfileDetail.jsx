import { useState, useEffect, useContext, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { CardanoWallet, useWallet } from '@meshsdk/react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaGraduationCap, FaBook, FaChartLine, FaCoins, FaIdCard } from 'react-icons/fa';

const Popup = ({ title, onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white text-gray-700 p-6 rounded-lg shadow-xl relative w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
    </div>
  </div>
);

const ProfileEditForm = ({ isEditing, setIsEditing, cccd, setCccd, profileImage, setProfileImage, profileImageUrl, user, walletConnected, walletAddress, showSavePopup, setShowSavePopup, fileInputRef, handleSaveProfile, saveLoading, mintLoading }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden relative p-6">
    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2" />
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-1.5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit Identity Information</h2>
    </div>
    <div className="space-y-6 relative z-10">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
        <div className="flex items-center gap-4">
          <img src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl || user?.imageUrl || "https://via.placeholder.com/100"} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
          <div>
            <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm">Choose Image</button>
            <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files[0]) { const file = e.target.files[0]; if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be ≤ 5MB'); return; } if (!file.type.startsWith('image/')) { toast.error('Please upload a valid image file'); return; } setProfileImage(file); } }} accept="image/*" className="hidden" />
            <p className="text-xs text-gray-500 mt-1">Recommended: Square image, 500x500px or larger</p>
          </div>
        </div>
      </div>
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FaIdCard className="mr-2" /> ID Card Number</label>
        <input type="text" value={cccd} onChange={(e) => setCccd(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="Enter your ID card number" />
        <p className="text-xs text-gray-500 mt-1">This identity information will be stored in the NFT metadata</p>
      </div>
      <div><p className="text-gray-700 mb-4">Your identity certificate will be created with essential information: profile image, wallet address and ID card number.</p></div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Connection</label>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">{walletConnected ? `Connected: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Connect your wallet to mint an NFT of your profile'}</p>
          <div className="flex justify-center"><CardanoWallet isDark={false} persist={true} /></div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => setShowSavePopup(true)} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-2" disabled={saveLoading || mintLoading}>{saveLoading || mintLoading ? 'Processing...' : 'Save & Mint Identity Certificate'}{!saveLoading && !mintLoading && <FaCoins />}</button>
      </div>
    </div>
  </div>
);

const StatsCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-400/10 to-blue-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="flex items-start justify-between relative z-10">
      <div><p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-bold text-gray-800">{value}</h3><p className="text-sm text-gray-600 mt-1">{subtitle}</p></div>
      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}><Icon className="text-white text-xl" /></div>
    </div>
  </div>
);

const CourseSlider = ({ enrolledCourses, progressArray, sliderSettings }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 p-8 mb-8 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden"><div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div><div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div></div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md"><FaBook className="text-white text-xl" /></div><h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Courses Being Studied</h3></div>
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
                      <div className="flex justify-between mb-1 text-sm"><span className="text-gray-600 font-medium">Progress</span><span className="text-indigo-600 font-medium">{Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%` }}></div></div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><FaBook className="text-gray-400" />{progressArray[index].lectureCompleted}/{progressArray[index].totalLectures} lectures completed</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
          <div className="flex"><div className="flex-shrink-0"><svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 0 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h1a1 1 0 011 1v3h1a1 1 0 01-1 1-1-2h0v-3h-1a1 1 0 0-1-1H9z" clipRule="evenodd" /></svg></div><div className="ml-3"><p className="text-sm text-blue-700">You haven't enrolled in any courses yet. Explore our course catalog to find something that interests you!</p></div></div>
        </div>
      )}
    </div>
  </div>
);

const ProfilePage = () => {
  const { user } = useUser();
  const { connected, wallet } = useWallet();
  const { enrolledCourses, userData, fetchUserEnrolledCourses, backendUrl, getToken, calculateNoOfLectures, fetchUserData } = useContext(AppContext);
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [cccd, setCccd] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [progressArray, setProgressArray] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) { fetchUserEnrolledCourses(); fetchProfileData(); }
  }, [userData]);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getUsedAddresses().then(addresses => { if (addresses?.length) setWalletAddress(addresses[0]); });
      getAssets();
    } else { setWalletAddress(''); }
  }, [connected, wallet]);

  useEffect(() => { if (enrolledCourses.length) getCourseProgress(); }, [enrolledCourses]);

  const getAssets = async () => {
    setLoading(true);
    try {
      const lovelace = await wallet.getLovelace();
      const ada = parseFloat(lovelace) / 1000000;
      setAssets(ada);
      if (!ada) toast.warn('No assets in wallet.');
    } catch (error) { toast.error('Failed to load wallet assets.'); } finally { setLoading(false); }
  };

  const fetchProfileData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/profile/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success && data.profile) { setCccd(data.profile.cccd || ''); setProfileImageUrl(data.profile.imageUrl || ''); }
    } catch (error) { console.log('No profile found or error fetching profile:', error.message); } finally { setLoading(false); }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const progress = await Promise.all(enrolledCourses.map(async course => {
        const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`, { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } });
        return { totalLectures: calculateNoOfLectures(course), lectureCompleted: data.progressData?.lectureCompleted?.length || 0 };
      }));
      setProgressArray(progress);
    } catch (error) { toast.error('Failed to fetch course progress.'); }
  };

  const handleSaveProfile = async () => {
    if (!profileImage) { toast.error('Profile image is required.'); return; }
    if (!cccd.trim()) { toast.error('ID card number is required.'); return; }
    if (!connected) { toast.error('Please connect your wallet to mint NFT.'); return; }
    setSaveLoading(true); setMintLoading(true);
    try {
      const token = await getToken();
      const addresses = await wallet.getUsedAddresses();
      if (!addresses?.length) { toast.error('No wallet addresses found.'); return; }
      const address = addresses[0];
      const [utxos, collateral] = await Promise.all([wallet.getUtxos(), wallet.getCollateral()]);
      if (!utxos?.length) { toast.error('No UTXOs found in wallet.'); return; }
      if (!collateral?.length) { toast.error('No collateral found in wallet.'); return; }
      const profileId = crypto.randomUUID();
      const profileData = { courseId: profileId, courseTitle: user?.fullName || 'Profile NFT', courseDescription: `CCCD: ${cccd}`, creatorId: address, createdAt: new Date().toISOString(), cccd, walletAddress: address, isProfile: true };
      const { data: txData } = await axios.post(`${backendUrl}/api/profile/create-profile-tx`, { profileData, utxos, collateral, address }, { headers: { Authorization: `Bearer ${token}`, 'wallet-address': address } });
      if (!txData?.success) { toast.error(txData?.message || 'Failed to create transaction.'); return; }
      const signedTx = await wallet.signTx(txData.unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      if (!txHash) { toast.error('Failed to submit transaction.'); return; }
      const formData = new FormData();
      formData.append('profileData', JSON.stringify({ cccd, walletAddress: address, profileId, txHash, assetName: txData.assetName || '' }));
      formData.append('profileImage', profileImage);
      const { data } = await axios.post(`${backendUrl}/api/profile/create-profile-nft`, formData, { headers: { Authorization: `Bearer ${token}`, 'wallet-address': address } });
      if (data.success) {
        toast.success('Profile updated and NFT minted!');
        setIsEditing(false); setShowSavePopup(false); await fetchUserData(); await fetchProfileData();
      } else { toast.error(data.message || 'Failed to save profile.'); }
    } catch (error) { toast.error(error.message || 'Failed to save profile.'); } finally { setSaveLoading(false); setMintLoading(false); }
  };

  const sliderSettings = { dots: true, infinite: enrolledCourses.length > 3, speed: 500, slidesToShow: Math.min(3, enrolledCourses.length), slidesToScroll: 1, autoplay: true, autoplaySpeed: 5000, pauseOnHover: true, responsive: [{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }] };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white" /><div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2" /><div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2" />
      <div className="min-h-screen flex flex-col items-start md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8"><div className="h-12 w-1.5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" /><h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2" /><div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group"><div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity" /><div className="relative"><img src={profileImageUrl || user?.imageUrl || 'https://via.placeholder.com/100'} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform" /><div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white shadow-sm" /></div></div>
                <div className="text-center md:text-left"><h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.fullName || 'User'}</h2><p className="text-gray-600 mb-2">{user?.primaryEmailAddress?.emailAddress || 'Email not available'}</p>{assets !== null && <p className="text-sm font-medium text-indigo-600 mb-2">Wallet Balance: <span className="font-bold">{assets} ADA</span></p>}<button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">{isEditing ? 'Cancel' : 'Edit Profile'}<FaIdCard /></button></div>
              </div>
              <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end"><CardanoWallet /></div>
            </div>
          </div>
          {isEditing && <ProfileEditForm isEditing={isEditing} setIsEditing={setIsEditing} cccd={cccd} setCccd={setCccd} profileImage={profileImage} setProfileImage={setProfileImage} profileImageUrl={profileImageUrl} user={user} walletConnected={connected} walletAddress={walletAddress} showSavePopup={showSavePopup} setShowSavePopup={setShowSavePopup} fileInputRef={fileInputRef} handleSaveProfile={handleSaveProfile} saveLoading={saveLoading} mintLoading={mintLoading} />}
          {showSavePopup && (
            <Popup title="Save Profile & Mint NFT" onClose={() => setShowSavePopup(false)}>
              <p className="mb-4">{connected ? 'You are about to save your profile and mint an NFT on the Cardano blockchain. This requires a small transaction fee.' : 'Please connect a wallet to mint your profile as an NFT.'}</p>
              {connected && <div className="bg-indigo-50 p-3 rounded-md text-indigo-700 text-sm mb-4"><p className="font-medium">Wallet connected!</p><p>Address: {walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}</p></div>}
              <div className="flex justify-end gap-3"><button onClick={() => setShowSavePopup(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button><button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400" disabled={saveLoading || mintLoading || !connected}>{saveLoading || mintLoading ? 'Processing...' : 'Save & Mint'}<FaCoins /></button></div>
            </Popup>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Courses Completed" value={progressArray.filter(p => p.lectureCompleted === p.totalLectures).length} subtitle={`of ${enrolledCourses.length} enrolled`} icon={FaGraduationCap} gradient="from-green-400 to-green-500" />
            <StatsCard title="Lectures Completed" value={progressArray.reduce((sum, p) => sum + p.lectureCompleted, 0)} subtitle={`of ${progressArray.reduce((sum, p) => sum + p.totalLectures, 0)} total`} icon={FaBook} gradient="from-blue-400 to-indigo-500" />
            <StatsCard title="Overall Progress" value={`${progressArray.length ? Math.round((progressArray.reduce((sum, p) => sum + p.lectureCompleted, 0) / progressArray.reduce((sum, p) => sum + p.totalLectures, 0)) * 100) : 0}%`} subtitle="across all courses" icon={FaChartLine} gradient="from-purple-400 to-pink-500" />
          </div>
          <CourseSlider enrolledCourses={enrolledCourses} progressArray={progressArray} sliderSettings={sliderSettings} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
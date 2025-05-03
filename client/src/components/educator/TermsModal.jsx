import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpandAlt, FaCompressAlt, FaInfoCircle, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const TermsModal = ({ isOpen: propIsOpen, onClose, onAgree, autoShow = false }) => {
  // Nếu autoShow = true, modal sẽ tự động hiển thị nếu người dùng chưa đồng ý với điều khoản
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { backendUrl, getToken } = useContext(AppContext);

  // Cập nhật trạng thái isOpen khi prop thay đổi
  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);
  
  // Kiểm tra xem người dùng đã đồng ý điều khoản chưa
  useEffect(() => {
    const checkTermsAgreement = async () => {
      try {
        // Xóa trạng thái đã đồng ý trong localStorage (nếu có)
        localStorage.removeItem('hasAgreedToTerms');
        
        const token = await getToken();
        const { data } = await axios.get(
          `${backendUrl}/api/educator/check-terms-agreement`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Check terms agreement response:", data);
        
        if (data.success && data.hasAgreed) {
          setAgreedToTerms(true);
          // Nếu người dùng đã đồng ý và đang ở chế độ autoShow, đóng modal
          if (autoShow) {
            setIsOpen(false);
            if (onClose) onClose();
          }
        } else if (autoShow) {
          // Nếu chưa đồng ý và đang ở chế độ autoShow, mở modal
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error checking terms agreement:", error);
        // Nếu có lỗi, mở modal để đảm bảo người dùng đọc và đồng ý
        if (autoShow) {
          setIsOpen(true);
        }
      }
    };

    // Kiểm tra khi component mount hoặc khi isOpen thay đổi
    checkTermsAgreement();
  }, [autoShow, backendUrl, getToken, onClose]);

  // Hàm xử lý khi người dùng đồng ý điều khoản
  const handleAgree = async () => {
    if (!agreedToTerms) {
      // Hiển thị thông báo đang lưu
      toast.info("Saving your agreement...");
      setIsSaving(true);
      
      try {
        const token = await getToken();
        const { data } = await axios.post(
          `${backendUrl}/api/educator/agree-to-terms`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Agree to terms response:", data);
        
        if (data.success) {
          setAgreedToTerms(true);
          
          // Hiển thị thông báo thành công rõ ràng
          toast.success("Your agreement has been saved successfully!", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Kiểm tra lại để đảm bảo đã lưu vào CSDL
          const checkResponse = await axios.get(
            `${backendUrl}/api/educator/check-terms-agreement`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          console.log("Verification check response:", checkResponse.data);
          
          if (checkResponse.data.success && checkResponse.data.hasAgreed) {
            console.log("Verification successful: User has agreed to terms in database");
          } else {
            console.warn("Verification failed: User agreement not found in database");
            toast.warning("Your agreement may not have been saved correctly. Please try again.");
          }
          
          if (onAgree) onAgree();
        } else {
          // Hiển thị lỗi nếu có
          toast.error(data.message || "Failed to save your agreement");
        }
      } catch (error) {
        toast.error("Error saving your agreement: " + (error.message || "Unknown error"));
        console.error("Error saving terms agreement:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Nếu đã đồng ý trước đó, chỉ hiển thị thông báo
      toast.info("You have already agreed to the terms and conditions");
    }
    
    // Đóng modal
    onClose();
  };

  // Hiệu ứng cho modal
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Hiệu ứng cho nút thu nhỏ
  const minimizedButtonVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {!isOpen ? null : isMinimized ? (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={minimizedButtonVariants}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsMinimized(false)}
        >
          <FaInfoCircle className="text-lg" />
          <span className="text-sm font-medium">Terms & Conditions</span>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMinimized(true)}></div>
          <div className="relative bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-800">Educator Terms & Conditions</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  title="Minimize"
                >
                  <FaCompressAlt className="text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  title="Close"
                >
                  <FaTimes className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="prose prose-sm max-w-none">
                <h3>1. Educator Responsibilities</h3>
                <p>
                  As an educator on our platform, you agree to provide accurate, high-quality educational content that adheres to academic standards and respects intellectual property rights. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                </p>

                <h3>2. Content Guidelines</h3>
                <p>
                  All content published must be original or properly licensed. Content that is discriminatory, harmful, illegal, or violates the rights of others is strictly prohibited. We reserve the right to remove any content that violates these guidelines without prior notice.
                </p>

                <h3>3. Revenue Sharing</h3>
                <p>
                  Educators will receive a percentage of the revenue generated from their courses according to our current revenue sharing model. Payments will be processed according to the payment schedule outlined in our payment policy.
                </p>

                <h3>4. Intellectual Property</h3>
                <p>
                  You retain ownership of your original content, but grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media.
                </p>

                <h3>5. Account Termination</h3>
                <p>
                  We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties, or for any other reason.
                </p>

                <h3>6. Changes to Terms</h3>
                <p>
                  We may modify these terms at any time. Continued use of the platform after such changes constitutes your acceptance of the new terms.
                </p>

                <h3>7. Limitation of Liability</h3>
                <p>
                  We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  I agree to the terms and conditions
                </label>
              </div>
              <button
                onClick={handleAgree}
                disabled={!agreedToTerms || isSaving}
                className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  agreedToTerms && !isSaving
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;

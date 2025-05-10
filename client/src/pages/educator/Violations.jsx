import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { useWallet } from '@meshsdk/react';

const Violations = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [mintingViolation, setMintingViolation] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [violationTypeFilter, setViolationTypeFilter] = useState('');
  
  const { connected, wallet } = useWallet();

  useEffect(() => {
    console.log('userData in Violations component:', userData);
    fetchViolations();
  }, [userData]);

  useEffect(() => {
    if (!violations.length) {
      setFilteredViolations([]);
      return;
    }

    let filtered = [...violations];

    if (violationTypeFilter) {
      filtered = filtered.filter(violation => violation.violationType === violationTypeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(violation => {
        const studentId = violation.studentId?.toString().toLowerCase() || '';
        const studentName = violation.studentId?.firstName?.toLowerCase() || '';
        const studentEmail = violation.studentId?.email?.toLowerCase() || '';
        return studentId.includes(query) || studentName.includes(query) || studentEmail.includes(query);
      });
    }

    setFilteredViolations(filtered);
  }, [violations, violationTypeFilter, searchQuery]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      
      // Lấy educatorId từ userData
      const educatorId = userData?._id;
      console.log(`Current educator ID: ${educatorId}`);
      
      if (!educatorId) {
        console.error('No educator ID found in userData');
        setLoading(false);
        return;
      }
      
      // Lấy vi phạm giống hệt cách NotificationPage lấy thông báo
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/violation/all?educatorId=${educatorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        console.log('Violations fetched successfully:', data.violations.length);
        
        // Lọc vi phạm dựa trên educatorId
        const educatorId = userData?._id;
        console.log(`Current educator ID: ${educatorId}`);
        
        // Chỉ hiển thị vi phạm của edu hiện tại, đơn giản nhất có thể
        const educatorViolations = data.violations.filter(violation => {
          return violation.educatorId === userData._id;
        });
        
        console.log(`Filtered by educatorId: ${data.violations.length} -> ${educatorViolations.length}`);
        
        // Lấy tất cả courseId cần fetch
        const courseIds = [];
        const educatorCourseIds = [];
        
        // Duyệt qua tất cả vi phạm để lấy danh sách courseId cần fetch
        educatorViolations.forEach(v => {
          if (v.courseId) {
            let courseIdStr = '';
            
            if (typeof v.courseId === 'string') {
              courseIdStr = v.courseId;
            } else if (typeof v.courseId === 'object' && v.courseId._id) {
              courseIdStr = v.courseId._id;
            }
            
            if (courseIdStr && !courseIds.includes(courseIdStr)) {
              courseIds.push(courseIdStr);
            }
          }
        });
        
        console.log('Course IDs to fetch:', courseIds);
        
        if (courseIds.length > 0) {
          try {
            const coursePromises = courseIds.map(courseId => 
              axios.get(`${backendUrl}/api/course/${courseId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
              })
            );
            
            const courseResponses = await Promise.all(coursePromises);
            const coursesData = {};
            
            courseResponses.forEach((response, index) => {
              if (response.data.success) {
                const courseId = courseIds[index];
                const courseData = response.data.courseData;
                
                // Chỉ thêm vào danh sách nếu khóa học thuộc về giáo viên hiện tại
                if (courseData.educatorId === educatorId) {
                  coursesData[courseId] = courseData;
                  console.log(`Course data for ${courseId} belongs to current educator:`, courseData);
                  educatorCourseIds.push(courseId);
                } else {
                  console.log(`Course ${courseId} does not belong to current educator ${educatorId}, skipping`);
                }
              }
            });
            
            // Lọc lại vi phạm dựa trên danh sách khóa học của giáo viên
            const finalViolations = educatorViolations.filter(violation => {
              const violationCourseId = typeof violation.courseId === 'string' 
                ? violation.courseId 
                : violation.courseId?._id;
              
              // Nếu vi phạm có educatorId và trùng với giáo viên hiện tại, giữ lại
              if (violation.educatorId === educatorId) {
                return true;
              }
              
              // Nếu không có educatorId, kiểm tra xem khóa học có thuộc về giáo viên hiện tại không
              return educatorCourseIds.includes(violationCourseId);
            });
            
            console.log(`Final violations after course filtering: ${finalViolations.length}`);
            
            const updatedViolations = finalViolations.map(violation => {
              if (violation.courseId && coursesData[violation.courseId]) {
                return {
                  ...violation,
                  courseData: coursesData[violation.courseId],
                  courseId: {
                    ...violation.courseId,
                    _id: typeof violation.courseId === 'string' ? violation.courseId : violation.courseId?._id,
                    courseTitle: coursesData[violation.courseId].courseTitle
                  }
                };
              }
              return violation;
            });
            
            setViolations(updatedViolations);
            setFilteredViolations(updatedViolations);
          } catch (courseError) {
            console.error('Error fetching course data:', courseError);
            setViolations(data.violations);
            setFilteredViolations(data.violations);
          }
        } else {
          setViolations(data.violations);
          setFilteredViolations(data.violations);
        }
      } else {
        console.error('API returned error:', data);
        toast.error(data.message || 'Failed to fetch violations');
      }
    } catch (error) {
      console.error('Error fetching violations:', error.response || error);
      toast.error(error.response?.data?.message || 'Error fetching violations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (violation) => {
    try {
      // Nếu courseId là string hoặc chưa có thông tin đầy đủ, fetch thông tin khóa học
      if (violation.courseId && 
          (typeof violation.courseId === 'string' || 
           (typeof violation.courseId === 'object' && !violation.courseId.courseTitle))) {
        
        const token = await getToken();
        const courseId = typeof violation.courseId === 'string' ? violation.courseId : violation.courseId?._id;
        
        console.log(`Fetching course details for violation: ${violation._id}, courseId: ${courseId}`);
        
        // Fetch thông tin khóa học cơ bản
        const courseResponse = await axios.get(
          `${backendUrl}/api/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (courseResponse.data.success) {
          const courseData = courseResponse.data.courseData;
          console.log('Fetched course data:', courseData);
          
          // Cập nhật thông tin khóa học trong vi phạm
          violation = {
            ...violation,
            courseId: {
              ...courseData,
              _id: courseId
            }
          };
          
          // Fetch thông tin chi tiết khóa học
          try {
            const courseDetailsResponse = await axios.get(
              `${backendUrl}/api/course/details/${courseId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (courseDetailsResponse.data.success) {
              const details = courseDetailsResponse.data;
              console.log('Course details:', details);
              
              // Cập nhật thêm thông tin chi tiết khóa học
              violation.courseId = {
                ...violation.courseId,
                students: details.students || [],
                educator: details.educator || {},
                enrollments: details.enrollments || [],
                modules: details.modules || []
              };
            }
          } catch (error) {
            console.error('Error fetching course details:', error);
          }
        }
      }
      
      // Hiển thị vi phạm với thông tin đầy đủ
      setSelectedViolation(violation);
    } catch (error) {
      console.error('Error fetching course data for violation details:', error);
      toast.error('Error loading course details');
      setSelectedViolation(violation);
    }
  };

  const handleMintNFT = async (violation) => {
    if (!connected || !wallet) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!violation.walletAddress) {
      toast.error("Student wallet address is required for minting NFT");
      return;
    }
    
    // Kiểm tra xem vi phạm đã được mint chưa
    if (violation.nftMinted) {
      toast.info("This violation has already been minted as an NFT");
      return;
    }

    setMintingViolation(violation._id);
    try {
      const token = await getToken();
      
      // Lấy courseId từ vi phạm, đảm bảo luôn có giá trị
      const courseId = typeof violation.courseId === 'string' ? 
                       violation.courseId : 
                       violation.courseId?._id;
      
      console.log('Getting course info for:', courseId);
      let courseData = {};
      let nftInfo = {};
      let studentData = {};
      let educatorData = {};
      
      if (courseId) {
        try {
          const [courseResponse, nftResponse, courseDetailsResponse] = await Promise.all([
            axios.get(
              `${backendUrl}/api/course/${courseId}`, 
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `${backendUrl}/api/nft/info/${courseId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `${backendUrl}/api/course/${courseId}/details`, 
              { headers: { Authorization: `Bearer ${token}` } }
            )
          ]);

          if (!courseResponse.data.success) {
            console.warn("Failed to get basic course info");
          } else {
            courseData = courseResponse.data.courseData;
            console.log('Course basic data:', courseData);
            
            // Đảm bảo luôn có tên khóa học
            if (!courseData.courseTitle) {
              console.warn("Course title is missing, trying to fetch again");
              try {
                const detailResponse = await axios.get(
                  `${backendUrl}/api/course/${courseId}`, 
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (detailResponse.data.success && detailResponse.data.courseData) {
                  const detailData = detailResponse.data.courseData;
                  console.log('Additional course data:', detailData);
                  
                  // Cập nhật thông tin khóa học
                  courseData = {
                    ...courseData,
                    ...detailData,
                    courseTitle: detailData.courseTitle || detailData.title || 'Course ' + courseId
                  };
                }
              } catch (error) {
                console.error('Error fetching additional course data:', error);
              }
            }
          }
          
          if (nftResponse.data.success) {
            nftInfo = {
              policyId: nftResponse.data.policyId,
              assetName: nftResponse.data.assetName
            };
            console.log('NFT info:', nftInfo);
          }
          
          if (courseDetailsResponse.data.success) {
            const details = courseDetailsResponse.data;
            console.log('Course details:', details);
            
            courseData = {
              ...courseData,
              students: details.students || [],
              educator: details.educator || {},
              enrollments: details.enrollments || [],
              modules: details.modules || [],
            };
          }
          
          if (violation.studentId) {
            try {
              const studentResponse = await axios.get(
                `${backendUrl}/api/user/${violation.studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (studentResponse.data.success) {
                studentData = studentResponse.data.user;
                console.log('Student data:', studentData);
              }
            } catch (error) {
              console.warn('Failed to fetch student data:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      }

      console.log('Getting UTXOs and collateral...');
      const utxos = await wallet.getUtxos();
      const collateral = await wallet.getCollateral();
      if (!utxos || !collateral) {
        throw new Error("Failed to get UTXOs or collateral");
      }

      // Lấy địa chỉ ví hiện tại của educator
      const educatorAddress = await wallet.getUsedAddresses();
      const currentWallet = educatorAddress[0];

      // 3. Create mint transaction
      console.log('Creating mint transaction with address:', violation.walletAddress);
      
      // Lấy tên sinh viên từ dữ liệu đã fetch hoặc từ violation
      const studentName = studentData?.name || 
                         studentData?.firstName || 
                         violation.studentId?.name || 
                         violation.studentName || 
                         "Student";
      
      // Lấy tên giáo viên từ dữ liệu đã fetch hoặc từ userData
      const educatorName = courseData.educator?.name || 
                          userData?.name || 
                          'Edu Platform';
      
      const requestData = {
        violationId: violation._id,
        utxos: utxos,
        userAddress: violation.walletAddress,
        collateral: collateral,
        educatorAddress: currentWallet,
        educatorId: userData?._id || violation.educatorId || '',
        violationData: {
          _id: violation._id,
          violationType: violation.violationType,
          message: violation.message,
          courseId: courseId || '',
          courseTitle: courseData.courseTitle || violation.courseId?.courseTitle || 'Course ' + courseId,
          testId: violation.testId || '',
          studentId: violation.studentId || '',
          walletAddress: violation.walletAddress, 
          timestamp: violation.timestamp || violation.createdAt,
          educatorId: userData?._id || violation.educatorId || '',
          courseData: {
            courseId: courseId || '',
            courseTitle: courseData.courseTitle || violation.courseId?.courseTitle || 'Course ' + courseId,
            courseDescription: courseData.courseDescription || '',
            creatorAddress: courseData.creatorAddress || currentWallet,
            createdAt: courseData.createdAt || new Date().toISOString(),
            educatorId: userData?._id || violation.educatorId || '',
            educator: educatorName,

            violationImage: '',
            studentName: studentName,
            enrollmentDate: courseData.enrollments?.find(e => e.studentId === violation.studentId)?.enrolledAt,
            moduleCount: courseData.modules?.length || 0,
            studentCount: courseData.students?.length || 0,
            policyId: nftInfo.policyId || '',
            assetName: nftInfo.assetName || ''
          }
        }
      };
      
      console.log('Sending request data:', JSON.stringify(requestData, null, 2));
      const { data: mintData } = await axios.post(
        `${backendUrl}/api/violation-nft/create-transaction`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!mintData.success) {
        throw new Error(mintData.message || "Failed to create mint transaction");
      }

      // Chỉ tiếp tục nếu tạo transaction thành công
      try {
        console.log('Signing transaction...');
        const signedTx = await wallet.signTx(mintData.unsignedTx);
        console.log('Submitting transaction...');
        const txHash = await wallet.submitTx(signedTx);
        
        // Chỉ cập nhật trạng thái nftMinted khi đã submit transaction thành công
        console.log('Updating violation record...');
        const updateResponse = await axios.post(
          `${backendUrl}/api/violation-nft/update`,
          {
            violationId: violation._id,
            policyId: mintData.policyId,
            transactionHash: txHash
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!updateResponse.data.success) {
          throw new Error("Failed to update violation record");
        }

        toast.success(`Violation NFT minted successfully! Transaction hash: ${txHash.slice(0, 10)}...`);
        await fetchViolations();
      } catch (innerError) {
        console.error("Error during transaction signing/submission:", innerError);
        toast.error(innerError.message || "Failed to sign or submit transaction");
        throw innerError; // Re-throw to be caught by outer catch block
      }

    } catch (error) {
      console.error("Mint error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to mint violation NFT");
      
      // Khi có lỗi, đảm bảo reset trạng thái mint
      setMintLoading(false);
      setMintingViolation(null);
      
      // Không cập nhật trạng thái nftMinted khi có lỗi
      return;
    }
    
    // Chỉ reset trạng thái mint khi thành công
    setMintLoading(false);
    setMintingViolation(null);
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getViolationTypeLabel = (type) => {
    const types = {
      'face_not_detected': 'Face Not Detected',
      'looking_away': 'Looking Away',
      'phone_detected': 'Phone Detected',
      'fullscreen_exit': 'Fullscreen Exit',
      'tab_switch': 'Tab Switch'
    };
    return types[type] || type;
  };

  const getViolationTypeColor = (type) => {
    const colors = {
      'face_not_detected': 'bg-yellow-100 text-yellow-800',
      'looking_away': 'bg-orange-100 text-orange-800',
      'phone_detected': 'bg-red-100 text-red-800',
      'fullscreen_exit': 'bg-purple-100 text-purple-800',
      'tab_switch': 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Test Violations</h1>
            <button 
              onClick={fetchViolations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Filter and Search Section */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search by Student ID/Name</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Enter student ID or name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="violationType" className="block text-sm font-medium text-gray-700 mb-1">Filter by Violation Type</label>
                <select
                  id="violationType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={violationTypeFilter}
                  onChange={(e) => setViolationTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="face_not_detected">No Face Detected</option>
                  <option value="looking_away">Looking Away</option>
                  <option value="phone_detected">Phone Detected</option>
                  <option value="fullscreen_exit">Fullscreen Exit</option>
                  <option value="tab_switch">Tab Switch</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : filteredViolations.length === 0 ? (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No violations found</h3>
              <p className="mt-1 text-sm text-gray-500">No test violations have been reported yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violation Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredViolations.map((violation) => (
                    <tr key={violation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {violation.studentId?.firstName || violation.studentId?.name || violation.studentId?.email || violation.studentId}
                        </div>
                        <div className="text-sm text-gray-500">{violation.studentId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getViolationTypeColor(violation.violationType)}`}>
                          {getViolationTypeLabel(violation.violationType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewDetails(violation)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                          {violation.walletAddress && (
                            <button
                              onClick={() => handleMintNFT(violation)}
                              disabled={mintingViolation === violation._id || mintLoading || !connected || violation.nftMinted}
                              className={`px-3 py-1 rounded text-white 
                                ${mintingViolation === violation._id ? 'bg-gray-500' : 
                                  violation.nftMinted ? 'bg-gray-400 cursor-not-allowed' : 
                                  'bg-green-600 hover:bg-green-700'} 
                                ${!connected || !violation.walletAddress || violation.nftMinted ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {mintingViolation === violation._id ? 'Minting...' : 
                               violation.nftMinted ? 'Minted' : 'Mint NFT'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedViolation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800">Violation Details</h2>
                    <button
                      onClick={() => setSelectedViolation(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Student</h3>
                        <p className="text-base font-medium text-gray-900">
                          {selectedViolation.studentId?.firstName || selectedViolation.studentId?.email || selectedViolation.studentId}
                        </p>
                        <p className="text-sm text-gray-500">{selectedViolation.studentId?.email}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Course</h3>
                        <p className="text-base font-medium text-gray-900">
                          {selectedViolation.courseId?.courseTitle || selectedViolation.courseData?.courseTitle || (selectedViolation.courseId && 'Course ' + selectedViolation.courseId) || 'Unknown Course'}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Test ID</h3>
                        <p className="text-base font-medium text-gray-900">
                          {selectedViolation.testId || 'N/A'}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
                        <p className="text-base font-mono text-gray-900 break-all">
                          {selectedViolation.walletAddress || <span className="text-gray-400 italic">Not available</span>}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">NFT Status</h3>
                        <p className="text-base font-medium text-gray-900">
                          {selectedViolation.nftMinted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Minted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Not Minted
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Violation Type</h3>
                        <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getViolationTypeColor(selectedViolation.violationType)}`}>
                          {getViolationTypeLabel(selectedViolation.violationType)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                        <p className="text-base font-medium text-gray-900">
                          {formatDate(selectedViolation.timestamp || selectedViolation.createdAt)}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Message</h3>
                        <p className="text-base font-medium text-gray-900">
                          {selectedViolation.message || 'No message provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {selectedViolation.imageData ? (
                        <div className="bg-gray-100 rounded-lg overflow-hidden p-3">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Violation Evidence</h3>
                          <img
                            src={selectedViolation.imageData}
                            alt="Violation Evidence"
                            className="w-full h-auto object-cover border border-gray-300 rounded-lg"
                          />
                          <p className="mt-2 text-xs text-gray-500 italic">Captured at the time of violation</p>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                          <p className="text-gray-500">No image available</p>
                        </div>
                      )}
                      

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Violations;
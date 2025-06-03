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
  const [searchQuery, setSearchQuery] = useState('');
  const [violationTypeFilter, setViolationTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { connected, wallet } = useWallet();

  useEffect(() => {
    fetchViolations();
  }, [userData]);

  useEffect(() => {
    if (!violations.length) {
      setFilteredViolations([]);
      return;
    }
    let filtered = [...violations];
    if (violationTypeFilter) {
      filtered = filtered.filter(v => v.violationType === violationTypeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(v =>
        (v.studentId?.toString().toLowerCase() || '').includes(query) ||
        (v.studentId?.firstName?.toLowerCase() || '').includes(query) ||
        (v.studentId?.email?.toLowerCase() || '').includes(query)
      );
    }
    setFilteredViolations(filtered);
  }, [violations, violationTypeFilter, searchQuery]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const educatorId = userData?._id;
      if (!educatorId) {
        setLoading(false);
        return;
      }
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/violation/all?educatorId=${educatorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        const educatorViolations = data.violations.filter(v => v.educatorId === userData._id);
        const courseIds = [...new Set(educatorViolations.map(v => 
          typeof v.courseId === 'string' ? v.courseId : v.courseId?._id).filter(Boolean))];
        if (courseIds.length) {
          try {
            const coursePromises = courseIds.map(id =>
              axios.get(`${backendUrl}/api/course/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            );
            const courseResponses = await Promise.all(coursePromises);
            const coursesData = {};
            const educatorCourseIds = [];
            courseResponses.forEach((res, i) => {
              if (res.data.success && res.data.courseData.educatorId === educatorId) {
                coursesData[courseIds[i]] = res.data.courseData;
                educatorCourseIds.push(courseIds[i]);
              }
            });
            const finalViolations = educatorViolations.filter(v => {
              const courseId = typeof v.courseId === 'string' ? v.courseId : v.courseId?._id;
              return v.educatorId === educatorId || educatorCourseIds.includes(courseId);
            });
            const updatedViolations = finalViolations.map(v => {
              const courseId = typeof v.courseId === 'string' ? v.courseId : v.courseId?._id;
              if (courseId && coursesData[courseId]) {
                return {
                  ...v,
                  courseData: coursesData[courseId],
                  courseId: { ...v.courseId, _id: courseId, courseTitle: coursesData[courseId].courseTitle }
                };
              }
              return v;
            });
            setViolations(updatedViolations);
            setFilteredViolations(updatedViolations);
          } catch (error) {
            setViolations(data.violations);
            setFilteredViolations(data.violations);
          }
        } else {
          setViolations(data.violations);
          setFilteredViolations(data.violations);
        }
      } else {
        toast.error(data.message || 'Failed to fetch violations');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching violations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async violation => {
    try {
      if (violation.courseId && (typeof violation.courseId === 'string' || !violation.courseId.courseTitle)) {
        const token = await getToken();
        const courseId = typeof violation.courseId === 'string' ? violation.courseId : violation.courseId?._id;
        const courseResponse = await axios.get(`${backendUrl}/api/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (courseResponse.data.success) {
          violation = {
            ...violation,
            courseId: { ...courseResponse.data.courseData, _id: courseId }
          };
          try {
            const detailsResponse = await axios.get(`${backendUrl}/api/course/details/${courseId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (detailsResponse.data.success) {
              violation.courseId = {
                ...violation.courseId,
                students: detailsResponse.data.students || [],
                educator: detailsResponse.data.educator || {},
                enrollments: detailsResponse.data.enrollments || [],
                modules: detailsResponse.data.modules || []
              };
            }
          } catch (error) {}
        }
      }
      setSelectedViolation(violation);
    } catch (error) {
      toast.error('Error loading course details');
      setSelectedViolation(violation);
    }
  };

  const handleMintNFT = async violation => {
    if (!connected || !wallet) {
      toast.error("Please connect your wallet first!");
      return;
    }
    if (!violation.walletAddress) {
      toast.error("Student wallet address is required for minting NFT");
      return;
    }
    if (violation.nftMinted) {
      toast.info("This violation has already been minted as an NFT");
      return;
    }
    setMintingViolation(violation._id);
    try {
      const token = await getToken();
      const courseId = typeof violation.courseId === 'string' ? violation.courseId : violation.courseId?._id;
      let courseData = {}, nftInfo = {}, studentData = {}, educatorData = {};
      if (courseId) {
        try {
          const [courseResponse, nftResponse, courseDetailsResponse] = await Promise.all([
            axios.get(`${backendUrl}/api/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/api/nft/info/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/api/course/${courseId}/details`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (courseResponse.data.success) {
            courseData = courseResponse.data.courseData;
            if (!courseData.courseTitle) {
              try {
                const detailResponse = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (detailResponse.data.success) {
                  courseData = { ...courseData, ...detailResponse.data.courseData, courseTitle: detailResponse.data.courseData.courseTitle || 'Course ' + courseId };
                }
              } catch (error) {}
            }
          }
          if (nftResponse.data.success) {
            nftInfo = { policyId: nftResponse.data.policyId, assetName: nftResponse.data.assetName };
          }
          if (courseDetailsResponse.data.success) {
            courseData = { ...courseData, ...courseDetailsResponse.data };
          }
          if (violation.studentId) {
            try {
              const studentResponse = await axios.get(`${backendUrl}/api/user/${violation.studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (studentResponse.data.success) studentData = studentResponse.data.user;
            } catch (error) {}
          }
        } catch (error) {}
      }
      const utxos = await wallet.getUtxos();
      const collateral = await wallet.getCollateral();
      if (!utxos || !collateral) throw new Error("Failed to get UTXOs or collateral");
      const educatorAddress = (await wallet.getUsedAddresses())[0];
      const studentName = studentData?.name || studentData?.firstName || violation.studentId?.name || violation.studentName || "Student";
      const educatorName = courseData.educator?.name || userData?.name || 'Edu Platform';
      const requestData = {
        violationId: violation._id,
        utxos,
        userAddress: violation.walletAddress,
        collateral,
        educatorAddress,
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
            creatorAddress: courseData.creatorAddress || educatorAddress,
            createdAt: courseData.createdAt || new Date().toISOString(),
            educatorId: userData?._id || violation.educatorId || '',
            educator: educatorName,
            violationImage: '',
            studentName,
            enrollmentDate: courseData.enrollments?.find(e => e.studentId === violation.studentId)?.enrolledAt,
            moduleCount: courseData.modules?.length || 0,
            studentCount: courseData.students?.length || 0,
            policyId: nftInfo.policyId || '',
            assetName: nftInfo.assetName || ''
          }
        }
      };
      const { data: mintData } = await axios.post(`${backendUrl}/api/violation-nft/create-transaction`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!mintData.success) throw new Error(mintData.message || "Failed to create mint transaction");
      const signedTx = await wallet.signTx(mintData.unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      const updateResponse = await axios.post(`${backendUrl}/api/violation-nft/update`, {
        violationId: violation._id,
        policyId: mintData.policyId,
        transactionHash: txHash
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (!updateResponse.data.success) throw new Error("Failed to update violation record");
      toast.success(`Violation NFT minted successfully! Transaction hash: ${txHash.slice(0, 10)}...`);
      await fetchViolations();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to mint violation NFT");
    } finally {
      setMintLoading(false);
      setMintingViolation(null);
    }
  };

  const formatDate = dateString => new Date(dateString).toLocaleString();

  const getViolationTypeLabel = type => ({
    'face_not_detected': 'Face Not Detected',
    'looking_away': 'Looking Away',
    'phone_detected': 'Phone Detected',
    'fullscreen_exit': 'Fullscreen Exit',
    'tab_switch': 'Tab Switch'
  }[type] || type);

  const getViolationTypeColor = type => ({
    'face_not_detected': 'bg-yellow-100 text-yellow-800',
    'looking_away': 'bg-orange-100 text-orange-800',
    'phone_detected': 'bg-red-100 text-red-800',
    'fullscreen_exit': 'bg-purple-100 text-purple-800',
    'tab_switch': 'bg-blue-100 text-blue-800'
  }[type] || 'bg-gray-100 text-gray-800');

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
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="violationType" className="block text-sm font-medium text-gray-700 mb-1">Filter by Violation Type</label>
                <select
                  id="violationType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={violationTypeFilter}
                  onChange={e => setViolationTypeFilter(e.target.value)}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violation Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredViolations
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(v => (
                      <tr key={v._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {v.studentId?.firstName || v.studentId?.name || v.studentId?.email || v.studentId}
                          </div>
                          <div className="text-sm text-gray-500">{v.studentId?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getViolationTypeColor(v.violationType)}`}>
                            {getViolationTypeLabel(v.violationType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => handleViewDetails(v)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </button>
                            {v.walletAddress && (
                              <button
                                onClick={() => handleMintNFT(v)}
                                disabled={mintingViolation === v._id || mintLoading || !connected || v.nftMinted}
                                className={`px-3 py-1 rounded text-white 
                                  ${mintingViolation === v._id ? 'bg-gray-500' : 
                                    v.nftMinted ? 'bg-gray-400 cursor-not-allowed' : 
                                    'bg-green-600 hover:bg-green-700'} 
                                  ${!connected || !v.walletAddress || v.nftMinted ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {mintingViolation === v._id ? 'Minting...' : v.nftMinted ? 'Minted' : 'Mint NFT'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {filteredViolations.length > 0 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Trước
                    </button>
                    <div className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                      Trang {currentPage} / {Math.ceil(filteredViolations.length / itemsPerPage)}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage >= Math.ceil(filteredViolations.length / itemsPerPage)}
                      className={`px-3 py-1 rounded ${currentPage >= Math.ceil(filteredViolations.length / itemsPerPage) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              )}
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
                        <p className="text-base font-medium text-gray-900">{selectedViolation.testId || 'N/A'}</p>
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
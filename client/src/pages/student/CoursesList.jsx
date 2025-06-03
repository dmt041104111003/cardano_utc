import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import Footer from '../../components/student/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const CoursesList = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewest, setShowNewest] = useState(false);
  const [chainType, setChainType] = useState('all');
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

  const newestFromUrl = searchParams.get('newest') === 'true';

  const filterCourses = (courses) => {
    let tempCourses = [...courses];

    // Apply search filter
    if (searchQuery) {
      tempCourses = tempCourses.filter(item =>
        item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.educator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by chain type
    if (chainType !== 'all') {
      tempCourses = tempCourses.filter(course => chainType === 'onchain' ? course.txHash : !course.txHash);
    }

    // Filter and sort by newest
    if (showNewest) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      tempCourses = tempCourses
        .filter(course => new Date(course.createdAt) > oneHourAgo)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return tempCourses;
  };

  const fetchLatestCourses = async (isFirstLoad = false) => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/course/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const filtered = filterCourses(data.courses);
        if (isFirstLoad) setCurrentPage(1);
        setFilteredCourses(filtered);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) fetchLatestCourses(false);
  };

  useEffect(() => {
    setShowNewest(newestFromUrl);
    fetchLatestCourses(true);

    const intervalId = setInterval(() => fetchLatestCourses(false), 2000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Removed dependencies since polling handles updates

  const toggleShowNewest = () => {
    const newParams = new URLSearchParams(searchParams);
    if (newestFromUrl) {
      newParams.delete('newest');
    } else {
      newParams.set('newest', 'true');
    }
    setSearchParams(newParams);
    setShowNewest(!newestFromUrl);
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFilterTags = () => (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500">Active filters:</span>
      {searchQuery && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Search: "{searchQuery}"
          <button onClick={() => setSearchQuery('')} className="ml-1.5 text-blue-600 hover:text-blue-800">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      )}
      {chainType !== 'all' && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          {chainType === 'onchain' ? 'On-Chain' : 'Off-Chain'}
          <button onClick={() => setChainType('all')} className="ml-1.5 text-purple-600 hover:text-purple-800">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      )}
      {newestFromUrl && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Newest
          <button onClick={toggleShowNewest} className="ml-1.5 text-yellow-600 hover:text-yellow-800">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      )}
      {(searchQuery || newestFromUrl || chainType !== 'all') && (
        <button
          onClick={() => {
            setSearchQuery('');
            setChainType('all');
            if (newestFromUrl) toggleShowNewest();
          }}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="relative min-h-screen">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white" />
        <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10">
          <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Course List
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {filteredCourses.length} Courses
                </span>
              </h1>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
                />
              </div>
              <select
                value={chainType}
                onChange={(e) => setChainType(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm"
              >
                <option value="all">All Types</option>
                <option value="onchain">On-Chain</option>
                <option value="offchain">Off-Chain</option>
              </select>
              <button
                onClick={toggleShowNewest}
                className={`px-4 py-2.5 rounded-lg ${newestFromUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white text-sm font-medium shadow-sm transition-colors duration-200`}
              >
                {newestFromUrl ? 'Show All' : 'Show Newest'}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-gray-700 font-medium">
                Showing <span className="font-semibold text-blue-600">{paginatedCourses.length}</span> of <span className="font-semibold text-blue-600">{filteredCourses.length}</span> courses
              </p>
              {(searchQuery || newestFromUrl || chainType !== 'all') && renderFilterTags()}
            </div>
          </div>

          <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-8 gap-4 px-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-600">Loading courses...</p>
              </div>
            ) : paginatedCourses.length > 0 ? (
              paginatedCourses.map(course => <CourseCard key={course._id} course={course} />)
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">No courses found matching your criteria</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 mb-8">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px text-sm">
                  <li>
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center px-3 h-8 ml-0 leading-tight ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'} border border-gray-300 rounded-l-lg`}
                    >
                      <svg className="w-3.5 h-3.5 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                      </svg>
                      Prev
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => totalPages <= 7 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <li>
                            <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">...</span>
                          </li>
                        )}
                        <li>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === page ? 'text-blue-600 text-white bg-blue-600 hover:bg-blue-600' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
                          >
                            {page}
                          </button>
                        </li>
                      </React.Fragment>
                    ))}
                  <li>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center px-4 h-8 leading-tight ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'} border border-gray-300 rounded-r-lg`}
                    >
                      Next
                      <svg className="w-3.5 h-3.5 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4l-4 4" />
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesList;
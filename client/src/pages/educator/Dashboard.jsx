import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/educator/dashboard`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                const modifiedData = {
                    ...data.dashboardData,
                    enrolledStudentsData: [...data.dashboardData.enrolledStudentsData]
                        .reverse()
                        .slice(0, 5)
                };
                setDashboardData(modifiedData);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleVisibilityChange = () => {
        if (!document.hidden && isEducator) {
            fetchDashboardData();
        }
    };

    useEffect(() => {
        if (!isEducator) return;

        fetchDashboardData();
        
        const intervalId = setInterval(fetchDashboardData, 2000);
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isEducator]);

    return dashboardData ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 to-white'>
            <div className='w-full max-w-7xl mx-auto'>
                <div className='mb-8'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2'>
                        <div className='w-1.5 h-8 bg-blue-600 rounded-full mr-2'></div>
                        Dashboard
                    </h1>
                    <p className='text-gray-600 ml-5'>Overview of your teaching activity</p>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                        <div className='p-5 flex items-center gap-4'>
                            <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className='text-3xl font-bold text-gray-800'>{dashboardData.totalCourses}</p>
                                <p className='text-sm text-gray-500'>Total Courses</p>
                            </div>
                        </div>
                        <div className='h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600'></div>
                    </div>

                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                        <div className='p-5 flex items-center gap-4'>
                            <div className='p-3 rounded-full bg-indigo-100 text-indigo-600'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className='text-3xl font-bold text-gray-800'>{dashboardData.enrolledStudentsData.length}</p>
                                <p className='text-sm text-gray-500'>Total Enrollments</p>
                            </div>
                        </div>
                        <div className='h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-600'></div>
                    </div>

                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                        <div className='p-5 flex items-center gap-4'>
                            <div className='p-3 rounded-full bg-green-100 text-green-600'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className='text-3xl font-bold text-gray-800'>{currency}{Number(dashboardData.totalEarnings).toFixed(2)}</p>
                                <p className='text-sm text-gray-500'>Total Earnings</p>
                            </div>
                        </div>
                        <div className='h-1 w-full bg-gradient-to-r from-green-500 to-emerald-600'></div>
                    </div>
                </div>

                <div className='mb-8'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                        <div className='w-1 h-5 bg-blue-600 rounded-full mr-2'></div>
                        Latest Enrollments
                    </h2>
                    
                    <div className='w-full overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200'>
                        <div className='overflow-x-auto'>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-left">
                                    <tr>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700 w-16 text-center">#</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Student</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Course</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.enrolledStudentsData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3.5 text-sm text-center text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3.5 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.student.imageUrl}
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div className="font-medium text-gray-900">{item.student.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-700">{item.courseTitle}</td>
                                        </tr>
                                    ))}
                                    
                                    {dashboardData.enrolledStudentsData.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-sm text-center text-gray-500">
                                                No enrollments yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : <Loading />
}

export default Dashboard;
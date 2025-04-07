/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const Certificate = () => {
    const { courseId } = useParams();
    const { backendUrl, getToken } = useContext(AppContext);
    const { user } = useUser();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data.success && data.courseData) {
                    setCourse(data.courseData);
                } else {
                    setError("Failed to load course data");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching course:", err);
                setError("Failed to load course information");
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId, backendUrl, getToken]);

    if (loading) return <div className="text-center mt-10">Loading certificate details...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!course) return <div className="text-center mt-10">Course not found</div>;

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate completion percentage
    const totalLectures = course.courseContent?.reduce((total, chapter) => 
        total + chapter.chapterContent.length, 0) || 0;
    const completedLectures = course.courseContent?.reduce((total, chapter) => 
        total + chapter.chapterContent.filter(lecture => lecture.completed).length, 0) || 0;
    const completionPercentage = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
    const isCompleted = completionPercentage === 100;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-10 max-w mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
                {isCompleted ? "Certificate of Completion" : "Please complete the course to view your certificate"}
            </h1>
            <div className="border-t border-gray-300 pt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    🎓 Course Details
                </h2>
                <p><strong>Course ID:</strong> {`#${courseId}`}</p>
                <p><strong>Issued To:</strong> {user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                <p><strong>Course:</strong> {course.courseTitle}</p>
              
                <p><strong>Issuer:</strong> {course.educator?.name }</p>
                
                <p><strong>Date Issued:</strong> {currentDate}</p>
              
                <p><strong>Completion:</strong> {completionPercentage.toFixed(1)}%</p>
                <p><strong>Status:</strong> {isCompleted ? 
                    "Completed" : 
                    `${completedLectures}/${totalLectures} lectures completed`}
                </p>
                
                {isCompleted && (
                    <>
                        <p>
                            🔹 <strong>Blockchain Transaction:</strong> 
                            <a href="#" className="text-blue-600 hover:underline ml-1">View on Explorer</a>
                        </p>
                        <p>
                            🔹 <strong>Download PDF:</strong> 
                            <a href="#" className="text-blue-600 hover:underline ml-1">Download Here</a>
                        </p>
                        <p>
                            🔹 <strong>Course Rating:</strong> {
                                course.courseRatings && course.courseRatings.length > 0 
                                    ? `${(course.courseRatings.reduce((sum, r) => sum + r.rating, 0) / course.courseRatings.length).toFixed(1)}/5.0`
                                    : "Not rated yet"
                            }
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Certificate;

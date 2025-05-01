import React from 'react';
import { FaStar, FaEnvelope, FaHeart, FaUser, FaLinkedin, FaYoutube, FaLink } from 'react-icons/fa';
import Footer from '../../components/student/Footer';
import CourseCard from '../../components/student/CourseCard';
import { useLocation } from 'react-router-dom';

const EducatorDetail = () => {
  const location = useLocation();
  const educatorData = location.state?.educatorData;
  

  const totalStudents = educatorData?.totalStudents || 0;
  const totalCourses = educatorData?.totalCourses || 0;
  const totalCertificates = educatorData?.totalCertificates || 0;
  const courses = educatorData?.courses || [];
  const email = educatorData?.user?.email || '';

  const getStudentDescription = () => {
    if (totalStudents === 0) return "Just starting teaching journey";
    if (totalStudents < 10) return `Teaches ${totalStudents} students`;
    if (totalStudents < 100) return `Teaches dozens of students`;
    return `Teaches over ${totalStudents} students around the world`;
  };

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-green-100/70 to-white z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start bg-purple-100 p-6 rounded-lg shadow gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase">Instructor</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{educatorData.user.name}</h1>
            <p className="text-lg text-gray-700 mt-1">{getStudentDescription()}</p>

            <div className="flex space-x-4 md:space-x-8 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                <p className="text-gray-600 text-sm">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
                <p className="text-gray-600 text-sm">Certificates Issued</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center w-full md:w-auto">
            <img 
              src={educatorData.user.imageUrl || '/default-avatar.png'}
              alt="Instructor" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            />
            <div className="flex space-x-2 md:space-x-4 mt-4">
              <button 
                onClick={() => window.open(`mailto:${email}`, '_blank')}
                className="border border-purple-500 p-2 rounded-lg text-purple-500 hover:bg-purple-100 transition-colors duration-200"
                title={email ? `Email: ${email}` : "No email available"}
              >
                <FaEnvelope />
              </button>
              <button 
              onClick={() => window.open(`https://www.linkedin.com/in/${educatorData.user.linkedin}`, '_blank')}
              className="border border-blue-500 p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors duration-200">
                <FaLinkedin />
              </button>
              <button 
              onClick={() => window.open(`https://www.youtube.com/channel/${educatorData.user.youtube}`, '_blank')}
              className="border border-red-500 p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors duration-200">
                <FaYoutube />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">About me</h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            {educatorData.bio || `Hi, I'm ${educatorData.user.name}. I'm passionate about teaching and sharing my knowledge with students. 
            ${totalCourses > 0 ? `Currently, I have ${totalCourses} course${totalCourses > 1 ? 's' : ''} available.` : 'I\'m currently working on my first course.'} 
            My goal is to make learning accessible and enjoyable for everyone.`}
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            My Courses {courses.length > 0 ? `(${courses.length})` : ''}
          </h2>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((course, index) => (
                <CourseCard key={course._id || index} course={course}/>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700">No courses yet</h3>
              <p className="text-gray-500 mt-2">
                This educator hasn't published any courses yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default EducatorDetail;
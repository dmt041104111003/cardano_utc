import React from 'react';
import { FaStar, FaHeart, FaUser, FaLinkedin, FaYoutube, FaLink } from 'react-icons/fa';
import Footer from '../../components/student/Footer';
import CourseCard from '../../components/student/CourseCard';
const EducatorDetail = () => {
  return (
    <div className="relative">
      {/* <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-cyan-100/70 to-white z-0" /> */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start bg-purple-100 p-6 rounded-lg shadow">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase">Instructor</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Denis Panjuta</h1>
            <p className="text-lg text-gray-700 mt-1">Teaches over 500,000 students to code</p>

            <div className="flex space-x-8 mt-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">532,018</p>
                <p className="text-gray-600 text-sm">Total learners</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">105,012</p>
                <p className="text-gray-600 text-sm">Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              alt="Instructor" 
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex space-x-4 mt-4">
              <button className="border border-purple-500 p-2 rounded-lg text-purple-500 hover:bg-purple-100">
                <FaLink />
              </button>
              <button className="border border-blue-500 p-2 rounded-lg text-blue-500 hover:bg-purple-100">
                <FaLinkedin />
              </button>
              <button className="border border-red-500 p-2 rounded-lg text-red-500 hover:bg-red-100">
                <FaYoutube />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">About me</h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            Hi. I'm Denis. I have a degree in engineering from the University for Applied Science Konstanz in Germany and discovered my love for programming there.
            <br /><br />
            Currently, over 500,000 students learn from my courses. This gives me much energy to create new courses with the highest quality possible. I aim to make learning to code accessible for everyone, as I am convinced, that IT is THE FUTURE!
            <br /><br />
            So join my courses and learn to create apps, games, websites, or any other type of application. The possibilities are limitless.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">My Courses (45)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, idx) => (
              <CourseCard course={null}/>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default EducatorDetail;

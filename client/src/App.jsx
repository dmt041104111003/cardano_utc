// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Routes, Route, useMatch } from 'react-router-dom';
import Home from './pages/student/Home.jsx';
import CoursesList from './pages/student/CoursesList';
import CourseDetails from './pages/student/CourseDetails';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';
import Loading from './components/student/Loading';
import Educator from './pages/educator/Educator';
import Dashboard from './pages/educator/Dashboard';
import AddCourse from './pages/educator/AddCourse';
import MyCourses from './pages/educator/MyCourses';
import StudentsEnrolled from './pages/educator/StudentsEnrolled';
import Navbar from './components/student/Navbar.jsx';
import "quill/dist/quill.snow.css";
import ProfileDetail from './pages/student/ProfileDetail.jsx';
import NotificationPage from './pages/educator/NotificationPage.jsx';
import EditCourse from './pages/educator/Editcourse.jsx';
import PaymentPage from './pages/student/PaymentPage.jsx';
import CertificateViewer from './pages/student/CertificateViewer';
import Subscription from './pages/educator/Subscription';
import TransactionChecker from './components/student/TransactionChecker';
import Violations from './pages/educator/Violations';


const App = () => {

  const isEducatorRoute = useMatch('/educator/*');

  return (
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/course-list' element={<CoursesList />} />
        <Route path='/course-list/:input' element={<CoursesList />} />
        <Route path='/course/:id' element={<CourseDetails />} />
        <Route path='/my-enrollments' element={<MyEnrollments />} />
        <Route path='/my-profile' element={<ProfileDetail />} />
        <Route path='/player/:courseId' element={<Player />} />
        <Route path='/payment/:courseId' element={<PaymentPage />} />
        <Route path='/loading/:path' element={<Loading />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/certificate/:txHash" element={<CertificateViewer />} />
        <Route path="/verify" element={<TransactionChecker />} />


        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
          <Route path='notification' element={<NotificationPage />} />
          <Route path='edit-course' element={<EditCourse />} />
          <Route path='subscription' element={<Subscription />} />
          <Route path='violations' element={<Violations />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

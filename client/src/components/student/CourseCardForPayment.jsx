import { FaStar, FaHeart, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function CourseItem({ course }) {
  const navigate = useNavigate();
  if (!course) return null;
  return (
    <div
      className="flex items-start gap-4 py-4 border-b max-w-3xl cursor-pointer hover:bg-gray-50 transition"
      onClick={() => navigate(`/course/${course._id}`)}
    >
      <img
        src={course.courseThumbnail || "https://via.placeholder.com/80x80"}
        alt={course.courseTitle}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold text-base">
          {course.courseTitle}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          {course.isBestseller && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
              Bestseller
            </span>
          )}
          {course.totalHours && (
            <span className="font-semibold">{course.totalHours} total hours</span>
          )}
          {course.updatedAt && (
            <span>• Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="font-bold text-base">
              {course.courseRatings && course.courseRatings.length > 0
                ? (
                    (course.courseRatings.reduce((sum, r) => sum + r.rating, 0) / course.courseRatings.length).toFixed(1)
                  )
                : '0.0'}
            </span>
            <FaStar size={14} />
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FaUser size={14} />
            <span>{course.enrolledStudents ? course.enrolledStudents.length : 0}</span>
          </div>
          <div className="font-bold text-lg text-gray-800">
            {course.coursePrice ? `${course.coursePrice} ADA` : ''}
          </div>
        </div>
      </div>
      <div className="text-purple-500">
        <FaHeart size={24} />
      </div>
    </div>
  );
}

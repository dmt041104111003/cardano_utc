import { FaStar, FaHeart, FaUser } from 'react-icons/fa';

export default function CourseItem() {
  return (
    <div className="flex items-start gap-4 py-4 border-b max-w-3xl">

      <img
        src="https://randomuser.me/api/portraits/men/1.jpg"
        alt="Course Thumbnail"
        className="w-20 h-20 rounded-lg object-cover"
      />

     
      <div className="flex-1">
        <h3 className="font-bold text-base">
          The Complete Android 15 Course [Part 1] - Master Java & Kotlin
        </h3>

 
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
            Bestseller
          </span>
          <span className="font-semibold">65.5 total hours</span>
          <span>• Updated 2/2025</span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="font-bold text-base">4.5</span>
            <FaStar size={14} />
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FaUser size={14} />
            <span>56,730</span>
          </div>
          <div className="font-bold text-lg text-gray-800">
            ₫1,649,000
          </div>
        </div>
      </div>

      <div className="text-purple-500">
        <FaHeart size={24} />
      </div>
    </div>
  );
}

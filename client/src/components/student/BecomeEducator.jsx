/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const BecomeEducatorPage = () => {
  const context = useContext(AppContext);

  const handleApplyNow = () => {
    context.setIsEducator(true); 
  };

  return (
    <div className="relative flex justify-center items-center ">
      <div className="relative p-6 z-10 inline-flex flex-col items-start max-w-fit">
        <h1 className="text-6xl font-bold mb-4 mx-0 font-serif whitespace-pre-line text-blue-800">
          Become <br /> an Educator
        </h1>
        <p className="mb-4 max-w-sm px-2 text-blue-800">
          Becoming an educator allows you to share your knowledge and skills
          with students around the world.
        </p>
        <button
          onClick={handleApplyNow} 
          className="px-8 mt-4 bg-blue-500 text-white py-2 rounded-3xl hover:bg-blue-600 transition-colors"
        >
          Apply Now!
        </button>
      </div>
    </div>
  );
};

export default BecomeEducatorPage;

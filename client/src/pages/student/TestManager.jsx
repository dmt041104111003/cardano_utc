import React from 'react';

const TestManager = ({
  testData,
  timeLeft,
  setTimeLeft,
  timer,
  setTimer,
  selectedAnswers,
  setSelectedAnswers,
  testResult,
  setTestResult,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  exitAttempted,
  setExitAttempted,
  handleNextQuestion,
  handlePreviousQuestion,
  handleSubmitTest,
  handleTestFailure,
  testContainerRef,
  videoRef,
  canvasRef,
  isFaceDetected,
  handleCloseTest,
  handleAnswerSelect,
  formatTime
}) => {
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-white to-blue-50 z-50 overflow-y-auto"
      ref={testContainerRef}
    >
      <div className="max-w-4xl mx-auto p-4 md:p-6 h-full">
        <div className="fixed bottom-4 left-4 w-48 h-36 border-2 border-gray-700 rounded-lg overflow-hidden z-50 bg-black">
          <video ref={videoRef} className="w-full h-full object-cover absolute top-0 left-0" autoPlay muted playsInline></video>
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
          <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-bl-md">
            {isFaceDetected ? 
              <span className="text-green-400">Face Detected</span> : 
              <span className="text-red-400">No Face</span>
            }
          </div>
        </div>
        <div className="bg-white rounded-t-xl p-5 border-b border-blue-200 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-1 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {testData.title}
              </h2>
              <div className="flex items-center space-x-4">
                <p className="text-blue-600 text-sm md:text-base flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  Chapter {testData.chapterNumber} • {testData.questions.length} Questions
                </p>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                  Test Code: {testData.testId}
                </div>
              </div>
            </div>
            
            <div className={`mt-3 md:mt-0 px-5 py-3 rounded-lg ${
              timeLeft < 60 
                ? 'bg-red-50 text-red-600 animate-pulse shadow-md border border-red-200' 
                : 'bg-blue-50 text-blue-600 shadow border border-blue-200'
            } text-center transition-all duration-300`}>
              <p className="text-xs uppercase font-semibold mb-1 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Time Remaining
              </p>
              <p className="text-xl md:text-2xl font-mono font-bold">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span>Security: Exiting fullscreen mode or switching tabs will result in test failure.</span>
          </div>
        </div>

        <div className="py-6 px-4 md:px-6 bg-white rounded-b-xl shadow-md">
          {testResult ? (
            <div className="bg-white rounded-xl p-8 text-center border border-blue-200 shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
              <div className={`text-6xl mb-6 mx-auto ${testResult.passed ? 'text-green-500' : 'text-red-500'}`}>
                {testResult.passed ? (
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-blue-800">
                {testResult.passed ? 'Congratulations!' : 'Test Failed'}
              </h3>
              <p className="text-blue-600 mb-6 text-lg">
                {testResult.passed
                  ? `You passed with a score of ${testResult.score}%`
                  : `Your score was ${testResult.score}%. Required: ${testData.passingScore}%`}
              </p>
              <div className="mb-8 max-w-md mx-auto">
                <div className="h-5 w-full bg-blue-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${testResult.passed ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
                    style={{ width: `${testResult.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-blue-500 font-medium">
                  <span>0%</span>
                  <span className="text-blue-700 font-semibold">{testData.passingScore}% to pass</span>
                  <span>100%</span>
                </div>
              </div>
              <button
                onClick={handleCloseTest}
                className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                  testResult.passed 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 rounded-full px-4 py-2 inline-flex items-center border border-blue-200">
                  <span className="text-blue-800 font-medium">Question</span>
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-2">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-blue-800 font-medium">of {testData.questions.length}</span>
                </div>
              </div>
              
              {testData.questions.map((question, qIndex) => (
                <div 
                  key={qIndex} 
                  className={`mb-8 transition-opacity duration-300 ${currentQuestionIndex === qIndex ? 'opacity-100' : 'opacity-0 hidden'}`}
                >
                  <div className="mb-6">
                    <div className="flex items-start mb-6">
                      <div className="bg-blue-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        {qIndex + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-blue-800 leading-relaxed">
                        {question.text}
                      </h3>
                    </div>
                    
                    {question.type === 'multiple_choice' ? (
                      <div className="space-y-3 mt-4">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                              selectedAnswers[qIndex]?.includes(oIndex)
                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.01]'
                                : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 transition-all duration-200 ${
                                selectedAnswers[qIndex]?.includes(oIndex)
                                  ? 'border-blue-500 bg-blue-500 scale-110'
                                  : 'border-blue-400'
                              }`}>
                                {selectedAnswers[qIndex]?.includes(oIndex) && (
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              <span className="text-blue-800 text-lg">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-blue-800 shadow-sm focus:shadow-md"
                        rows={6}
                        value={selectedAnswers[qIndex] || ''}
                        onChange={(e) => handleAnswerSelect(qIndex, null, e.target.value)}
                        placeholder="Enter your answer here"
                      />
                    )}
                    {question.note && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm text-blue-600 italic">{question.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="sticky bottom-0 pt-6 pb-2 border-t border-blue-200 mt-6" style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)'}}>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 text-lg
                  ${currentQuestionIndex === 0 
                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1'
                  }`}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </span>
              </button>
              
              {currentQuestionIndex < testData?.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <span className="flex items-center">
                    Next
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <span className="flex items-center">
                    Submit
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </span>
                </button>
              )}
            </div>
            
            <div className="flex justify-center mt-6 space-x-3 pb-2">
              {testData?.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentQuestionIndex 
                      ? 'bg-blue-600 scale-125 shadow-sm' 
                      : 'bg-blue-200 hover:bg-blue-300'
                  } ${selectedAnswers[index] || selectedAnswers[index] === '' 
                      ? 'ring-2 ring-blue-400' 
                      : ''
                  }`}
                  aria-label={`Go to question ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManager;

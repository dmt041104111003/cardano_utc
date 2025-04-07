import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Timer from "../../components/student/Timer";
import axios from "axios";
import Swal from "sweetalert2";

const TestPage = () => {
    const { courseId, testId } = useParams();
    const { backendUrl, getToken } = useContext(AppContext);
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    // Initialize answers state as arrays
    const [answers, setAnswers] = useState(() => {
        if (!test || !test.questions) return {};
        return test.questions.reduce((acc, q) => {
            acc[q._id || q.questionId] = [];
            return acc;
        }, {});
    });
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeUp, setTimeUp] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                console.log('Fetching test with params:', { courseId, testId }); // Debug log
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/course/${courseId}/test/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Test data received:', data); // Debug log
                if (data.success && data.test) {
                    setTest(data.test);
                    // Initialize answers as empty arrays
                    const initialAnswers = data.test.questions.reduce((acc, q) => {
                        acc[q._id || q.questionId] = [];
                        return acc;
                    }, {});
                    setAnswers(initialAnswers);
                    console.log('Initialized answers:', initialAnswers); // Debug log
                } else {
                    throw new Error('Invalid test data received');
                }
            } catch (error) {
                console.error('Lỗi khi lấy bài kiểm tra:', error);
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Không thể tải bài kiểm tra. Vui lòng thử lại sau.',
                    icon: 'error'
                });
            }
        };

        if (courseId && testId) {
            fetchTest();
        }
    }, [courseId, testId, backendUrl, getToken]);

    const handleNext = () => {
        if (currentQuestion < test.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleAnswerSelect = (questionId, option) => {
        console.log('Selecting answer:', { questionId, option }); // Debug log
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            let newAnswers;
            
            // Nếu đã chọn option này rồi thì bỏ chọn
            if (currentAnswers.includes(option)) {
                newAnswers = {
                    ...prev,
                    [questionId]: currentAnswers.filter(ans => ans !== option)
                };
            } else {
                // Nếu chưa chọn thì thêm vào
                newAnswers = {
                    ...prev,
                    [questionId]: [...currentAnswers, option]
                };
            }
            
            console.log('New answers state:', newAnswers); // Debug log
            return newAnswers;
        });
    };

    const handleTimeUp = () => {
        setTimeUp(true);
        handleSubmit();
    };

    const handleSubmit = async () => {
        if (submitted) return;

        try {
            const token = await getToken();
            const response = await axios.post(
                `${backendUrl}/api/course/${courseId}/test/${testId}/submit`,
                { answers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setScore(response.data.score);
            setSubmitted(true);

            Swal.fire({
                title: 'Đã nộp bài!',
                text: `Điểm của bạn: ${response.data.score}/100`,
                icon: 'success',
                confirmButtonText: 'Xem kết quả'
            }).then(() => {
                navigate(`/course/${courseId}`);
            });
        } catch (error) {
            console.error('Lỗi khi nộp bài:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Không thể nộp bài. Vui lòng thử lại.',
                icon: 'error'
            });
        }
    };

    console.log('Current test state:', test); // Debug log

    if (!test) return <div className="text-center mt-10">Đang tải bài kiểm tra...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">{test.testTitle || 'Bài kiểm tra'}</h1>
                {test.testDuration && <Timer duration={test.testDuration} onTimeUp={handleTimeUp} />}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {test.questions && test.questions[currentQuestion] && (
                    <div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">
                                Câu hỏi {currentQuestion + 1} / {test.questions.length}
                            </h3>
                            <p className="mt-2">{test.questions[currentQuestion].questionText || 'Không có nội dung câu hỏi'}</p>
                        </div>

                        <div className="space-y-2">
                            {test.questions[currentQuestion].options?.map((option, idx) => {
                                const question = test.questions[currentQuestion];
                                const questionId = question._id || question.questionId || `question-${idx}`;
                                const isChecked = answers[questionId] === option;
                                console.log('Rendering option:', { questionId, option, isChecked }); // Debug log
                                return (
                                    <label key={idx} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={answers[questionId]?.includes(option)}
                                            onChange={() => handleAnswerSelect(questionId, option)}
                                            disabled={submitted}
                                            className="form-checkbox"
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestion === 0 || submitted}
                        className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
                    >
                        Câu trước
                    </button>
                    
                    {currentQuestion === test.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitted}
                            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                        >
                            Nộp bài
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={submitted}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            Câu tiếp
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestPage;

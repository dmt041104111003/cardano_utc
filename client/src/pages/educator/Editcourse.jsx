/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";
import * as XLSX from "xlsx";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

// Component Popup
const Popup = ({ title, onClose, children }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            {children}
            <img
                src={assets.cross_icon}
                alt="Close"
                onClick={onClose}
                className="absolute top-4 right-4 w-4 cursor-pointer"
            />
        </div>
    </div>
);

// Component Chapter
const Chapter = ({ chapter, index, handleChapter, handleLecture }) => (
    <div className="bg-white border rounded-lg mb-4">
        <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
                <img
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
                    src={assets.dropdown_icon}
                    alt="Dropdown"
                    width={14}
                />
                <span className="font-semibold">
                    {index + 1}. {chapter.chapterTitle}
                </span>
            </div>
            <span>{chapter.chapterContent.length} Lectures</span>
            <img
                onClick={() => handleChapter("remove", chapter.chapterId)}
                src={assets.cross_icon}
                alt="Remove"
                className="cursor-pointer"
            />
        </div>
        {!chapter.collapsed && (
            <div className="p-4">
                {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div className="flex justify-between items-center mb-2" key={lectureIndex}>
                        <span>
                            {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{" "}
                            <a href={lecture.lectureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                Link
                            </a>{" "}
                            - {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                        </span>
                        <img
                            src={assets.cross_icon}
                            alt="Remove"
                            className="cursor-pointer"
                            onClick={() => handleLecture("remove", chapter.chapterId, lectureIndex)}
                        />
                    </div>
                ))}
                <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                >
                    + Add Lecture
                </div>
            </div>
        )}
    </div>
);

// Component Test
const Test = ({ test, index, handleTest, handleChapter }) => (
    <div className="bg-white border rounded-lg mb-4">
        <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
                <img
                    onClick={() => handleChapter("toggle", test.testId)}
                    className={`mr-2 cursor-pointer transition-all ${test.collapsed && "-rotate-90"}`}
                    src={assets.dropdown_icon}
                    alt="Dropdown"
                    width={14}
                />
                <span className="font-semibold">{test.testName}</span>
            </div>
            <span>{test.testContent.length} Test</span>
            <img
                onClick={() => handleChapter("removeTest", test.testId)}
                src={assets.cross_icon}
                alt="Remove"
                className="cursor-pointer"
            />
        </div>
        {!test.collapsed && (
            <div className="p-4">
                {test.testContent.map((testDetail, testIndex) => (
                    <div className="flex justify-between items-center mb-2" key={testIndex}>
                        <span>
                            {testIndex + 1}. {testDetail.testTitle} - {testDetail.testDuration} min -{" "}
                            {testDetail.testQuestions.length} questions
                        </span>
                        <img
                            src={assets.cross_icon}
                            alt="Remove"
                            className="cursor-pointer"
                            onClick={() => handleTest("remove", test.testId, testIndex)}
                        />
                    </div>
                ))}
                <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => handleTest("add", test.testId)}
                >
                    + Add Test
                </div>
            </div>
        )}
    </div>
);

// Component ConfirmModal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDeleteAll = false }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">{title || "Delete Course"}</h3>
                <p className="text-gray-600 mb-6">{message || "Are you sure you want to delete this course?"}</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`px-4 py-2 ${isDeleteAll ? 'bg-red-600' : 'bg-red-500'} text-white hover:bg-red-600 rounded`}
                    >
                        {isDeleteAll ? "Delete All" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditCourse = () => {
    const { backendUrl, getToken } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [course, setCourse] = useState(null);
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [coursePrice, setCoursePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountEndTime, setDiscountEndTime] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [courseThumbnail, setCourseThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAddLecture, setShowAddLecture] = useState(false);
    const [showAddTest, setShowAddTest] = useState(false);
    const [showEditTest, setShowEditTest] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [tests, setTests] = useState([]);
    const [testForm, setTestForm] = useState({
        testId: "",
        title: "",
        chapterNumber: 0,
        duration: 30,
        passingScore: 70,
        type: "multiple_choice",
        questions: []
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [showUnstopConfirm, setShowUnstopConfirm] = useState(false);
    const [showUnstopAllConfirm, setShowUnstopAllConfirm] = useState(false);
    const [isQuillReady, setIsQuillReady] = useState(false);
    const quillRef = useRef(null);
    const descriptionRef = useRef(null);

    // Fetch courses
    const fetchCourses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setCourses(data.courses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Load course data
    const loadCourseData = (course) => {
        setSelectedCourseId(course._id);
        setCourseTitle(course.courseTitle);
        setCoursePrice(course.coursePrice);
        setDiscount(course.discount);
        setDiscountEndTime(course.discountEndTime);
        setPaypalEmail(course.paypalEmail || "");
        setThumbnailPreview(course.courseThumbnail);
        setCourse(course);
        setIsEditMode(true);
        
        // Tải thông tin bài kiểm tra
        if (course.tests && course.tests.length > 0) {
            setTests(course.tests);
        } else {
            setTests([]);
        }

        // Chờ Quill sẵn sàng trước khi load dữ liệu
        const loadDescription = () => {
            if (quillRef.current && isQuillReady) {
                quillRef.current.root.innerHTML = course.courseDescription;
            } else {
                setTimeout(loadDescription, 100);
            }
        };

        loadDescription();
    };

    // Handle file upload for test questions
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type;
        const reader = new FileReader();
        reader.onerror = () => toast.error("Lỗi khi đọc file");

        // Xử lý file Excel
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.onload = (event) => {
                try {
                    const data = event.target.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    const questions = jsonData.map((row) => ({
                        question: row[0],
                        options: row.slice(1),
                    }));

                    // setTestDetail({ ...testDetail, testQuestions: questions });
                    toast.success('Tải file Excel thành công');
                } catch (error) {
                    toast.error('Lỗi khi đọc file Excel: ' + error.message);
                }
            };
            reader.readAsBinaryString(file);
        }
        // Xử lý file PDF và ảnh
        else if (fileType.startsWith('image/') || fileType === 'application/pdf') {
            reader.onload = (event) => {
                try {
                    const fileContent = event.target.result;
                    // Lưu nội dung file vào state
                    // setTestDetail({
                    //     ...testDetail,
                    //     fileContent: fileContent,
                    //     fileType: fileType,
                    //     fileName: file.name
                    // });
                    toast.success('Tải file thành công');
                } catch (error) {
                    toast.error('Lỗi khi đọc file: ' + error.message);
                }
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Loại file không được hỗ trợ');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!selectedCourseId) {
            return toast.error("Please select a course to update");
        }
        
        try {
            const token = await getToken();
            
            // Lấy nội dung từ Quill editor
            const courseDescription = quillRef.current ? quillRef.current.root.innerHTML : "";
            
            // Tạo object chứa thông tin cập nhật
            const courseData = {
                courseTitle,
                courseDescription,
                coursePrice: Number(coursePrice),
                discount: Number(discount),
                paypalEmail,
                tests: tests // Thêm thông tin bài kiểm tra
            };
            
            // Chỉ thêm discountEndTime khi có giảm giá
            if (Number(discount) > 0) {
                courseData.discountEndTime = discountEndTime;
            } else {
                courseData.discountEndTime = null; // Xóa thời gian giảm giá nếu không có giảm giá
            }

            const formData = new FormData();
            formData.append("courseId", selectedCourseId);
            formData.append("courseData", JSON.stringify(courseData));
            
            // Nếu có thumbnail mới, thêm vào formData
            if (courseThumbnail instanceof File) {
                formData.append("image", courseThumbnail);
            }

            // Gửi request cập nhật
            const { data } = await axios.put(
                `${backendUrl}/api/educator/update-course`, 
                formData, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (data.success) {
                toast.success("Course updated successfully");
                
                // Cập nhật danh sách khóa học
                const updatedCourses = courses.map(course => {
                    if (course._id === selectedCourseId) {
                        return { 
                            ...course, 
                            ...courseData,
                            isUpdated: true,
                            lastUpdated: new Date(),
                            courseThumbnail: data.course.courseThumbnail || course.courseThumbnail
                        };
                    }
                    return course;
                });
                
                setCourses(updatedCourses);
                
                // Reset form sau khi cập nhật thành công
                setIsEditMode(false);
                setSelectedCourseId("");
                setCourseTitle("");
                setCoursePrice(0);
                setDiscount(0);
                setDiscountEndTime("");
                setPaypalEmail("");
                setCourseThumbnail(null);
                setThumbnailPreview("");
                setTests([]);
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = "";
                }
            } else {
                toast.error(data.message || "Failed to update course");
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred");
        }
    };

    const handleDelete = async () => {
        if (!selectedCourseId) {
            return toast.error("No course selected to stop");
        }
        
        // Kiểm tra xem khóa học đã bị dừng chưa
        const selectedCourse = courses.find(course => course._id === selectedCourseId);
        if (selectedCourse && selectedCourse.isDeleted) {
            return toast.info("This course is already stopped");
        }
        
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.delete(`${backendUrl}/api/educator/delete-course/${selectedCourseId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { courseId: selectedCourseId },
            });

            if (data.success) {
                toast.success("Course stopped successfully");
                
                // Cập nhật trạng thái isDeleted trong danh sách courses
                const updatedCourses = courses.map(course => {
                    if (course._id === selectedCourseId) {
                        return { ...course, isDeleted: true };
                    }
                    return course;
                });
                setCourses(updatedCourses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error in handleDelete:", error);
            toast.error(error.message);
        }
        setShowDeleteConfirm(false);
    };
    
    const handleDeleteAll = () => {
        if (courses.length === 0) {
            return toast.error("No courses to stop");
        }
        
        // Kiểm tra xem còn khóa học nào chưa bị dừng không
        const activeCourses = courses.filter(course => !course.isDeleted);
        if (activeCourses.length === 0) {
            return toast.info("All courses are already stopped");
        }
        
        setShowDeleteAllConfirm(true);
    };
    
    const confirmDeleteAll = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.delete(`${backendUrl}/api/educator/delete-all-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("All courses stopped successfully");
                
                // Cập nhật trạng thái isDeleted cho tất cả khóa học
                const updatedCourses = courses.map(course => ({
                    ...course,
                    isDeleted: true
                }));
                setCourses(updatedCourses);
                
                // Cập nhật khóa học đang được chọn (nếu có)
                if (selectedCourseId) {
                    const selectedCourse = updatedCourses.find(course => course._id === selectedCourseId);
                    if (selectedCourse) {
                        loadCourseData(selectedCourse);
                    }
                }
            } else {
                toast.error(data.message || "Failed to stop all courses");
            }
        } catch (error) {
            console.error("Error in handleDeleteAll:", error);
            toast.error(error.message || "An error occurred while stopping all courses");
        }
        setShowDeleteAllConfirm(false);
    };

    const handleUnstop = async () => {
        if (!selectedCourseId) {
            return toast.error("No course selected to unstop");
        }
        
        // Kiểm tra xem khóa học có bị dừng không
        const selectedCourse = courses.find(course => course._id === selectedCourseId);
        if (selectedCourse && !selectedCourse.isDeleted) {
            return toast.info("This course is already active");
        }
        
        setShowUnstopConfirm(true);
    };

    const confirmUnstop = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`${backendUrl}/api/educator/unstop-course/${selectedCourseId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("Course has been successfully activated");
                
                // Cập nhật trạng thái isDeleted trong danh sách courses
                const updatedCourses = courses.map(course => {
                    if (course._id === selectedCourseId) {
                        return { ...course, isDeleted: false };
                    }
                    return course;
                });
                setCourses(updatedCourses);
                
                // Cập nhật khóa học đang được chọn
                const selectedCourse = updatedCourses.find(course => course._id === selectedCourseId);
                if (selectedCourse) {
                    loadCourseData(selectedCourse);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error in handleUnstop:", error);
            toast.error(error.message);
        }
        setShowUnstopConfirm(false);
    };

    const handleUnstopAll = () => {
        // Kiểm tra xem có khóa học nào bị dừng không
        const stoppedCourses = courses.filter(course => course.isDeleted);
        if (stoppedCourses.length === 0) {
            return toast.info("No stopped courses to activate");
        }
        
        setShowUnstopAllConfirm(true);
    };

    const confirmUnstopAll = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`${backendUrl}/api/educator/unstop-all-courses`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("All stopped courses have been successfully activated");
                
                // Cập nhật trạng thái isDeleted cho tất cả khóa học
                const updatedCourses = courses.map(course => ({
                    ...course,
                    isDeleted: false
                }));
                setCourses(updatedCourses);
                
                // Cập nhật khóa học đang được chọn (nếu có)
                if (selectedCourseId) {
                    const selectedCourse = updatedCourses.find(course => course._id === selectedCourseId);
                    if (selectedCourse) {
                        loadCourseData(selectedCourse);
                    }
                }
            } else {
                toast.error(data.message || "Failed to activate all courses");
            }
        } catch (error) {
            console.error("Error in handleUnstopAll:", error);
            toast.error(error.message || "An error occurred while activating all courses");
        }
        setShowUnstopAllConfirm(false);
    };

    // Hàm để mở modal chỉnh sửa bài kiểm tra
    const handleEditTest = (test) => {
        setSelectedTest(test);
        setTestForm({
            testId: test.testId,
            title: test.title || "",
            chapterNumber: test.chapterNumber,
            duration: test.duration,
            passingScore: test.passingScore,
            type: test.type || "multiple_choice",
            questions: test.questions || []
        });
        setShowEditTest(true);
    };

    // Hàm để lưu thay đổi bài kiểm tra
    const saveTestChanges = () => {
        // Kiểm tra xem đây là tạo mới hay chỉnh sửa
        if (selectedTest) {
            // Chỉnh sửa bài kiểm tra hiện có
            const updatedTests = tests.map(test => {
                if (test.testId === testForm.testId) {
                    return {
                        ...test,
                        title: testForm.title,
                        chapterNumber: testForm.chapterNumber,
                        duration: testForm.duration,
                        passingScore: testForm.passingScore,
                        type: testForm.type,
                        questions: testForm.questions
                    };
                }
                return test;
            });
            
            setTests(updatedTests);
            toast.success("Test updated successfully");
        } else {
            // Tạo bài kiểm tra mới
            const newTest = {
                testId: testForm.testId,
                title: testForm.title,
                chapterNumber: testForm.chapterNumber,
                duration: testForm.duration,
                passingScore: testForm.passingScore,
                type: testForm.type || "multiple_choice",
                questions: testForm.questions
            };
            
            setTests([...tests, newTest]);
            toast.success("New test added successfully");
        }
        
        // Cập nhật trường tests trong course
        setCourse(prev => ({
            ...prev,
            tests: selectedTest 
                ? tests.map(test => test.testId === testForm.testId 
                    ? { ...test, 
                        title: testForm.title,
                        chapterNumber: testForm.chapterNumber,
                        duration: testForm.duration,
                        passingScore: testForm.passingScore,
                        type: testForm.type,
                        questions: testForm.questions
                      } 
                    : test)
                : [...(prev?.tests || []), {
                    testId: testForm.testId,
                    title: testForm.title,
                    chapterNumber: testForm.chapterNumber,
                    duration: testForm.duration,
                    passingScore: testForm.passingScore,
                    type: testForm.type || "multiple_choice",
                    questions: testForm.questions
                  }]
        }));
        
        // Đóng modal và reset form
        setShowEditTest(false);
        setSelectedTest(null);
    };

    // Hàm để thêm câu hỏi mới
    const addQuestion = () => {
        setTestForm(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    questionText: "",
                    type: "multiple_choice",
                    options: ["", "", "", ""],
                    correctAnswers: [],
                    note: ""
                }
            ]
        }));
    };

    // Hàm để xóa câu hỏi
    const removeQuestion = (index) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    // Hàm để cập nhật thông tin câu hỏi
    const updateQuestion = (index, field, value) => {
        setTestForm(prev => {
            const updatedQuestions = [...prev.questions];
            updatedQuestions[index] = {
                ...updatedQuestions[index],
                [field]: value
            };
            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    // Hàm để cập nhật tùy chọn của câu hỏi
    const updateOption = (questionIndex, optionIndex, value) => {
        setTestForm(prev => {
            const updatedQuestions = [...prev.questions];
            const updatedOptions = [...updatedQuestions[questionIndex].options];
            updatedOptions[optionIndex] = value;
            updatedQuestions[questionIndex] = {
                ...updatedQuestions[questionIndex],
                options: updatedOptions
            };
            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    // Hàm để cập nhật đáp án đúng
    const updateCorrectAnswer = (questionIndex, optionIndex) => {
        setTestForm(prev => {
            const updatedQuestions = [...prev.questions];
            const currentCorrectAnswers = [...updatedQuestions[questionIndex].correctAnswers];
            const optionValue = updatedQuestions[questionIndex].options[optionIndex];
            
            // Kiểm tra xem đáp án đã được chọn chưa
            const isAlreadySelected = currentCorrectAnswers.includes(optionValue);
            
            let newCorrectAnswers;
            if (isAlreadySelected) {
                // Nếu đã chọn, loại bỏ khỏi danh sách
                newCorrectAnswers = currentCorrectAnswers.filter(ans => ans !== optionValue);
            } else {
                // Nếu chưa chọn, thêm vào danh sách
                newCorrectAnswers = [...currentCorrectAnswers, optionValue];
            }
            
            updatedQuestions[questionIndex] = {
                ...updatedQuestions[questionIndex],
                correctAnswers: newCorrectAnswers
            };
            
            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    useEffect(() => {
        fetchCourses();

        const initializeQuill = () => {
            if (descriptionRef.current && !quillRef.current) {
                quillRef.current = new Quill(descriptionRef.current, { theme: "snow" });
                setIsQuillReady(true);
            } else if (!descriptionRef.current) {
                setTimeout(initializeQuill, 100);
            }
        };
        initializeQuill();

        return () => {
            if (quillRef.current) {
                quillRef.current = null;
                setIsQuillReady(false);
            }
        };
    }, []);

    return (
        <div className="min-h-screen overflow-auto flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white">
            <div className="w-full">
                <div className='flex items-center gap-3 mb-6'>
                    <div className="h-10 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h1 className='text-2xl font-bold text-gray-800'>Edit Course</h1>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                        </svg>
                        Course Selection
                    </h2>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <select
                            className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            onChange={(e) => {
                                const selectedCourse = courses.find((c) => c._id === e.target.value);
                                if (selectedCourse) loadCourseData(selectedCourse);
                            }}
                        >
                            <option value="">Select a course to edit</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.courseTitle} {course.isDeleted ? "(Stopped)" : ""}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            type="button"
                            onClick={handleDeleteAll}
                            disabled={courses.length === 0 || courses.every(course => course.isDeleted)}
                            className={`px-4 py-2.5 rounded-lg ${
                                courses.length === 0 || courses.every(course => course.isDeleted)
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                            } text-white transition-colors shadow-sm font-medium text-sm`}
                        >
                            {courses.every(course => course.isDeleted) ? 'All Courses Stopped' : 'Stop All Courses'}
                        </button>
                        <button
                            type="button"
                            onClick={handleUnstopAll}
                            disabled={courses.length === 0 || courses.every(course => !course.isDeleted)}
                            className={`px-4 py-2.5 rounded-lg ${
                                courses.length === 0 || courses.every(course => !course.isDeleted)
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white transition-colors shadow-sm font-medium text-sm`}
                        >
                            {courses.every(course => !course.isDeleted) ? 'All Courses Active' : 'Activate All Courses'}
                        </button>
                    </div>
                </div>

                {selectedCourseId && (
                    <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 w-full">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                            </svg>
                            Course Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-gray-700">Course Title</label>
                                <input
                                    onChange={(e) => setCourseTitle(e.target.value)}
                                    value={courseTitle}
                                    type="text"
                                    placeholder="Course title"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    disabled
                                    required
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-gray-700">Course Price</label>
                                <input
                                    onChange={(e) => setCoursePrice(e.target.value)}
                                    value={coursePrice}
                                    type="number"
                                    min="0"
                                    placeholder="Enter price"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div ref={descriptionRef}></div>
                                {!isQuillReady && <p className="text-red-500 p-3">Loading editor, please wait...</p>}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                                <input
                                    onChange={(e) => setDiscount(e.target.value)}
                                    value={discount}
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Enter discount percentage"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    required
                                />
                            </div>
                            
                            {Number(discount) > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-700">Discount End Time</label>
                                    <input
                                        onChange={(e) => setDiscountEndTime(e.target.value)}
                                        value={discountEndTime}
                                        type="datetime-local"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-gray-700">Paypal Email <span className="text-gray-500 text-sm">(optional)</span></label>
                                <input
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    value={paypalEmail}
                                    type="email"
                                    placeholder="Enter PayPal email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="thumbnailImage"
                                        className="cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            id="thumbnailImage"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCourseThumbnail(e.target.files[0]);
                                                    setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                            Choose Image
                                        </div>
                                    </label>
                                    <div className="h-16 w-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img
                                            className="max-h-full max-w-full object-contain"
                                            src={
                                                thumbnailPreview || 
                                                (selectedCourseId && courses.find(c => c._id === selectedCourseId)?.courseThumbnail) ||
                                                assets.placeholder_image
                                            }
                                            alt="Thumbnail"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                </svg>
                                Tests
                            </h2>
                            <div className="flex justify-end mb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTestForm({
                                            testId: uniqid(),
                                            title: "",
                                            chapterNumber: 0,
                                            duration: 30,
                                            passingScore: 70,
                                            type: "multiple_choice",
                                            questions: []
                                        });
                                        setShowEditTest(true);
                                        setSelectedTest(null);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                                    </svg>
                                    Add New Test
                                </button>
                            </div>
                            {tests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tests.map((test, index) => (
                                        <div key={test.testId} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-medium text-lg text-gray-800">
                                                    {test.title || `Test ${index + 1}`}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditTest(test)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                                    </svg>
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                                    </svg>
                                                    <span>Passing Score: {test.passingScore}%</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                                    </svg>
                                                    <span>Questions: {test.questions.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <p className="text-gray-600">No tests added yet.</p>
                                    <p className="text-sm text-gray-500 mt-1">Click "Add New Test" to create your first test.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                                UPDATE COURSE
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={selectedCourseId && courses.find(c => c._id === selectedCourseId)?.isDeleted}
                                className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors shadow-sm ${
                                    selectedCourseId && courses.find(c => c._id === selectedCourseId)?.isDeleted 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                </svg>
                                {selectedCourseId && courses.find(c => c._id === selectedCourseId)?.isDeleted 
                                    ? 'ALREADY STOPPED' 
                                    : 'STOP COURSE'}
                            </button>
                            <button
                                type="button"
                                onClick={handleUnstop}
                                disabled={selectedCourseId && !courses.find(c => c._id === selectedCourseId)?.isDeleted}
                                className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors shadow-sm ${
                                    selectedCourseId && !courses.find(c => c._id === selectedCourseId)?.isDeleted 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"></path>
                                </svg>
                                {selectedCourseId && !courses.find(c => c._id === selectedCourseId)?.isDeleted 
                                    ? 'ACTIVE' 
                                    : 'ACTIVATE COURSE'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
            />
            <ConfirmModal
                isOpen={showDeleteAllConfirm}
                onClose={() => setShowDeleteAllConfirm(false)}
                onConfirm={confirmDeleteAll}
                title="Stop All Courses"
                message="Are you sure you want to stop ALL courses? This action cannot be undone."
                isDeleteAll={true}
            />
            <ConfirmModal
                isOpen={showUnstopConfirm}
                onClose={() => setShowUnstopConfirm(false)}
                onConfirm={confirmUnstop}
                title="Activate Course"
                message="Are you sure you want to activate this course?"
            />
            <ConfirmModal
                isOpen={showUnstopAllConfirm}
                onClose={() => setShowUnstopAllConfirm(false)}
                onConfirm={confirmUnstopAll}
                title="Activate All Courses"
                message="Are you sure you want to activate ALL courses?"
                isDeleteAll={true}
            />
            
            {/* Modal chỉnh sửa bài kiểm tra */}
            {showEditTest && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Edit Test</h2>
                            <button 
                                onClick={() => setShowEditTest(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <img src={assets.cross_icon} alt="Close" className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                                    <input
                                        type="text"
                                        value={testForm.title}
                                        onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                                        className="w-full border rounded-md px-3 py-2"
                                        placeholder="Enter test title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Number</label>
                                    <select
                                        value={testForm.chapterNumber}
                                        onChange={(e) => setTestForm({...testForm, chapterNumber: Number(e.target.value)})}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="0">Final Test</option>
                                        {course?.courseContent?.map((chapter, index) => (
                                            <option key={chapter.chapterId} value={index + 1}>
                                                Chapter {index + 1}: {chapter.chapterTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={testForm.duration}
                                        onChange={(e) => setTestForm({...testForm, duration: Number(e.target.value)})}
                                        className="w-full border rounded-md px-3 py-2"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        value={testForm.passingScore}
                                        onChange={(e) => setTestForm({...testForm, passingScore: Number(e.target.value)})}
                                        className="w-full border rounded-md px-3 py-2"
                                        min="1"
                                        max="100"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-medium">Questions</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Add Question
                                    </button>
                                </div>
                                
                                {testForm.questions.length === 0 ? (
                                    <p className="text-gray-500 italic">No questions added yet</p>
                                ) : (
                                    <div className="space-y-6">
                                        {testForm.questions.map((question, qIndex) => (
                                            <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                                        <input
                                                            type="text"
                                                            value={question.questionText}
                                                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                                            className="w-full border rounded-md px-3 py-2"
                                                            placeholder="Enter question text"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        <img src={assets.cross_icon} alt="Remove" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                        className="w-full border rounded-md px-3 py-2"
                                                    >
                                                        <option value="multiple_choice">Multiple Choice</option>
                                                        <option value="essay">Essay</option>
                                                    </select>
                                                </div>
                                                
                                                {question.type === 'multiple_choice' && (
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                                                        <div className="space-y-2">
                                                            {question.options.map((option, oIndex) => (
                                                                <div key={oIndex} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={question.correctAnswers.includes(option)}
                                                                        onChange={() => updateCorrectAnswer(qIndex, oIndex)}
                                                                        className="mr-2"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                        className="flex-1 border rounded-md px-3 py-1"
                                                                        placeholder={`Option ${oIndex + 1}`}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updatedQuestions = [...testForm.questions];
                                                                            updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
                                                                            setTestForm({...testForm, questions: updatedQuestions});
                                                                        }}
                                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                                    >
                                                                        <img src={assets.cross_icon} alt="Remove" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedQuestions = [...testForm.questions];
                                                                    updatedQuestions[qIndex].options = [...updatedQuestions[qIndex].options, ""];
                                                                    setTestForm({...testForm, questions: updatedQuestions});
                                                                }}
                                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                                                            >
                                                                Add Option
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">Check the boxes for correct answers</p>
                                                    </div>
                                                )}
                                                
                                                {question.type === 'essay' && (
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Essay Answer (for reference)</label>
                                                        <textarea
                                                            value={question.essayAnswer || ''}
                                                            onChange={(e) => updateQuestion(qIndex, 'essayAnswer', e.target.value)}
                                                            className="w-full border rounded-md px-3 py-2 h-24"
                                                            placeholder="Enter reference answer"
                                                        ></textarea>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={question.note || ''}
                                                        onChange={(e) => updateQuestion(qIndex, 'note', e.target.value)}
                                                        className="w-full border rounded-md px-3 py-2"
                                                        placeholder="Add a note for this question"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditTest(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveTestChanges}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditCourse;
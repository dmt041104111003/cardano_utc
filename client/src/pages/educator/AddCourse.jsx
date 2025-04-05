/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import * as XLSX from 'xlsx';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useWallet } from '@meshsdk/react';

// Component cho Popup
const Popup = ({ title, onClose, children }) => (
  <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
    <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
      <h2 className='text-lg font-semibold mb-4'>{title}</h2>
      {children}
      <img src={assets.cross_icon} alt="" onClick={onClose} className='absolute top-4 right-4 w-4 cursor-pointer' />
    </div>
  </div>
);

// Component cho Chapter
const Chapter = ({ chapter, index, handleChapter, handleLecture }) => (
  <div className='bg-white border rounded-lg mb-4'>
    <div className='flex justify-between items-center p-4 border-b'>
      <div className='flex items-center'>
        <img onClick={() => handleChapter('toggle', chapter.chapterId)}
          className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
          src={assets.dropdown_icon} alt="dropdown icon" width={14} />
        <span className='font-semibold'>
          {index + 1}. {chapter.chapterTitle}
        </span>
      </div>
      <span>{chapter.chapterContent.length} Lectures</span>
      <img onClick={() => handleChapter('remove', chapter.chapterId)}
        src={assets.cross_icon} alt="" className='cursor-pointer' />
    </div>
    {!chapter.collapsed && (
      <div className='p-4'>
        {chapter.chapterContent.map((lecture, lectureIndex) => (
          <div className='flex justify-between items-center mb-2' key={lectureIndex}>
            <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">Link</a> - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
            <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} />
          </div>
        ))}
        <div className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2' onClick={() => handleLecture('add', chapter.chapterId)}>
          + Add Lecture
        </div>
      </div>
    )}
  </div>
);

// Component cho Test
const Test = ({ test, index, handleTest, handleChapter }) => (
  <div className='bg-white border rounded-lg mb-4'>
    <div className='flex justify-between items-center p-4 border-b'>
      <div className='flex items-center'>
        <img onClick={() => handleChapter('toggle', test.testId)}
          className={`mr-2 cursor-pointer transition-all ${test.collapsed && "-rotate-90"}`}
          src={assets.dropdown_icon} alt="dropdown icon" width={14} />
        <span className='font-semibold'>{test.testName}</span>
      </div>
      <span>{test.testContent.length} Test</span>
      <img onClick={() => handleChapter('removeTest', test.testId)}
        src={assets.cross_icon} alt="" className='cursor-pointer' />
    </div>
    {!test.collapsed && (
      <div className='p-4'>
        {test.testContent.map((testDetail, testIndex) => (
          <div className='flex justify-between items-center mb-2' key={testIndex}>
            <span>{testIndex + 1}. {testDetail.testTitle} - {testDetail.testDuration} min - {testDetail.testQuestions.length} questions </span>
            <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => handleTest('remove', testDetail.testId, testIndex)} />
          </div>
        ))}
        <div className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2' onClick={() => handleTest('add', test.testId)}>
          + Add Test
        </div>
      </div>
    )}
  </div>
);

const AddCourse = () => {

  const { backendUrl, getToken } = useContext(AppContext)
  const { connected, wallet } = useWallet();

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [test, setTest] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTestPopup, setShowTestPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [currentTestId, setCurrentTestId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });
  const [testDetail, setTestDetail] = useState({
    testTitle: '',
    testDuration: '',
    testQuestions: [],
  });
  const [walletAddress, setWalletAddress] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const questions = jsonData.map((row) => ({
          question: row[0],
          options: row.slice(1),
        }));

        setTestDetail({ ...testDetail, testQuestions: questions });
        console.log(questions);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    } else if (action === 'test') {
      const newTest = {
        testId: uniqid(),
        testName: "Test",
        testContent: [],
        collapsed: false,
        testOrder: test.length > 0 ? test.slice(-1)[0].testOrder + 1 : 1,
      };
      setTest([...test, newTest]);
    } else if (action === 'removeTest') {
      setTest(test.filter((test) => test.testId !== chapterId));
    }
  };

  const handleTest = (action, testId, testIndex) => {
    if (action === 'add') {
      setCurrentTestId(testId);
      setShowTestPopup(true);
    } else if (action === 'remove') {
      console.log(testId);
      setTest(
        test.map((test) => {
          if (test.testId === testId) {
            test.testContent.splice(testIndex, 1);
          }
          return test;
        })
      );
    }
  };

  const addTest = () => {
    setTest(
      test.map((t) => {
        if (t.testId === currentTestId) {
          const newTest = {
            ...testDetail,
            testId: uniqid(),
          };
          t.testContent.push(newTest);
        }
        return t;
      })
    );
    setShowTestPopup(false);
    setTestDetail({
      testTitle: '',
      testDuration: '',
      testQuestions: [],
    });
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0
              ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
              : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!image) {
        toast.error('Thumbnail Not Selected');
        return;
      }

      if (!connected || !wallet) {
        toast.error('Please connect your wallet first');
        return;
      }

      const token = await getToken();
      const courseId = uniqid();
      
      // Get wallet data
      const addresses = await wallet.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        toast.error('No wallet addresses found');
        return;
      }
      const address = addresses[0];

      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) {
        toast.error('No UTXOs found in wallet. Please add some ADA to your wallet.');
        return;
      }

      const collateral = await wallet.getCollateral();
      if (!collateral || collateral.length === 0) {
        toast.error('No collateral found in wallet. Please add collateral.');
        return;
      }

      // Create course data for blockchain
      const courseData = {
        courseId,
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        image: image,
        creatorId: address,
        createdAt: new Date().toISOString()
      };

      // Get unsigned transaction
      console.log('Sending to backend:', { courseData, utxos, collateral, address });
      
      const { data: txData } = await axios.post(
        `${backendUrl}/api/blockchain/create-course-tx`,
        {
          courseData,
          utxos,
          collateral,
          address
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'wallet-address': address
          } 
        }
      );

      console.log('Backend response:', txData);

      if (!txData || !txData.success) {
        toast.error(txData?.message || 'Failed to create transaction');
        return;
      }

      // Sign transaction with wallet
      const signedTx = await wallet.signTx(txData.unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      if (!txHash) {
        toast.error('Failed to submit transaction');
        return;
      }

      // Create form data for database
      const formData = new FormData();
      formData.append('courseData', JSON.stringify({
        ...courseData,
        courseContent: chapters,
        creatorAddress: address, // Add wallet address
        txHash // Add transaction hash
      }));
      formData.append('image', image);

      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'wallet-address': address
          } 
        }
      );

      if (data.success) {
        toast.success('Course created and minted successfully!');
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getUsedAddresses().then(addresses => {
        if (addresses && addresses.length > 0) {
          setWalletAddress(addresses[0]);
        }
      });
    } else {
      setWalletAddress('');
    }
  }, [connected, wallet]);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          />
          {!connected && (
            <p className="text-red-500 text-xs italic mt-1">
              Please connect your wallet to create a course
            </p>
          )}
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder='Type here' className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required />
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>
        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input onChange={e => setCoursePrice(e.target.value)} value={coursePrice} type="number" placeholder='0' className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required />
          </div>
          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
              <input type="file" id='thumbnailImage' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : null} alt="" />
            </label>
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <p>Discount %</p>
          <input onChange={e => setDiscount(e.target.value)} value={discount} type="number" placeholder='0' min={0} max={100} className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required />
        </div>
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <Chapter key={chapterIndex} chapter={chapter} index={chapterIndex} handleChapter={handleChapter} handleLecture={handleLecture} />
          ))}
          <div className='flex justify-center items-center bg-blue-100 mb-5 p-2 rounded-lg cursor-pointer' onClick={() => handleChapter('add')}>
            + Add Chapter
          </div>
          {test.map((test, testIndex) => (
            <Test key={testIndex} test={test} index={testIndex} handleTest={handleTest} handleChapter={handleChapter} />
          ))}
          <div className='flex justify-center items-center bg-red-100 p-2 mt-3 rounded-lg cursor-pointer' onClick={() => handleChapter('test')}>
            + Add Test
          </div>
        </div>
        {showPopup && (
          <Popup title="Add Lecture" onClose={() => setShowPopup(false)}>
            <div className="mb-2">
              <p>Lecture Title</p>
              <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>Duration (minutes)</p>
              <input type="number" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureDuration} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>Lecture URL</p>
              <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={lectureDetails.lectureUrl} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>Is Preview Free?</p>
              <input type="checkbox" className="mt-1 scale-125" checked={lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })} />
            </div>
            <button onClick={addLecture} type='button' className='w-full bg-blue-400 text-white px-4 py-2 rounded'>Add</button>
          </Popup>
        )}
        {showTestPopup && (
          <Popup title="Add Test" onClose={() => setShowTestPopup(false)}>
            <div className="mb-2">
              <p>Test Title</p>
              <input type="text" className="mt-1 block w-full border rounded py-1 px-2" value={testDetail.testTitle} onChange={(e) => setTestDetail({ ...testDetail, testTitle: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>Duration (minutes)</p>
              <input type="number" className="mt-1 block w-full border rounded py-1 px-2" value={testDetail.testDuration} onChange={(e) => setTestDetail({ ...testDetail, testDuration: e.target.value })} />
            </div>
            <div className="mb-2">
              <p>File question</p>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="mt-1 block w-full border rounded py-1 px-2"
                onChange={(e) => handleFileUpload(e)}
              />
            </div>
            <button onClick={addTest} type='button' className='w-full bg-blue-400 text-white px-4 py-2 rounded'>Add</button>
          </Popup>
        )}
        <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>ADD</button>
      </form>
    </div>
  );
};

export default AddCourse;

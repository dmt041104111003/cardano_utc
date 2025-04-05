import logo from './logo.svg'
import logo_dark from './logo_dark.svg'
import search_icon from './search_icon.svg'
import cross_icon from './cross_icon.svg'
import upload_area from './upload_area.svg'
import sketch from './sktech.svg'
import microsoft_logo from './microsoft_logo.svg'
import walmart_logo from './walmart_logo.svg'
import accenture_logo from './accenture_logo.svg'
import adobe_logo from './adobe_logo.svg'
import paypal_logo from './paypal_logo.svg'
import course_1_thumbnail from './course_1.png'
import course_2_thumbnail from './course_2.png'
import course_3_thumbnail from './course_3.png'
import course_4_thumbnail from './course_4.png'
import star from './rating_star.svg'
import star_blank from './star_dull_icon.svg'
import profile_img_1 from './profile_img_1.png'
import profile_img_2 from './profile_img_2.png'
import profile_img_3 from './profile_img_3.png'
import arrow_icon from './arrow_icon.svg'
import down_arrow_icon from './down_arrow_icon.svg'
import time_left_clock_icon from './time_left_clock_icon.svg'
import time_clock_icon from './time_clock_icon.svg'
import user_icon from './user_icon.svg'
import home_icon from './home_icon.svg'
import add_icon from './add_icon.svg'
import my_course_icon from './my_course_icon.svg'
import person_tick_icon from './person_tick_icon.svg'
import facebook_icon from './facebook_icon.svg'
import instagram_icon from './instagram_icon.svg'
import twitter_icon from './twitter_icon.svg'
import file_upload_icon from './file_upload_icon.svg'
import appointments_icon from './appointments_icon.svg'
import earning_icon from './earning_icon.svg'
import dropdown_icon from './dropdown_icon.svg'
import patients_icon from './patients_icon.svg'
import play_icon from './play_icon.svg'
import blue_tick_icon from './blue_tick_icon.svg'
import course_4 from './course_4.png'
import profile_img from './profile_img.png'
import profile_img2 from './profile_img2.png'
import profile_img3 from './profile_img3.png'
import lesson_icon from './lesson_icon.svg'
import ada_cardano_icon from './ada_cardano_icon.svg'
import exam_icon from './exam_icon.svg'
import next_icon from './next_icon.svg'
import prev_icon from './prev_icon.svg'
import certificate_background from './certificate.jpg'
import notification_icon from './notifications_24dp.svg'
import background_educator from './bg_educator.png'
import edit_icon from './edit_icon.svg'

export const assets = {
    background_educator,
    notification_icon,
    ada_cardano_icon,
    exam_icon,
    logo,
    search_icon,
    sketch,
    microsoft_logo,
    walmart_logo,
    accenture_logo,
    adobe_logo,
    paypal_logo,
    course_1_thumbnail,
    course_2_thumbnail,
    course_3_thumbnail,
    course_4_thumbnail,
    star,
    star_blank,
    profile_img_1,
    profile_img_2,
    profile_img_3,
    arrow_icon,
    dropdown_icon,
    cross_icon,
    upload_area,
    logo_dark,
    down_arrow_icon,
    time_left_clock_icon,
    time_clock_icon,
    user_icon,
    home_icon,
    add_icon,
    my_course_icon,
    person_tick_icon,
    facebook_icon,
    instagram_icon,
    twitter_icon,
    course_4,
    file_upload_icon,
    appointments_icon,
    earning_icon,
    patients_icon,
    profile_img,
    profile_img2,
    profile_img3,
    play_icon,
    blue_tick_icon,
    lesson_icon,
    next_icon,
    prev_icon,
    certificate_background,
    edit_icon,
}

export const dummyEducatorData = {
    "_id": "675ac1512100b91a6d9b8b24",
    "name": "GreatStack",
    "email": "user.greatstack@gmail.com",
    "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yclFkaDBOMmFqWnBoTTRBOXZUanZxVlo0aXYifQ",
    "createdAt": "2024-12-12T10:56:17.930Z",
    "updatedAt": "2024-12-12T10:56:17.930Z",
    "__v": 0
}

export const dummyTestimonial = [
    {
        name: 'Nguyen Van An',
        role: 'Student',
        image: assets.profile_img_1,
        rating: 5,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
    {
        name: 'Richard Nelson',
        role: 'Teacher',
        image: assets.profile_img_2,
        rating: 4,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
    {
        name: 'Ha Viet Hoang',
        role: 'Student',
        image: assets.profile_img_3,
        rating: 4.5,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
];

export const dummyDashboardData = {
    "totalEarnings": 707.38,
    "enrolledStudentsData": [
        {
            "courseTitle": "Introduction to JavaScript",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Phan Dinh Nghia",
                "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
            }
        },
        {
            "courseTitle": "Advanced Python Programming",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Dao Manh Tung",
                "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
            }
        },
        {
            "courseTitle": "Web Development Bootcamp",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Bui Dinh Giang",
                "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
            }
        },
        {
            "courseTitle": "Data Science with Python",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Nguyen Hoai Nam",
                "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
            }
        },
        {
            "courseTitle": "Cybersecurity Basics",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Nguyen Viet Hung",
                "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
            }
        }
    ],
    "totalCourses": 8
}

export const dummyStudentEnrolled = [
    {
        "student": {
            "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "name": "Nguyen Van A",
            "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
        },
        "courseTitle": "Introduction to JavaScript",
        "purchaseDate": "2024-12-20T08:39:55.509Z"
    },
    {
        "student": {
            "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "name": "Nguyen Van B",
            "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
        },
        "courseTitle": "Introduction to JavaScript",
        "purchaseDate": "2024-12-20T08:59:49.964Z"
    },
    {
        "student": {
            "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "name": "Nguyen Van C",
            "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
        },
        "courseTitle": "Advanced Python Programming",
        "purchaseDate": "2024-12-20T11:03:42.931Z"
    },
    {
        "student": {
            "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "name": "Nguyen Van E",
            "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVFsdmFMSkw3ckIxNHZMU2o4ZURWNEtmR2IifQ"
        },
        "courseTitle": "Web Development Bootcamp",
        "purchaseDate": "2024-12-20T11:04:48.798Z"
    }
]

export const dummyCourses = [
    {
        "_id": "605c72efb3f1c2b1f8e4e1a1",
        "courseTitle": "Tự học lập trình Javascript cơ bản chỉ trong 1 giờ ",
        "courseDescription": "<h2>Learn the Basics of JavaScript</h2><p>JavaScript is a versatile programming language that powers the web. In this course, you will learn the fundamentals of JavaScript, including syntax, data types, and control structures.</p><p>This course is perfect for beginners who want to start their journey in web development. By the end of this course, you will be able to create interactive web pages and understand the core concepts of JavaScript.</p><ul><li>Understand the basics of programming</li><li>Learn how to manipulate the DOM</li><li>Create dynamic web applications</li></ul>",
        "coursePrice": 49.99,
        "isPublished": true,
        "discount": 20,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Getting Started with JavaScript",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "What is JavaScript?",
                        "lectureDuration": 16,
                        "lectureUrl": "https://youtu.be/0SJE9dYdpps?si=tcyfQI2Ib20sonGY",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Setting Up Your Environment",
                        "lectureDuration": 19,
                        "lectureUrl": "https://youtu.be/efI98nT8Ffo?si=yMoHm5o8rnQihKCg",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Variables and Data Types",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Understanding Variables",
                        "lectureDuration": 20,
                        "lectureUrl": "https://youtu.be/CLbx37dqYEI?si=8urBymRp5psQTFNX",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Data Types in JavaScript",
                        "lectureDuration": 10,
                        "lectureUrl": "https://youtu.be/CLbx37dqYEI?si=8urBymRp5psQTFNX",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;",
                            "variable a = 40;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let",
                            "define"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "Which method is used to convert a string to an integer in JavaScript?",
                        "options": [
                            "parseInt()",
                            "toInteger()",
                            "stringToInt()",
                            "convertInt()"
                        ],
                        "answer": "parseInt()",
                        "questionOrder": 3
                    },
                    {
                        "questionId": "question4",
                        "questionText": "Which symbol is used for single-line comments in JavaScript?",
                        "options": [
                            "//",
                            "/* */",
                            "#",
                            "--"
                        ],
                        "answer": "//",
                        "questionOrder": 4
                    },
                    {
                        "questionId": "question5",
                        "questionText": "How do you declare a constant variable in JavaScript?",
                        "options": [
                            "const x = 10;",
                            "let x = 10;",
                            "var x = 10;",
                            "final x = 10;"
                        ],
                        "answer": "const x = 10;",
                        "questionOrder": 5
                    },
                    {
                        "questionId": "question6",
                        "questionText": "Which function is used to output a message in the console?",
                        "options": [
                            "console.log()",
                            "print()",
                            "log.console()",
                            "echo()"
                        ],
                        "answer": "console.log()",
                        "questionOrder": 6
                    },
                    {
                        "questionId": "question7",
                        "questionText": "Which event occurs when a user clicks on an HTML element?",
                        "options": [
                            "onmouseover",
                            "onchange",
                            "onclick",
                            "onload"
                        ],
                        "answer": "onclick",
                        "questionOrder": 7
                    },
                    {
                        "questionId": "question8",
                        "questionText": "Which method removes the last element from an array in JavaScript?",
                        "options": [
                            "pop()",
                            "shift()",
                            "removeLast()",
                            "delete()"
                        ],
                        "answer": "pop()",
                        "questionOrder": 8
                    },
                    {
                        "questionId": "question9",
                        "questionText": "How do you create an array in JavaScript?",
                        "options": [
                            "let arr = []",
                            "let arr = {}",
                            "let arr = new Array",
                            "Both A and C"
                        ],
                        "answer": "Both A and C",
                        "questionOrder": 9
                    },
                    {
                        "questionId": "question10",
                        "questionText": "Which statement is used to stop the execution of a loop?",
                        "options": [
                            "break",
                            "continue",
                            "stop",
                            "exit"
                        ],
                        "answer": "break",
                        "questionOrder": 10
                    }, {
                        "questionId": "question11",
                        "questionText": "What is the correct way to create a function in JavaScript?",
                        "options": [
                            "function myFunction() {}",
                            "create myFunction() {}",
                            "def myFunction() {}",
                            "function: myFunction() {}"
                        ],
                        "answer": "function myFunction() {}",
                        "questionOrder": 11
                    },
                    {
                        "questionId": "question12",
                        "questionText": "Which operator is used to assign a value to a variable?",
                        "options": [
                            "=",
                            "==",
                            "===",
                            "=>"
                        ],
                        "answer": "=",
                        "questionOrder": 12
                    },
                    {
                        "questionId": "question13",
                        "questionText": "What is the output of 'typeof NaN' in JavaScript?",
                        "options": [
                            "number",
                            "undefined",
                            "NaN",
                            "string"
                        ],
                        "answer": "number",
                        "questionOrder": 13
                    },
                    {
                        "questionId": "question14",
                        "questionText": "Which method is used to add an element to the end of an array?",
                        "options": [
                            "push()",
                            "add()",
                            "append()",
                            "insert()"
                        ],
                        "answer": "push()",
                        "questionOrder": 14
                    },
                    {
                        "questionId": "question15",
                        "questionText": "How do you check if a variable is an array?",
                        "options": [
                            "Array.isArray()",
                            "isArray()",
                            "typeof",
                            "instanceof Array"
                        ],
                        "answer": "Array.isArray()",
                        "questionOrder": 15
                    },
                    {
                        "questionId": "question16",
                        "questionText": "Which keyword is used to create a class in JavaScript?",
                        "options": [
                            "class",
                            "function",
                            "object",
                            "define"
                        ],
                        "answer": "class",
                        "questionOrder": 16
                    },
                    {
                        "questionId": "question17",
                        "questionText": "What is the correct way to write a conditional statement in JavaScript?",
                        "options": [
                            "if (condition) {}",
                            "if condition {}",
                            "if {condition}",
                            "if (condition) then {}"
                        ],
                        "answer": "if (condition) {}",
                        "questionOrder": 17
                    },
                    {
                        "questionId": "question18",
                        "questionText": "Which method is used to remove the first element from an array?",
                        "options": [
                            "shift()",
                            "pop()",
                            "removeFirst()",
                            "delete()"
                        ],
                        "answer": "shift()",
                        "questionOrder": 18
                    },
                    {
                        "questionId": "question19",
                        "questionText": "What is the output of 'Boolean(0)' in JavaScript?",
                        "options": [
                            "true",
                            "false",
                            "undefined",
                            "NaN"
                        ],
                        "answer": "false",
                        "questionOrder": 19
                    },
                    {
                        "questionId": "question20",
                        "questionText": "Which method is used to convert a string to lowercase?",
                        "options": [
                            "toLowerCase()",
                            "lowercase()",
                            "toLower()",
                            "convertToLower()"
                        ],
                        "answer": "toLowerCase()",
                        "questionOrder": 20
                    },
                    {
                        "questionId": "question21",
                        "questionText": "What is the correct way to create an object in JavaScript?",
                        "options": [
                            "let obj = {}",
                            "let obj = new Object()",
                            "Both A and B",
                            "let obj = Object()"
                        ],
                        "answer": "Both A and B",
                        "questionOrder": 21
                    },
                    {
                        "questionId": "question22",
                        "questionText": "Which method is used to find the length of an array?",
                        "options": [
                            "length()",
                            "size()",
                            "count()",
                            "array.length"
                        ],
                        "answer": "array.length",
                        "questionOrder": 22
                    },
                    {
                        "questionId": "question23",
                        "questionText": "What is the output of 'null == undefined'?",
                        "options": [
                            "true",
                            "false",
                            "undefined",
                            "null"
                        ],
                        "answer": "true",
                        "questionOrder": 23
                    },
                    {
                        "questionId": "question24",
                        "questionText": "Which method is used to join two or more arrays?",
                        "options": [
                            "concat()",
                            "join()",
                            "merge()",
                            "combine()"
                        ],
                        "answer": "concat()",
                        "questionOrder": 24
                    },
                    {
                        "questionId": "question25",
                        "questionText": "What does JSON stand for?",
                        "options": [
                            "JavaScript Object Notation",
                            "JavaScript Online Notation",
                            "JavaScript Object Name",
                            "JavaScript Object Notation Syntax"
                        ],
                        "answer": "JavaScript Object Notation",
                        "questionOrder": 25
                    },
                    {
                        "questionId": "question26",
                        "questionText": "Which operator is used to compare both value and type?",
                        "options": [
                            "===",
                            "==",
                            "!=",
                            "!=="
                        ],
                        "answer": "===",
                        "questionOrder": 26
                    },
                    {
                        "questionId": "question27",
                        "questionText": "What is the purpose of the 'return' statement in a function?",
                        "options": [
                            "To exit the function",
                            "To return a value",
                            "Both A and B",
                            "To create a new function"
                        ],
                        "answer": "Both A and B",
                        "questionOrder": 27
                    },
                    {
                        "questionId": "question28",
                        "questionText": "Which method is used to convert a JSON string into a JavaScript object?",
                        "options": [
                            "JSON.parse()",
                            "JSON.stringify()",
                            "JSON.convert()",
                            "JSON.object()"
                        ],
                        "answer": "JSON.parse()",
                        "questionOrder": 28
                    },
                    {
                        "questionId": "question29",
                        "questionText": "What is the output of 'typeof []' in JavaScript?",
                        "options": [
                            "array",
                            "object",
                            "undefined",
                            "string"
                        ],
                        "answer": "object",
                        "questionOrder": 29
                    },
                    {
                        "questionId": "question30",
                        "questionText": "Which method is used to create a new array with the results of calling a provided function on every element in the calling array?",
                        "options": [
                            "map()",
                            "filter()",
                            "reduce()",
                            "forEach()"
                        ],
                        "answer": "map()",
                        "questionOrder": 30
                    },
                    {
                        "questionId": "question31",
                        "questionText": "What is the correct way to handle errors in JavaScript?",
                        "options": [
                            "try...catch",
                            "error...catch",
                            "catch...try",
                            "handle...error"
                        ],
                        "answer": "try...catch",
                        "questionOrder": 31
                    },
                    {
                        "questionId": "question32",
                        "questionText": "Which method is used to remove an element from a specific index in an array?",
                        "options": [
                            "splice()",
                            "slice()",
                            "remove()",
                            "delete()"
                        ],
                        "answer": "splice()",
                        "questionOrder": 32
                    },
                    {
                        "questionId": "question33",
                        "questionText": "What is the output of '1 + '1'' in JavaScript?",
                        "options": [
                            "2",
                            "'11'",
                            "undefined",
                            "NaN"
                        ],
                        "answer": "'11'",
                        "questionOrder": 33
                    },
                    {
                        "questionId": "question34",
                        "questionText": "Which keyword is used to define a block of code that will be executed if an error occurs?",
                        "options": [
                            "catch",
                            "throw",
                            "try",
                            "finally"
                        ],
                        "answer": "catch",
                        "questionOrder": 34
                    },
                    {
                        "questionId": "question35",
                        "questionText": "What is the purpose of the 'this' keyword in JavaScript?",
                        "options": [
                            "It refers to the global object",
                            "It refers to the current object",
                            "It refers to the previous object",
                            "It has no purpose"
                        ],
                        "answer": "It refers to the current object",
                        "questionOrder": 35
                    },
                    {
                        "questionId": "question36",
                        "questionText": "Which method is used to find the index of the first occurrence of a specified value in an array?",
                        "options": [
                            "indexOf()",
                            "findIndex()",
                            "search()",
                            "locate()"
                        ],
                        "answer": "indexOf()",
                        "questionOrder": 36
                    },
                    {
                        "questionId": "question37",
                        "questionText": "What is the output of 'Boolean(null)' in JavaScript?",
                        "options": [
                            "true",
                            "false",
                            "undefined",
                            "NaN"
                        ],
                        "answer": "false",
                        "questionOrder": 37
                    },
                    {
                        "questionId": "question38",
                        "questionText": "Which method is used to create a new string by replacing some or all matches of a pattern with a replacement?",
                        "options": [
                            "replace()",
                            "replaceAll()",
                            "substitute()",
                            "change()"
                        ],
                        "answer": "replace()",
                        "questionOrder": 38
                    },
                    {
                        "questionId": "question39",
                        "questionText": "What is the output of 'typeof {}' in JavaScript?",
                        "options": [
                            "object",
                            "array",
                            "null",
                            "undefined"
                        ],
                        "answer": "object",
                        "questionOrder": 39
                    },
                    {
                        "questionId": "question40",
                        "questionText": "What is the purpose of the 'let' keyword in JavaScript?",
                        "options": [
                            "To declare a variable with block scope",
                            "To declare a global variable",
                            "To declare a constant variable",
                            "To declare a variable with function scope"
                        ],
                        "answer": "To declare a variable with block scope",
                        "questionOrder": 40
                    }
                ]
            },
            {
                "testId": "test2",
                "testTitle": "JavaScript basic",
                "testDuration": 45,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [
            {
                "userId": "user_2qjlgkAqIMpiR2flWIRzvWKtE0w",
                "rating": 5,
                "_id": "6773e37360cb0ab974342314"
            }
        ],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2025-01-02T04:47:44.701Z",
        "__v": 4,
        "courseThumbnail": "https://i.ytimg.com/vi/NEgDBzHg9_c/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDOtv-BCBDJYVRUCwZ-1XFXNweuxA"
    },
    {
        "_id": "675ac1512100b91a6d9b8b24",
        "courseTitle": "Lập Trình Python",
        "courseDescription": "<h2>Deep Dive into Python Programming</h2><p>This course is designed for those who have a basic understanding of Python and want to take their skills to the next level. You will explore advanced topics such as decorators, generators, and context managers.</p><p>By the end of this course, you will be able to write efficient and clean Python code, and understand how to leverage Python's powerful features for real-world applications.</p><ul><li>Master advanced data structures</li><li>Implement object-oriented programming concepts</li><li>Work with libraries and frameworks</li></ul>",
        "coursePrice": 79.99,
        "isPublished": true,
        "discount": 15,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Advanced Data Structures",
                "chapterContent": [
                    {
                        "lectureId": " lecture1",
                        "lectureTitle": "Lists and Tuples",
                        "lectureDuration": 720,
                        "lectureUrl": "https://youtu.be/oFgg7K2tpfk?si=8RfVK4Ldr1rXnkAo",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Dictionaries and Sets",
                        "lectureDuration": 850,
                        "lectureUrl": "https://youtu.be/HyovJpkPSfY?si=p683L38VFi2mZThR",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Object-Oriented Programming",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Classes and Objects",
                        "lectureDuration": 900,
                        "lectureUrl": "https://youtu.be/wVboOz_O8rE?si=KoUnB_GXupc5qxti",
                        "isPreviewFree": true,
                        "isCompleted": false,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Inheritance and Polymorphism",
                        "lectureDuration": 950,
                        "lectureUrl": "https://youtu.be/WagJ-OjRtCM?si=OpLMw4ka7dt71KIls",
                        "isPreviewFree": false,
                        "isCompleted": true,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [
            {
                "userId": "user_2qjlgkAqIMpiR2flWIRzvWKtE0w",
                "rating": 5,
                "_id": "6776369244daad0f313d81a9"
            }
        ],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2025-01-02T06:47:54.446Z",
        "__v": 3,
        "courseThumbnail": "https://i.ytimg.com/vi/oFgg7K2tpfk/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCAKRI1eTTkcNfaPD3F1exxsKl3Ng"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1ae",
        "courseTitle": "Cybersecurity Basics",
        "courseDescription": "<h2>Protect Systems and Networks</h2><p>Cybersecurity is critical in today's digital age. This course introduces the fundamentals of cybersecurity, including threat analysis, ethical hacking, and secure programming practices.</p><p>By the end of this course, you will understand how to identify vulnerabilities and implement security measures effectively.</p><ul><li>Understand security protocols</li><li>Learn about encryption techniques</li><li>Conduct basic penetration testing</li></ul>",
        "coursePrice": 69.99,
        "isPublished": true,
        "discount": 15,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Introduction to Cybersecurity",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "What is Cybersecurity?",
                        "lectureDuration": 10,
                        "lectureUrl": "https://youtu.be/samplelink5",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Types of Cyber Threats",
                        "lectureDuration": 18,
                        "lectureUrl": "https://youtu.be/samplelink6",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Basic Security Practices",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Password Management",
                        "lectureDuration": 15,
                        "lectureUrl": "https://youtu.be/samplelink7",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Network Security Essentials",
                        "lectureDuration": 20,
                        "lectureUrl": "https://youtu.be/samplelink8",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-27T11:30:00.000Z",
        "updatedAt": "2024-12-31T04:14:49.773Z",
        "__v": 2,
        "courseThumbnail": "https://img.youtube.com/vi/jZFaMEqEqEQ/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a7",
        "courseTitle": "Web Development Bootcamp",
        "courseDescription": "<h2>Become a Full-Stack Web Developer</h2><p>This comprehensive bootcamp covers everything you need to know to become a full-stack web developer. From HTML and CSS to JavaScript and backend technologies, this course is designed to take you from beginner to job-ready.</p><p>Throughout the course, you will work on real-world projects, build a portfolio, and gain the skills necessary to succeed in the tech industry.</p><ul><li>Learn front-end and back-end development</li><li>Build responsive and dynamic web applications</li><li>Understand databases and server-side programming</li></ul>",
        "coursePrice": 99.99,
        "isPublished": true,
        "discount": 25,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "HTML & CSS Basics",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Introduction to HTML",
                        "lectureDuration": 600,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Styling with CSS",
                        "lectureDuration": 720,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "JavaScript Fundamentals",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "JavaScript Basics",
                        "lectureDuration": 800,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "DOM Manipulation",
                        "lectureDuration": 850,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2024-12-31T05:31:27.290Z",
        "__v": 2,
        "courseThumbnail": "https://img.youtube.com/vi/lpx2zFkapIk/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1ac",
        "courseTitle": "Cloud Computing Essentials",
        "courseDescription": "<h2>Master Cloud Fundamentals</h2><p>Learn the foundations of cloud computing and explore popular cloud platforms like AWS, Azure, and Google Cloud. This course is ideal for IT professionals and developers looking to transition to cloud-based solutions.</p><p>By the end of this course, you will understand cloud services, deployment models, and best practices for using cloud resources efficiently.</p><ul><li>Understand cloud architecture</li><li>Learn to work with AWS, Azure, and GCP</li><li>Explore serverless computing and storage solutions</li></ul>",
        "coursePrice": 69.99,
        "isPublished": true,
        "discount": 20,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Cloud Fundamentals",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "What is Cloud Computing?",
                        "lectureDuration": 600,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Cloud Service Models",
                        "lectureDuration": 720,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Exploring Cloud Platforms",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "AWS Basics",
                        "lectureDuration": 800,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Introduction to Google Cloud",
                        "lectureDuration": 850,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2024-12-31T05:32:55.357Z",
        "__v": 1,
        "courseThumbnail": "https://img.youtube.com/vi/0yboGn8errU/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1ad",
        "courseTitle": "Data Science with Python",
        "courseDescription": "<h2>Start Your Data Science Journey</h2><p>Data Science is one of the most in-demand fields in the world. This course teaches you the essentials of data analysis, visualization, and machine learning using Python. Learn libraries like Pandas, NumPy, Matplotlib, and Scikit-learn.</p><p>By the end of this course, you will be equipped to work on real-world data projects and gain insights from data.</p><ul><li>Data cleaning and preprocessing</li><li>Exploratory Data Analysis (EDA)</li><li>Build predictive models</li></ul>",
        "coursePrice": 89.99,
        "isPublished": true,
        "discount": 20,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Python for Data Science",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Python Basics",
                        "lectureDuration": 30,
                        "lectureUrl": "https://youtu.be/samplelink1",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Working with NumPy",
                        "lectureDuration": 25,
                        "lectureUrl": "https://youtu.be/samplelink2",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Data Visualization",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Introduction to Matplotlib",
                        "lectureDuration": 20,
                        "lectureUrl": "https://youtu.be/samplelink3",
                        "isPreviewFree": true,
                        "isCompleted": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Advanced Visualizations with Seaborn",
                        "lectureDuration": 25,
                        "lectureUrl": "https://youtu.be/samplelink4",
                        "isPreviewFree": false,
                        "isCompleted": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w",
            "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [
            {
                "userId": "user_2qjlgkAqIMpiR2flWIRzvWKtE0w",
                "rating": 5,
                "_id": "6773acf160cb0ab974342248"
            }
        ],
        "createdAt": "2024-12-27T10:00:00.000Z",
        "updatedAt": "2024-12-31T09:57:48.992Z",
        "__v": 3,
        "courseThumbnail": "https://img.youtube.com/vi/E4znbZgUWzA/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1aa",
        "courseTitle": "Data Science and Machine Learning",
        "courseDescription": "<h2>Unlock the Power of Data</h2><p>This course provides a comprehensive introduction to data science and machine learning. You will learn how to analyze data, build predictive models, and apply machine learning algorithms to real-world problems.</p><p>By the end of this course, you will have a solid understanding of data manipulation, visualization, and machine learning techniques, enabling you to make data-driven decisions.</p><ul><li>Understand data analysis and visualization</li><li>Learn machine learning algorithms and their applications</li><li>Work with popular data science libraries like Pandas and Scikit-Learn</li></ul>",
        "coursePrice": 89.99,
        "isPublished": true,
        "discount": 30,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Introduction to Data Science",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "What is Data Science?",
                        "lectureDuration": 600,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": false,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Data Collection and Cleaning",
                        "lectureDuration": 720,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,

                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Machine Learning Basics",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Supervised vs Unsupervised Learning",
                        "lectureDuration": 800,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": false,

                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Building Your First Model",
                        "lectureDuration": 850,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,

                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2025-01-02T06:53:59.753Z",
        "__v": 1,
        "courseThumbnail": "https://img.youtube.com/vi/631lFJdQvoo/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1ab",
        "courseTitle": "Introduction to Cybersecurity",
        "courseDescription": "<h2>Protect the Digital World</h2><p>This course covers the essentials of cybersecurity, including understanding threats, vulnerabilities, and how to secure systems against cyber-attacks. Ideal for beginners, this course will prepare you for a career in cybersecurity.</p><p>By the end of this course, you will be able to identify and mitigate risks, implement security best practices, and understand the fundamentals of encryption and network security.</p><ul><li>Understand common cybersecurity threats</li><li>Learn about encryption and secure communication</li><li>Explore tools for penetration testing</li></ul>",
        "coursePrice": 59.99,
        "isPublished": true,
        "discount": 15,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Cybersecurity Basics",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Introduction to Cybersecurity",
                        "lectureDuration": 700,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": false,

                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Understanding Cyber Threats",
                        "lectureDuration": 750,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,

                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Network Security Fundamentals",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Securing Networks",
                        "lectureDuration": 800,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": true,
                        "isCompleted": false,

                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Firewalls and VPNs",
                        "lectureDuration": 850,
                        "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
                        "isPreviewFree": false,
                        "isCompleted": false,

                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "tests": [
            {
                "testId": "test1",
                "testTitle": "JavaScript Quiz",
                "testDuration": 15,
                "questions": [
                    {
                        "questionId": "question1",
                        "questionText": "What is the correct way to declare a variable in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 1
                    },
                    {
                        "questionId": "question2",
                        "questionText": "Which keyword is used to declare a function in JavaScript?",
                        "options": [
                            "function",
                            "var",
                            "let"
                        ],
                        "answer": "function",
                        "questionOrder": 2
                    },
                    {
                        "questionId": "question3",
                        "questionText": "What is the correct way to access the value of a variable outside of a function in JavaScript?",
                        "options": [
                            "var x = 10;",
                            "let y = 20;",
                            "const z = 30;"
                        ],
                        "answer": "var x = 10;",
                        "questionOrder": 3
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2025-01-02T06:56:13.208Z",
        "__v": 1,
        "courseThumbnail": "https://img.youtube.com/vi/WbV3zRgpw_E/maxresdefault.jpg"
    }
]
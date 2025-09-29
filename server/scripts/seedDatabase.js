require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');

// Import all models
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Skill = require('../models/Skill');
const Slider = require('../models/Slider');
const AboutMember = require('../models/AboutMember');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const ContactMessage = require('../models/ContactMessage');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to database
    await database.connect();
    
    // Clear all existing data
    console.log('🧹 Clearing existing data...');
    const collections = [User, Course, Subject, Skill, Slider, AboutMember, Instructor, Student, Batch, ContactMessage];
    await Promise.all(collections.map(model => model.deleteMany({})));
    console.log('✅ All collections cleared');

    // ========== 1. CREATE ADMIN USER ==========
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@ssmtechnologies.co.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // ========== 2. CREATE SKILLS ==========
    console.log('🎯 Creating skills...');
    const skills = [
      { name: 'JavaScript', category: 'programming', level: 'intermediate', description: 'Modern JavaScript programming' },
      { name: 'Python', category: 'programming', level: 'intermediate', description: 'Python for web and data science' },
      { name: 'React', category: 'programming', level: 'advanced', description: 'React framework for building UIs' },
      { name: 'Node.js', category: 'programming', level: 'advanced', description: 'Server-side JavaScript development' },
      { name: 'MongoDB', category: 'programming', level: 'intermediate', description: 'NoSQL database management' },
      { name: 'HTML/CSS', category: 'programming', level: 'beginner', description: 'Web markup and styling' },
      { name: 'UI/UX Design', category: 'design', level: 'intermediate', description: 'User interface design' },
      { name: 'Digital Marketing', category: 'marketing', level: 'beginner', description: 'Online marketing strategies' },
      { name: 'SEO', category: 'marketing', level: 'intermediate', description: 'Search engine optimization' },
      { name: 'Data Analysis', category: 'data-science', level: 'intermediate', description: 'Data analysis and visualization' },
      { name: 'Machine Learning', category: 'data-science', level: 'advanced', description: 'ML algorithms and implementation' },
      { name: 'PHP', category: 'programming', level: 'intermediate', description: 'Server-side web development' },
      { name: 'MySQL', category: 'programming', level: 'intermediate', description: 'Relational database management' },
      { name: 'AWS', category: 'programming', level: 'advanced', description: 'Amazon Web Services cloud platform' },
      { name: 'Docker', category: 'programming', level: 'intermediate', description: 'Containerization technology' }
    ];

    const createdSkills = await Skill.insertMany(skills);
    console.log(`✅ Created ${createdSkills.length} skills`);

    // ========== 3. CREATE SUBJECTS ==========
    console.log('📚 Creating subjects...');
    const subjects = [
      {
        name: 'HTML & CSS Fundamentals',
        description: 'Learn the building blocks of web development with HTML5 and CSS3, responsive design principles.',
        syllabus: [
          { topic: 'HTML Structure and Semantic Elements', duration: '2 hours', description: 'Understanding HTML document structure' },
          { topic: 'CSS Styling and Layout', duration: '3 hours', description: 'CSS properties, selectors, and layout techniques' },
          { topic: 'Responsive Design with Media Queries', duration: '2 hours', description: 'Creating mobile-friendly websites' },
          { topic: 'CSS Flexbox and Grid Layout', duration: '2 hours', description: 'Modern layout systems' },
          { topic: 'CSS Animations and Transitions', duration: '1 hour', description: 'Adding interactive animations' }
        ]
      },
      {
        name: 'JavaScript Programming',
        description: 'Master modern JavaScript from basics to advanced concepts including ES6+ features.',
        syllabus: [
          { topic: 'JavaScript Fundamentals', duration: '3 hours', description: 'Variables, data types, operators, and control structures' },
          { topic: 'Functions and Scope', duration: '2 hours', description: 'Function declarations, expressions, and closures' },
          { topic: 'DOM Manipulation', duration: '3 hours', description: 'Interacting with web page elements' },
          { topic: 'Asynchronous JavaScript', duration: '3 hours', description: 'Promises, async/await, and API calls' },
          { topic: 'ES6+ Features', duration: '2 hours', description: 'Arrow functions, destructuring, modules' }
        ]
      },
      {
        name: 'React Development',
        description: 'Build modern, interactive web applications using React framework and ecosystem.',
        syllabus: [
          { topic: 'React Fundamentals', duration: '3 hours', description: 'Components, JSX, and props' },
          { topic: 'State Management with Hooks', duration: '3 hours', description: 'useState, useEffect, and custom hooks' },
          { topic: 'React Router for Navigation', duration: '2 hours', description: 'Client-side routing and navigation' },
          { topic: 'API Integration', duration: '2 hours', description: 'Fetching data and handling HTTP requests' },
          { topic: 'Testing React Applications', duration: '2 hours', description: 'Unit testing with Jest and React Testing Library' }
        ]
      },
      {
        name: 'Node.js Backend Development',
        description: 'Create robust, scalable server-side applications with Node.js, Express, and databases.',
        syllabus: [
          { topic: 'Node.js Runtime Environment', duration: '2 hours', description: 'Understanding Node.js and npm ecosystem' },
          { topic: 'Express.js Framework', duration: '3 hours', description: 'Building REST APIs with Express' },
          { topic: 'Database Integration', duration: '3 hours', description: 'Working with MongoDB and Mongoose ODM' },
          { topic: 'Authentication & Authorization', duration: '3 hours', description: 'JWT tokens, bcrypt, and security best practices' },
          { topic: 'Testing and Deployment', duration: '2 hours', description: 'Unit testing and cloud deployment' }
        ]
      },
      {
        name: 'Database Design with MongoDB',
        description: 'Learn NoSQL database design, optimization, and management with MongoDB.',
        syllabus: [
          { topic: 'MongoDB Fundamentals', duration: '2 hours', description: 'Understanding document databases and collections' },
          { topic: 'CRUD Operations', duration: '2 hours', description: 'Create, read, update, and delete operations' },
          { topic: 'Schema Design Patterns', duration: '2 hours', description: 'Embedding vs referencing, data modeling' },
          { topic: 'Aggregation Pipeline', duration: '3 hours', description: 'Complex queries and data transformations' },
          { topic: 'Performance and Indexing', duration: '2 hours', description: 'Query optimization and database indexing' }
        ]
      },
      {
        name: 'Python Programming Fundamentals',
        description: 'Master Python programming from basics to advanced concepts for various applications.',
        syllabus: [
          { topic: 'Python Syntax and Data Types', duration: '3 hours', description: 'Variables, strings, numbers, and basic operations' },
          { topic: 'Control Structures', duration: '2 hours', description: 'Conditional statements and loops' },
          { topic: 'Functions and Modules', duration: '3 hours', description: 'Function definition, parameters, and importing modules' },
          { topic: 'Object-Oriented Programming', duration: '3 hours', description: 'Classes, objects, inheritance, and polymorphism' },
          { topic: 'File Handling and Exception Management', duration: '2 hours', description: 'Working with files and error handling' }
        ]
      },
      {
        name: 'Data Science with Python',
        description: 'Learn data analysis, visualization, and machine learning using Python libraries.',
        syllabus: [
          { topic: 'NumPy for Numerical Computing', duration: '2 hours', description: 'Array operations and mathematical functions' },
          { topic: 'Pandas for Data Manipulation', duration: '3 hours', description: 'DataFrames, data cleaning, and analysis' },
          { topic: 'Data Visualization', duration: '3 hours', description: 'Creating charts with Matplotlib and Seaborn' },
          { topic: 'Statistical Analysis', duration: '3 hours', description: 'Descriptive and inferential statistics' },
          { topic: 'Machine Learning with Scikit-learn', duration: '4 hours', description: 'Classification, regression, and clustering algorithms' },
          { topic: 'Real-world Data Projects', duration: '3 hours', description: 'End-to-end data science projects' }
        ]
      },
      {
        name: 'Digital Marketing Strategy',
        description: 'Comprehensive digital marketing course covering all major online marketing channels.',
        syllabus: [
          { topic: 'Digital Marketing Overview', duration: '2 hours', description: 'Understanding the digital marketing landscape' },
          { topic: 'Search Engine Optimization (SEO)', duration: '4 hours', description: 'On-page, off-page, and technical SEO' },
          { topic: 'Pay-Per-Click Advertising (PPC)', duration: '3 hours', description: 'Google Ads and Facebook advertising' },
          { topic: 'Social Media Marketing', duration: '3 hours', description: 'Platform-specific marketing strategies' },
          { topic: 'Content Marketing', duration: '2 hours', description: 'Creating engaging content and content strategy' },
          { topic: 'Email Marketing', duration: '2 hours', description: 'Email campaigns and automation' },
          { topic: 'Analytics and Reporting', duration: '2 hours', description: 'Google Analytics and performance measurement' }
        ]
      },
      {
        name: 'UI/UX Design Principles',
        description: 'Learn user-centered design principles, prototyping tools, and design thinking methodology.',
        syllabus: [
          { topic: 'Design Thinking Process', duration: '2 hours', description: 'Understanding user needs and problem-solving' },
          { topic: 'User Research Methods', duration: '2 hours', description: 'Interviews, surveys, and user persona creation' },
          { topic: 'Wireframing and Prototyping', duration: '3 hours', description: 'Creating low and high-fidelity designs' },
          { topic: 'UI Design Tools', duration: '3 hours', description: 'Mastering Figma and Adobe XD' },
          { topic: 'Usability Testing', duration: '2 hours', description: 'Testing designs and iterating based on feedback' },
          { topic: 'Design Systems', duration: '2 hours', description: 'Creating consistent design languages' }
        ]
      },
      {
        name: 'PHP Web Development',
        description: 'Build dynamic websites and web applications using PHP and MySQL database.',
        syllabus: [
          { topic: 'PHP Fundamentals', duration: '3 hours', description: 'PHP syntax, variables, and basic programming concepts' },
          { topic: 'Working with HTML Forms', duration: '2 hours', description: 'Processing user input and form validation' },
          { topic: 'MySQL Database Integration', duration: '3 hours', description: 'Database connection, queries, and data manipulation' },
          { topic: 'Session Management', duration: '2 hours', description: 'User authentication and session handling' },
          { topic: 'Object-Oriented PHP', duration: '3 hours', description: 'Classes, objects, and MVC architecture' },
          { topic: 'Building a Complete Project', duration: '3 hours', description: 'Creating a full-featured web application' }
        ]
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // ========== 4. CREATE INSTRUCTOR USERS ==========
    console.log('👨‍🏫 Creating instructor users...');
    const instructorUsers = [
      {
        email: 'john.doe@ssmtech.com',
        password: 'Instructor@123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+91 98765 43211',
        whatsapp: '+91 98765 43211',
        role: 'instructor'
      },
      {
        email: 'priya.sharma@ssmtech.com',
        password: 'Instructor@123',
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '+91 98765 43212',
        whatsapp: '+91 98765 43212',
        role: 'instructor'
      },
      {
        email: 'amit.patel@ssmtech.com',
        password: 'Instructor@123',
        firstName: 'Amit',
        lastName: 'Patel',
        phone: '+91 98765 43213',
        whatsapp: '+91 98765 43213',
        role: 'instructor'
      },
      {
        email: 'sarah.johnson@ssmtech.com',
        password: 'Instructor@123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+91 98765 43214',
        whatsapp: '+91 98765 43214',
        role: 'instructor'
      }
    ];

    const createdInstructorUsers = await User.insertMany(instructorUsers);
    console.log(`✅ Created ${createdInstructorUsers.length} instructor users`);

    // ========== 5. CREATE STUDENT USERS ==========
    console.log('👨‍🎓 Creating student users...');
    const studentUsers = [
      {
        email: 'student1@example.com',
        password: 'Student@123',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        phone: '+91 98765 43220',
        whatsapp: '+91 98765 43220',
        role: 'student'
      },
      {
        email: 'student2@example.com',
        password: 'Student@123',
        firstName: 'Sneha',
        lastName: 'Gupta',
        phone: '+91 98765 43221',
        whatsapp: '+91 98765 43221',
        role: 'student'
      },
      {
        email: 'student3@example.com',
        password: 'Student@123',
        firstName: 'Vikash',
        lastName: 'Singh',
        phone: '+91 98765 43222',
        whatsapp: '+91 98765 43222',
        role: 'student'
      },
      {
        email: 'student4@example.com',
        password: 'Student@123',
        firstName: 'Anita',
        lastName: 'Verma',
        phone: '+91 98765 43223',
        whatsapp: '+91 98765 43223',
        role: 'student'
      },
      {
        email: 'student5@example.com',
        password: 'Student@123',
        firstName: 'Ravi',
        lastName: 'Agrawal',
        phone: '+91 98765 43224',
        whatsapp: '+91 98765 43224',
        role: 'student'
      }
    ];

    const createdStudentUsers = await User.insertMany(studentUsers);
    console.log(`✅ Created ${createdStudentUsers.length} student users`);

    // ========== 6. CREATE INSTRUCTOR PROFILES ==========
    console.log('👨‍🏫 Creating instructor profiles...');
    const instructors = [
      {
        user: createdInstructorUsers[0]._id,
        bio: 'John Doe is a seasoned full-stack developer with over 8 years of experience in building scalable web applications. He has worked with top tech companies like Google and Microsoft, specializing in React, Node.js, and cloud technologies. John is passionate about teaching and has mentored over 200 developers in their career journey. His expertise includes modern JavaScript frameworks, serverless architecture, and DevOps practices.',
        designation: 'Senior Full Stack Developer',
        experience: 8,
        specializations: ['React.js', 'Node.js', 'JavaScript', 'MongoDB', 'AWS', 'Docker'],
        skills: [createdSkills[0]._id, createdSkills[2]._id, createdSkills[3]._id, createdSkills[4]._id, createdSkills[13]._id],
        education: [
          { degree: 'B.Tech Computer Science', institution: 'IIT Delhi', year: 2015, grade: 'First Class' },
          { degree: 'M.Tech Software Engineering', institution: 'IIT Bombay', year: 2017, grade: 'Distinction' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.dev'
        },
        isApproved: true
      },
      {
        user: createdInstructorUsers[1]._id,
        bio: 'Dr. Priya Sharma is a data science expert with 6 years of experience in machine learning and analytics. She holds a PhD in Statistics from IISc Bangalore and has published 15+ research papers on predictive modeling and deep learning. Priya has worked with Fortune 500 companies to implement AI solutions and has helped over 300 students transition into data science careers. Her specializations include Python programming, machine learning algorithms, and big data analytics.',
        designation: 'Data Science Lead & PhD',
        experience: 6,
        specializations: ['Python', 'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics', 'AI'],
        skills: [createdSkills[1]._id, createdSkills[9]._id, createdSkills[10]._id],
        education: [
          { degree: 'B.Sc Mathematics', institution: 'Delhi University', year: 2016, grade: 'First Class' },
          { degree: 'M.Sc Statistics', institution: 'ISI Kolkata', year: 2018, grade: 'Gold Medal' },
          { degree: 'PhD Statistics & ML', institution: 'IISc Bangalore', year: 2022, grade: 'Summa Cum Laude' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/priyasharma',
          website: 'https://priyasharma-datascience.com'
        },
        isApproved: true
      },
      {
        user: createdInstructorUsers[2]._id,
        bio: 'Amit Patel is a digital marketing strategist with 5 years of experience helping businesses grow their online presence. He has managed digital campaigns for Fortune 500 companies, generating over $10 million in revenue. Amit specializes in SEO, SEM, social media marketing, and conversion optimization. He is Google Ads certified, Facebook Blueprint certified, and HubSpot certified. His data-driven approach to marketing has helped numerous businesses achieve 300%+ ROI on their digital investments.',
        designation: 'Digital Marketing Manager',
        experience: 5,
        specializations: ['SEO', 'Google Ads', 'Facebook Ads', 'Social Media Marketing', 'Content Strategy', 'Analytics'],
        skills: [createdSkills[7]._id, createdSkills[8]._id],
        education: [
          { degree: 'MBA Marketing', institution: 'IIM Ahmedabad', year: 2019, grade: 'Distinction' },
          { degree: 'B.Com', institution: 'Gujarat University', year: 2017, grade: 'First Class' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/amitpatel',
          twitter: 'https://twitter.com/amitpatel'
        },
        isApproved: true
      },
      {
        user: createdInstructorUsers[3]._id,
        bio: 'Sarah Johnson is a senior UI/UX designer with 4 years of experience creating user-centered designs for mobile and web applications. She has worked with both startups and established companies to improve user experience and increase conversion rates by up to 250%. Sarah is proficient in design tools like Figma, Adobe Creative Suite, and prototyping tools. She specializes in design thinking methodology, user research, and accessibility design. Her designs have won multiple awards and have been featured in design showcases.',
        designation: 'Senior UI/UX Designer',
        experience: 4,
        specializations: ['UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'User Testing', 'Accessibility'],
        skills: [createdSkills[6]._id],
        education: [
          { degree: 'B.Des Interaction Design', institution: 'NID Ahmedabad', year: 2020, grade: 'First Class' },
          { degree: 'Certification in UX Research', institution: 'Google', year: 2021, grade: 'Distinction' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          website: 'https://sarahjohnson.design'
        },
        isApproved: true
      }
    ];

    const createdInstructors = await Instructor.insertMany(instructors);
    console.log(`✅ Created ${createdInstructors.length} instructor profiles`);

    // ========== 7. CREATE STUDENT PROFILES ==========
    console.log('👨‍🎓 Creating student profiles...');
    const students = createdStudentUsers.map(user => ({
      user: user._id,
      enrolledCourses: [],
      batches: [],
      attendance: [],
      assignments: [],
      performance: {
        overallGrade: 0,
        attendancePercentage: 0,
        assignmentCompletion: 0
      }
    }));

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} student profiles`);

    // ========== 8. CREATE COURSES ==========
    console.log('🎓 Creating courses...');
    const courses = [
      {
        name: 'Full Stack Web Development Bootcamp',
        description: 'Complete full stack web development course covering HTML, CSS, JavaScript, React, Node.js, and MongoDB. This comprehensive 6-month program will take you from beginner to job-ready developer with hands-on projects, real-world applications, and industry best practices. Perfect for career changers and fresh graduates.',
        fees: 45000,
        duration: '6 months',
        structure: [
          'HTML5 & CSS3 Fundamentals with Responsive Design',
          'JavaScript Programming & ES6+ Advanced Features',
          'React.js Development with Hooks and Context API',
          'Node.js Backend Development with Express Framework',
          'MongoDB Database Design and Integration',
          'RESTful API Development and Authentication',
          'Version Control with Git and GitHub',
          'Deployment with AWS and Heroku',
          'Testing and Debugging Techniques',
          'Capstone Project Development'
        ],
        subjects: [
          createdSubjects[0]._id,
          createdSubjects[1]._id,
          createdSubjects[2]._id,
          createdSubjects[3]._id,
          createdSubjects[4]._id
        ],
        instructor: createdInstructors[0]._id,
        enrollmentCount: 45,
        rating: 4.8
      },
      {
        name: 'Data Science & Machine Learning Masterclass',
        description: 'Comprehensive data science course covering Python programming, statistical analysis, machine learning algorithms, and deep learning. This 8-month program includes real-world projects, industry case studies, and hands-on experience with popular data science tools and libraries. Perfect for aspiring data scientists and analysts.',
        fees: 55000,
        duration: '8 months',
        structure: [
          'Python Programming Fundamentals for Data Science',
          'Statistics and Probability for Data Analysis',
          'Data Manipulation with Pandas and NumPy',
          'Data Visualization with Matplotlib, Seaborn, and Plotly',
          'Machine Learning Algorithms and Implementation',
          'Deep Learning with TensorFlow and Keras',
          'Natural Language Processing (NLP)',
          'Computer Vision and Image Processing',
          'Big Data Analytics with Apache Spark',
          'MLOps and Model Deployment',
          'Industry Capstone Projects'
        ],
        subjects: [
          createdSubjects[5]._id,
          createdSubjects[6]._id
        ],
        instructor: createdInstructors[1]._id,
        enrollmentCount: 32,
        rating: 4.9
      },
      {
        name: 'Digital Marketing Professional Course',
        description: 'Complete digital marketing course covering SEO, SEM, social media marketing, content marketing, email marketing, and analytics. This 4-month program includes Google Ads certification, Facebook Blueprint training, and hands-on campaign management experience. Get job-ready with industry-recognized certifications.',
        fees: 25000,
        duration: '4 months',
        structure: [
          'Digital Marketing Fundamentals and Strategy',
          'Search Engine Optimization (SEO) - Technical and Content',
          'Pay-Per-Click Advertising (Google Ads & Facebook Ads)',
          'Social Media Marketing Strategy and Implementation',
          'Content Marketing and Copywriting',
          'Email Marketing and Automation',
          'Influencer Marketing and Affiliate Marketing',
          'Web Analytics with Google Analytics 4',
          'Conversion Rate Optimization (CRO)',
          'Marketing Automation Tools',
          'Campaign Management and Client Handling'
        ],
        subjects: [createdSubjects[7]._id],
        instructor: createdInstructors[2]._id,
        enrollmentCount: 28,
        rating: 4.6
      },
      {
        name: 'UI/UX Design Complete Course',
        description: 'Master user interface and experience design with hands-on projects, design thinking methodology, and industry-standard tools like Figma and Adobe XD. This 5-month course covers everything from user research to prototype development, preparing you for a career in product design.',
        fees: 35000,
        duration: '5 months',
        structure: [
          'Design Thinking and User Research Methodology',
          'UI Design Principles and Visual Design',
          'UX Research Methods and User Persona Creation',
          'Wireframing and Information Architecture',
          'Prototyping with Figma and Adobe XD',
          'Interaction Design and Micro-interactions',
          'Usability Testing and User Feedback Analysis',
          'Design Systems and Component Libraries',
          'Mobile App Design for iOS and Android',
          'Accessibility and Inclusive Design',
          'Portfolio Development and Case Study Creation'
        ],
        subjects: [createdSubjects[8]._id],
        instructor: createdInstructors[3]._id,
        enrollmentCount: 22,
        rating: 4.7
      },
      {
        name: 'PHP & MySQL Web Development',
        description: 'Learn server-side web development with PHP and MySQL. Build dynamic websites, e-commerce platforms, and content management systems. This 3-month course covers PHP fundamentals, database design, security practices, and modern development frameworks.',
        fees: 20000,
        duration: '3 months',
        structure: [
          'PHP Fundamentals and Syntax',
          'MySQL Database Design and Queries',
          'Form Processing and Data Validation',
          'Session Management and User Authentication',
          'Object-Oriented Programming in PHP',
          'MVC Architecture and Design Patterns',
          'E-commerce Development with PayPal Integration',
          'Content Management System Development',
          'Security Best Practices and SQL Injection Prevention',
          'RESTful API Development with PHP',
          'Deployment and Web Hosting'
        ],
        subjects: [createdSubjects[9]._id],
        instructor: createdInstructors[0]._id,
        enrollmentCount: 18,
        rating: 4.4
      },
      {
        name: 'Python Programming for Beginners',
        description: 'Start your programming journey with Python. Perfect for complete beginners who want to learn programming fundamentals, automation, and basic data analysis. This 2-month course provides a solid foundation for further specialization in web development, data science, or automation.',
        fees: 15000,
        duration: '2 months',
        structure: [
          'Python Installation and Development Environment Setup',
          'Python Basics: Variables, Data Types, and Operators',
          'Control Structures: Conditional Statements and Loops',
          'Data Structures: Lists, Tuples, Sets, and Dictionaries',
          'Functions and Modules',
          'Object-Oriented Programming Concepts',
          'File Handling and Exception Management',
          'Working with APIs and Web Scraping',
          'Automation Scripts and Task Scheduling',
          'Introduction to Data Analysis with Pandas',
          'Mini Projects and Portfolio Building'
        ],
        subjects: [createdSubjects[5]._id],
        instructor: createdInstructors[1]._id,
        enrollmentCount: 35,
        rating: 4.5
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // ========== 9. ADD COURSE REVIEWS ==========
    console.log('⭐ Adding course reviews...');
    
    // Full Stack Development Reviews
    await Course.findByIdAndUpdate(createdCourses[0]._id, {
      $push: {
        reviews: [
          {
            student: createdStudents[0]._id,
            rating: 5,
            comment: 'Outstanding course! John sir explains complex concepts in the simplest way possible. The hands-on projects really helped me understand how everything works together. Got placed at a top IT company within 2 months of completion!',
            createdAt: new Date('2024-01-20')
          },
          {
            student: createdStudents[1]._id,
            rating: 5,
            comment: 'Best investment I made for my career! The curriculum is perfectly structured and covers all modern technologies. The support from instructors is amazing. Highly recommend to anyone looking to switch to tech.',
            createdAt: new Date('2024-01-25')
          },
        {
            student: createdStudents[2]._id,
            rating: 4,
            comment: 'Very comprehensive course with excellent project-based learning. The instructors are knowledgeable and always ready to help. Would definitely recommend for full-stack development.',
            createdAt: new Date('2024-02-01')
          }
        ]
      }
    });

    // Data Science Course Reviews
    await Course.findByIdAndUpdate(createdCourses[1]._id, {
      $push: {
        reviews: [
          {
            student: createdStudents[0]._id,
            rating: 5,
            comment: 'Dr. Priya Sharma is an exceptional instructor! Her deep knowledge of machine learning and practical approach made complex algorithms easy to understand. The real-world projects helped me build a strong portfolio.',
            createdAt: new Date('2024-02-10')
          },
          {
            student: createdStudents[2]._id,
            rating: 5,
            comment: 'Transformed my career completely! From zero programming knowledge to building ML models. The course structure is perfect and the support is outstanding. Got a data scientist role at a Fortune 500 company!',
            createdAt: new Date('2024-02-15')
          }
        ]
      }
    });

    // Digital Marketing Course Reviews
    await Course.findByIdAndUpdate(createdCourses[2]._id, {
      $push: {
        reviews: [
          {
            student: createdStudents[1]._id,
            rating: 4,
            comment: 'Excellent course for understanding digital marketing fundamentals. Amit sir shares valuable industry insights and practical tips. The Google Ads certification was a great bonus!',
            createdAt: new Date('2024-02-05')
          },
          {
            student: createdStudents[3]._id,
            rating: 5,
            comment: 'Perfect for working professionals! Weekend batches were convenient and the content is very practical. Increased my company\'s online revenue by 200% using the strategies learned here.',
            createdAt: new Date('2024-02-20')
          }
        ]
      }
    });

    // UI/UX Design Course Reviews
    await Course.findByIdAndUpdate(createdCourses[3]._id, {
      $push: {
        reviews: [
          {
            student: createdStudents[4]._id,
            rating: 5,
            comment: 'Sarah ma\'am is an amazing mentor! The course covers everything from user research to final design delivery. My portfolio looks professional now and I\'m confident about my design skills.',
            createdAt: new Date('2024-01-30')
          }
        ]
      }
    });

    console.log('✅ Course reviews added successfully');

    // ========== 10. CREATE BATCHES ==========
    console.log('📅 Creating batches with schedules...');
    const batches = [
      {
        name: 'Full Stack Development - Morning Batch A',
        course: createdCourses[0]._id,
        instructor: createdInstructors[0]._id,
        schedule: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', subject: createdSubjects[0]._id }, // Monday
          { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', subject: createdSubjects[1]._id }, // Wednesday
          { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', subject: createdSubjects[2]._id }  // Friday
        ],
        maxStudents: 25,
        enrolledStudents: [
          { student: createdStudents[0]._id, enrolledAt: new Date('2024-01-15'), status: 'active' },
          { student: createdStudents[1]._id, enrolledAt: new Date('2024-01-15'), status: 'active' },
          { student: createdStudents[2]._id, enrolledAt: new Date('2024-01-20'), status: 'active' }
        ],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        isActive: true
      },
      {
        name: 'Full Stack Development - Evening Batch B',
        course: createdCourses[0]._id,
        instructor: createdInstructors[0]._id,
        schedule: [
          { dayOfWeek: 2, startTime: '18:00', endTime: '21:00', subject: createdSubjects[0]._id }, // Tuesday
          { dayOfWeek: 4, startTime: '18:00', endTime: '21:00', subject: createdSubjects[1]._id }, // Thursday
          { dayOfWeek: 6, startTime: '18:00', endTime: '21:00', subject: createdSubjects[2]._id }  // Saturday
        ],
        maxStudents: 25,
        enrolledStudents: [
          { student: createdStudents[3]._id, enrolledAt: new Date('2024-01-25'), status: 'active' },
          { student: createdStudents[4]._id, enrolledAt: new Date('2024-01-25'), status: 'active' }
        ],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        isActive: true
      },
      {
        name: 'Data Science Masterclass - Weekday Batch',
        course: createdCourses[1]._id,
        instructor: createdInstructors[1]._id,
        schedule: [
          { dayOfWeek: 1, startTime: '14:00', endTime: '17:00', subject: createdSubjects[5]._id }, // Monday
          { dayOfWeek: 3, startTime: '14:00', endTime: '17:00', subject: createdSubjects[6]._id }, // Wednesday
          { dayOfWeek: 5, startTime: '14:00', endTime: '17:00', subject: createdSubjects[6]._id }  // Friday
        ],
        maxStudents: 20,
        enrolledStudents: [
          { student: createdStudents[0]._id, enrolledAt: new Date('2024-01-10'), status: 'active' },
          { student: createdStudents[2]._id, enrolledAt: new Date('2024-01-12'), status: 'active' }
        ],
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-09-15'),
        isActive: true
      },
      {
        name: 'Digital Marketing - Weekend Batch',
        course: createdCourses[2]._id,
        instructor: createdInstructors[2]._id,
        schedule: [
          { dayOfWeek: 0, startTime: '10:00', endTime: '13:00', subject: createdSubjects[7]._id }, // Sunday
          { dayOfWeek: 6, startTime: '10:00', endTime: '13:00', subject: createdSubjects[7]._id }  // Saturday
        ],
        maxStudents: 30,
        enrolledStudents: [
          { student: createdStudents[1]._id, enrolledAt: new Date('2024-02-01'), status: 'active' },
          { student: createdStudents[3]._id, enrolledAt: new Date('2024-02-01'), status: 'active' },
          { student: createdStudents[4]._id, enrolledAt: new Date('2024-02-05'), status: 'active' }
        ],
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-06-10'),
        isActive: true
      },
      {
        name: 'UI/UX Design - Evening Batch',
        course: createdCourses[3]._id,
        instructor: createdInstructors[3]._id,
        schedule: [
          { dayOfWeek: 2, startTime: '19:00', endTime: '21:30', subject: createdSubjects[8]._id }, // Tuesday
          { dayOfWeek: 4, startTime: '19:00', endTime: '21:30', subject: createdSubjects[8]._id }, // Thursday
          { dayOfWeek: 6, startTime: '16:00', endTime: '18:30', subject: createdSubjects[8]._id }  // Saturday
        ],
        maxStudents: 15,
        enrolledStudents: [
          { student: createdStudents[4]._id, enrolledAt: new Date('2024-01-20'), status: 'active' }
        ],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-01'),
        isActive: true
      }
    ];

    const createdBatches = await Batch.insertMany(batches);
    console.log(`✅ Created ${createdBatches.length} batches`);

    // ========== 11. UPDATE STUDENT ENROLLMENTS ==========
    console.log('🔄 Updating student enrollments...');
    
    // Student 1 - Enrolled in Full Stack and Data Science
    await Student.findByIdAndUpdate(createdStudents[0]._id, {
      $push: {
        enrolledCourses: [
          {
            course: createdCourses[0]._id,
            enrolledAt: new Date('2024-01-15'),
            progress: 35,
            completedSubjects: [createdSubjects[0]._id],
            status: 'active'
          },
          {
            course: createdCourses[1]._id,
            enrolledAt: new Date('2024-01-10'),
            progress: 50,
            completedSubjects: [createdSubjects[5]._id],
            status: 'active'
          }
        ],
        batches: [createdBatches[0]._id, createdBatches[2]._id]
      }
    });

    // Student 2 - Enrolled in Full Stack and Digital Marketing
    await Student.findByIdAndUpdate(createdStudents[1]._id, {
      $push: {
        enrolledCourses: [
          {
            course: createdCourses[0]._id,
            enrolledAt: new Date('2024-01-15'),
            progress: 40,
            completedSubjects: [createdSubjects[0]._id, createdSubjects[1]._id],
            status: 'active'
          },
          {
            course: createdCourses[2]._id,
            enrolledAt: new Date('2024-02-01'),
            progress: 25,
            status: 'active'
          }
        ],
        batches: [createdBatches[0]._id, createdBatches[3]._id]
      }
    });

    // Student 3 - Enrolled in Full Stack and Data Science
    await Student.findByIdAndUpdate(createdStudents[2]._id, {
      $push: {
        enrolledCourses: [
          {
            course: createdCourses[0]._id,
            enrolledAt: new Date('2024-01-20'),
            progress: 30,
            completedSubjects: [createdSubjects[0]._id],
            status: 'active'
          },
          {
            course: createdCourses[1]._id,
            enrolledAt: new Date('2024-01-12'),
            progress: 45,
            completedSubjects: [createdSubjects[5]._id],
            status: 'active'
          }
        ],
        batches: [createdBatches[0]._id, createdBatches[2]._id]
      }
    });

    // Student 4 - Enrolled in Full Stack Evening and Digital Marketing
    await Student.findByIdAndUpdate(createdStudents[3]._id, {
      $push: {
        enrolledCourses: [
          {
            course: createdCourses[0]._id,
            enrolledAt: new Date('2024-01-25'),
            progress: 20,
            status: 'active'
          },
          {
            course: createdCourses[2]._id,
            enrolledAt: new Date('2024-02-01'),
            progress: 30,
            status: 'active'
          }
        ],
        batches: [createdBatches[1]._id, createdBatches[3]._id]
      }
    });

    // Student 5 - Enrolled in Full Stack Evening and UI/UX
    await Student.findByIdAndUpdate(createdStudents[4]._id, {
      $push: {
        enrolledCourses: [
          {
            course: createdCourses[0]._id,
            enrolledAt: new Date('2024-01-25'),
            progress: 25,
            status: 'active'
          },
          {
            course: createdCourses[3]._id,
            enrolledAt: new Date('2024-01-20'),
            progress: 40,
            completedSubjects: [createdSubjects[8]._id],
            status: 'active'
          }
        ],
        batches: [createdBatches[1]._id, createdBatches[4]._id]
      }
    });

    console.log('✅ Student enrollments updated');

    // ========== 12. CREATE SLIDER CONTENT ==========
    console.log('🖼️ Creating homepage sliders...');
    const sliders = [
      {
        title: 'Welcome to SSM Technologies',
        description: 'Excellence in Education, Innovation in Learning - Transform Your Career with Industry-Expert Training',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        buttonText: 'Explore Courses',
        buttonLink: '/courses',
        order: 1,
        isActive: true
      },
      {
        title: 'Master In-Demand Skills',
        description: 'Learn cutting-edge technologies from industry experts with hands-on projects and real-world applications',
        imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
        buttonText: 'Start Learning',
        buttonLink: '/register',
        order: 2,
        isActive: true
      },
      {
        title: 'Transform Your Career',
        description: 'Join 5000+ successful students who have transitioned to high-paying tech careers with our guidance',
        imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        buttonText: 'Join Now',
        buttonLink: '/register',
        order: 3,
        isActive: true
      },
      {
        title: '95% Placement Success Rate',
        description: 'Get dedicated placement support, career guidance, and connect with our 200+ hiring partners',
        imageUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
        buttonText: 'View Success Stories',
        buttonLink: '/about',
        order: 4,
        isActive: true
      }
    ];

    const createdSliders = await Slider.insertMany(sliders);
    console.log(`✅ Created ${createdSliders.length} slider items`);

    // ========== 13. CREATE ABOUT MEMBERS ==========
    console.log('👥 Creating leadership team...');
    const aboutMembers = [
      {
        name: 'Dr. Rajesh Kumar',
        designation: 'Founder & CEO',
        bio: 'Dr. Rajesh Kumar is a visionary leader with over 15 years of experience in education technology and software development. He founded SSM Technologies with the mission to make quality technical education accessible to everyone. He holds a PhD in Computer Science from IIT Delhi and has previously worked with tech giants like Google and Microsoft as a Senior Engineering Manager. Under his leadership, SSM Technologies has successfully trained over 5000+ students and achieved a 95% placement rate. His expertise includes AI/ML, cloud computing, and educational technology innovation.',
        imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        order: 1,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/rajeshkumar',
          twitter: 'https://twitter.com/rajeshkumar'
        },
        isActive: true
      },
      {
        name: 'Dr. Priya Sharma',
        designation: 'Head of Academics & Data Science Lead',
        bio: 'Dr. Priya Sharma brings 12 years of academic excellence and industry experience to SSM Technologies. She holds a PhD in Statistics from IISc Bangalore and has published over 20 research papers in machine learning and data science. Previously, she worked as a Principal Data Scientist at Amazon and Microsoft, leading teams that developed ML models serving millions of users. At SSM Technologies, she ensures our curriculum meets the highest industry standards and incorporates the latest technological advancements. Her innovative teaching methodologies have been recognized by various educational institutions.',
        imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
        order: 2,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/priyasharma',
          website: 'https://priyasharma-research.com'
        },
        isActive: true
      },
      {
        name: 'Amit Patel',
        designation: 'Technical Director & Full Stack Lead',
        bio: 'Amit Patel is a seasoned software architect and technical leader with over 10 years of experience in full-stack development, cloud computing, and DevOps. He has worked as a Senior Software Engineer at Amazon and Flipkart, where he built scalable systems handling millions of transactions daily. At SSM Technologies, Amit leads our technical curriculum development and ensures hands-on learning experiences that mirror real-world industry practices. He is an AWS Certified Solutions Architect and regularly speaks at tech conferences about modern development practices.',
        imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        order: 3,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/amitpatel',
          github: 'https://github.com/amitpatel',
          website: 'https://amitpatel.tech'
        },
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        designation: 'Head of Placements & Industry Relations',
        bio: 'Sarah Johnson leads our placement and career services team with over 8 years of experience in talent acquisition and career counseling. She has built strong relationships with 200+ hiring partners including Google, Microsoft, Amazon, Flipkart, and numerous startups. Sarah holds an MBA in Human Resources from XLRI and is certified in career coaching from ICF. Her personalized approach to career guidance has helped maintain our industry-leading placement record. She has successfully placed students in roles with salary packages ranging from ₹8 LPA to ₹45 LPA.',
        imageUrl: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg',
        order: 4,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: 'https://twitter.com/sarahjohnson'
        },
        isActive: true
      }
    ];

    const createdAboutMembers = await AboutMember.insertMany(aboutMembers);
    console.log(`✅ Created ${createdAboutMembers.length} leadership members`);

    // ========== 14. CREATE CONTACT MESSAGES ==========
    console.log('📞 Creating sample contact messages...');
    const contactMessages = [
      {
        name: 'Rohit Sharma',
        email: 'rohit.sharma@email.com',
        phone: '+91 98765 43230',
        subject: 'Full Stack Development Course Inquiry',
        message: 'Hello, I am interested in your Full Stack Development course. I have basic knowledge of HTML and CSS but no experience with JavaScript. Could you please provide more details about the curriculum, batch timings, fee structure, and placement assistance? Also, do you offer any weekend batches for working professionals?',
        status: 'new',
        priority: 'medium'
      },
      {
        name: 'Anjali Verma',
        email: 'anjali.verma@email.com',
        phone: '+91 98765 43231',
        subject: 'Data Science Course - Weekend Availability',
        message: 'Hi there! I am currently working as a software engineer and interested in transitioning to data science. Do you offer weekend batches for the Data Science course? What are the prerequisites? I have programming experience in Java but haven\'t worked with Python much.',
        status: 'read',
        priority: 'medium'
      },
      {
        name: 'Vikash Singh',
        email: 'vikash.singh@email.com',
        phone: '+91 98765 43232',
        subject: 'Placement Assistance and Success Rate',
        message: 'I completed my B.Tech in Mechanical Engineering last year and want to switch to IT. What is your placement success rate? Do you provide guaranteed placement assistance? What kind of companies do your students get placed in? Please share some recent placement statistics.',
        status: 'replied',
        priority: 'high',
        reply: {
          message: 'Thank you for your interest in SSM Technologies! We have a 95% placement success rate. We provide 100% placement assistance to all our students with dedicated career counseling, interview preparation, and resume building support. Our students get placed in companies like TCS, Infosys, Wipro, Accenture, Amazon, Microsoft, and many promising startups. Recent salary packages range from ₹8 LPA to ₹45 LPA. Our placement team will work with you from day one to ensure you\'re job-ready upon course completion.',
          repliedBy: adminUser._id,
          repliedAt: new Date('2024-02-15')
        }
      },
      {
        name: 'Meera Patel',
        email: 'meera.patel@email.com',
        phone: '+91 98765 43233',
        subject: 'Course Fee Payment Options',
        message: 'I\'m interested in the UI/UX Design course. Can I pay the course fee in installments? What are the available payment options? Do you offer any scholarships or discounts for students? Also, is there any EMI facility available?',
        status: 'new',
        priority: 'medium'
      },
      {
        name: 'Arjun Kumar',
        email: 'arjun.kumar@email.com',
        phone: '+91 98765 43234',
        subject: 'Student Portal Access Issue - URGENT',
        message: 'I am currently enrolled in the Full Stack Development course (Batch A). I am having trouble accessing the student portal since yesterday. My login credentials are not working and I\'m missing important class materials. Please resolve this issue urgently as I have an assignment submission due tomorrow.',
        status: 'new',
        priority: 'urgent'
      },
      {
        name: 'Kavya Reddy',
        email: 'kavya.reddy@email.com',
        phone: '+91 98765 43235',
        subject: 'Corporate Training Inquiry',
        message: 'Hello, I represent a mid-size software company with around 50 employees. We are looking for corporate training in React.js and Node.js for our development team. Do you provide corporate training programs? What would be the cost and duration for such training?',
        status: 'read',
        priority: 'high'
      }
    ];

    const createdContactMessages = await ContactMessage.insertMany(contactMessages);
    console.log(`✅ Created ${createdContactMessages.length} contact messages`);

    // ========== 15. FINAL DATABASE SUMMARY ==========
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 COMPREHENSIVE DATA SUMMARY:');
    console.log('=====================================');
    
    const summaryData = {
      users: {
        admin: 1,
        instructors: createdInstructorUsers.length,
        students: createdStudentUsers.length,
        total: 1 + createdInstructorUsers.length + createdStudentUsers.length
      },
      content: {
        skills: createdSkills.length,
        subjects: createdSubjects.length,
        courses: createdCourses.length,
        batches: createdBatches.length,
        sliders: createdSliders.length,
        aboutMembers: createdAboutMembers.length,
        contactMessages: createdContactMessages.length
      },
      profiles: {
        instructors: createdInstructors.length,
        students: createdStudents.length
      }
    };

    console.log(`👥 Users: ${summaryData.users.total} total`);
    console.log(`   • Admin: ${summaryData.users.admin}`);
    console.log(`   • Instructors: ${summaryData.users.instructors}`);
    console.log(`   • Students: ${summaryData.users.students}`);
    console.log(`\n📚 Educational Content:`);
    console.log(`   • Skills: ${summaryData.content.skills}`);
    console.log(`   • Subjects: ${summaryData.content.subjects} (with detailed syllabus)`);
    console.log(`   • Courses: ${summaryData.content.courses} (with reviews & ratings)`);
    console.log(`   • Active Batches: ${summaryData.content.batches} (with schedules)`);
    console.log(`\n🎨 Website Content:`);
    console.log(`   • Homepage Sliders: ${summaryData.content.sliders}`);
    console.log(`   • Leadership Team: ${summaryData.content.aboutMembers}`);
    console.log(`   • Contact Messages: ${summaryData.content.contactMessages}`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('=====================================');
    console.log('🔐 ADMIN ACCESS:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: Admin@123456`);
    
    console.log('\n👨‍🏫 INSTRUCTOR ACCESS:');
    createdInstructorUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: Instructor@123`);
    });
    
    console.log('\n👨‍🎓 STUDENT ACCESS:');
    createdStudentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: Student@123`);
    });

    console.log('\n🎯 SAMPLE DATA HIGHLIGHTS:');
    console.log('=====================================');
    console.log('✅ Complete user management system with role-based access');
    console.log('✅ Comprehensive course catalog with detailed curricula');
    console.log('✅ Expert instructor profiles with real experience');
    console.log('✅ Student enrollment and progress tracking system');
    console.log('✅ Batch management with realistic schedules');
    console.log('✅ Course review and rating system');
    console.log('✅ Contact form management with priority levels');
    console.log('✅ Homepage content management system');
    console.log('✅ Skills-based instructor and course matching');
    console.log('✅ Industry-realistic course pricing and duration');
    console.log('✅ Multi-level course structure with learning paths');
    console.log('✅ Sample student enrollments across multiple courses');

    console.log('\n🚀 READY TO LAUNCH!');
    console.log('Your SSM Technologies platform is now ready with comprehensive sample data!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

// Execute the seeding function
seedDatabase();